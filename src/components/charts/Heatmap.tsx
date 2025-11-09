'use client';

import React, { useRef, useEffect, useMemo, memo } from 'react';
import { DataPoint, Viewport, ChartBounds } from '@/lib/types';
import {
  dataToCanvas,
  calculateViewport,
  drawGrid,
  drawAxes,
  clearCanvas,
  setupHighDPICanvas
} from '@/lib/canvasUtils';

interface HeatmapProps {
  data: DataPoint[];
  width: number;
  height: number;
  cellSize?: number;
  viewport?: Viewport;
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
}

const Heatmap = memo(function Heatmap({
  data,
  width,
  height,
  cellSize = 10,
  viewport: externalViewport,
  showGrid = true,
  showAxes = true,
  className
}: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const viewport = useMemo(() => {
    if (externalViewport) return externalViewport;
    return calculateViewport(data);
  }, [externalViewport, data]);

  const bounds = useMemo<ChartBounds>(() => {
    const padding = { left: 60, right: 20, top: 20, bottom: 40 };
    return {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom
    };
  }, [width, height]);

  // Color interpolation function
  const getColor = useMemo(() => {
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (value: number) => {
      if (range === 0) return 'rgb(52, 84, 209)';
      const normalized = (value - minValue) / range;
      const r = Math.floor(52 + (255 - 52) * normalized);
      const g = Math.floor(84 + (100 - 84) * normalized);
      const b = Math.floor(209 + (50 - 209) * normalized);
      return `rgb(${r}, ${g}, ${b})`;
    };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const ratio = window.devicePixelRatio || 1;
      setupHighDPICanvas(canvas, width, height);
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      
      clearCanvas(ctx, width * ratio, height * ratio, '#ffffff');
      ctx.scale(ratio, ratio);

      if (showGrid) {
        drawGrid(ctx, bounds, viewport, {
          gridColor: '#e0e0e0',
          gridLineWidth: 1
        });
      }

      if (showAxes) {
        drawAxes(ctx, bounds, viewport, {
          axisColor: '#333',
          labelColor: '#666',
          fontSize: 12
        });
      }

      if (data.length > 0) {
        ctx.save();
        
        // Create a grid of cells
        const timeStep = (viewport.xMax - viewport.xMin) / (bounds.width / cellSize);
        const valueStep = (viewport.yMax - viewport.yMin) / (bounds.height / cellSize);
        
        const cellMap = new Map<string, { count: number; sum: number }>();

        // Aggregate data into cells
        data.forEach(point => {
          const cellX = Math.floor((point.timestamp - viewport.xMin) / timeStep);
          const cellY = Math.floor((point.value - viewport.yMin) / valueStep);
          const key = `${cellX},${cellY}`;
          
          if (!cellMap.has(key)) {
            cellMap.set(key, { count: 0, sum: 0 });
          }
          const cell = cellMap.get(key)!;
          cell.count++;
          cell.sum += point.value;
        });

        // Render cells
        cellMap.forEach((cell, key) => {
          const [cellX, cellY] = key.split(',').map(Number);
          const avgValue = cell.sum / cell.count;
          const x = bounds.x + cellX * cellSize;
          const y = bounds.y + bounds.height - (cellY + 1) * cellSize;
          
          ctx.fillStyle = getColor(avgValue);
          ctx.fillRect(x, y, cellSize, cellSize);
        });

        ctx.restore();
      }
    };

    render();
    const loop = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, data, cellSize, bounds, viewport, showGrid, showAxes, getColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
    />
  );
});

Heatmap.displayName = 'Heatmap';

export default Heatmap;

