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

interface ScatterPlotProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  pointSize?: number;
  viewport?: Viewport;
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
}

const ScatterPlot = memo(function ScatterPlot({
  data,
  width,
  height,
  color = '#3454d1',
  pointSize = 3,
  viewport: externalViewport,
  showGrid = true,
  showAxes = true,
  className
}: ScatterPlotProps) {
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
        ctx.fillStyle = color;
        
        // Use step to reduce rendering for large datasets
        const step = data.length > 10000 ? Math.max(1, Math.floor(data.length / 10000)) : 1;
        
        for (let i = 0; i < data.length; i += step) {
          const point = data[i];
          const { x, y } = dataToCanvas(point, bounds, viewport);
          
          ctx.beginPath();
          ctx.arc(x, y, pointSize, 0, Math.PI * 2);
          ctx.fill();
        }

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
  }, [width, height, data, color, pointSize, bounds, viewport, showGrid, showAxes]);

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

ScatterPlot.displayName = 'ScatterPlot';

export default ScatterPlot;

