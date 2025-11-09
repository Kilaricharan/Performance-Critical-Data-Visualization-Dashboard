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

interface BarChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  viewport?: Viewport;
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
}

const BarChart = memo(function BarChart({
  data,
  width,
  height,
  color = '#3454d1',
  viewport: externalViewport,
  showGrid = true,
  showAxes = true,
  className
}: BarChartProps) {
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

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = () => {
      const ratio = window.devicePixelRatio || 1;
      setupHighDPICanvas(canvas, width, height);
      // Get context after canvas setup
      const renderCtx = canvas.getContext('2d', { alpha: false });
      if (!renderCtx) return;
      
      clearCanvas(renderCtx, width * ratio, height * ratio, '#ffffff');
      renderCtx.scale(ratio, ratio);

      if (showGrid) {
        drawGrid(renderCtx, bounds, viewport, {
          gridColor: '#e0e0e0',
          gridLineWidth: 1
        });
      }

      if (showAxes) {
        drawAxes(renderCtx, bounds, viewport, {
          axisColor: '#333',
          labelColor: '#666',
          fontSize: 12
        });
      }

      if (data.length > 0) {
        renderCtx.save();
        renderCtx.fillStyle = color;
        
        const barWidth = Math.max(2, bounds.width / data.length * 0.8);
        const spacing = bounds.width / data.length;

        data.forEach((point, index) => {
          const { x, y } = dataToCanvas(point, bounds, viewport);
          const barHeight = bounds.y + bounds.height - y;
          
          renderCtx.fillRect(
            x - barWidth / 2,
            y,
            barWidth,
            barHeight
          );
        });

        renderCtx.restore();
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
  }, [width, height, data, color, bounds, viewport, showGrid, showAxes]);

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

BarChart.displayName = 'BarChart';

export default BarChart;

