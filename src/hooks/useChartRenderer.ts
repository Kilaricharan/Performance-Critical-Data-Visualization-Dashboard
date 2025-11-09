'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { DataPoint, Viewport, ChartBounds } from '@/lib/types';
import {
  dataToCanvas,
  calculateViewport,
  drawGrid,
  drawAxes,
  clearCanvas,
  setupHighDPICanvas
} from '@/lib/canvasUtils';
import { shouldUseLowDetail } from '@/lib/performanceUtils';

interface UseChartRendererOptions {
  width: number;
  height: number;
  data: DataPoint[];
  color?: string;
  viewport?: Viewport;
  showGrid?: boolean;
  showAxes?: boolean;
  pixelRatio?: number;
  onViewportChange?: (viewport: Viewport) => void;
}

export function useChartRenderer(options: UseChartRendererOptions) {
  const {
    width,
    height,
    data,
    color = '#3454d1',
    viewport: externalViewport,
    showGrid = true,
    showAxes = true,
    pixelRatio,
    onViewportChange
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);

  // Calculate viewport
  const viewport = useMemo(() => {
    if (externalViewport) return externalViewport;
    return calculateViewport(data);
  }, [externalViewport, data]);

  // Chart bounds (with padding for axes)
  const bounds = useMemo<ChartBounds>(() => {
    const padding = { left: 60, right: 20, top: 20, bottom: 40 };
    return {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom
    };
  }, [width, height]);

  // Determine if we should use low detail rendering
  const useLowDetail = useMemo(() => {
    // This would ideally use actual FPS, but for now use data point count
    return data.length > 50000;
  }, [data.length]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Setup high-DPI canvas
    const ratio = pixelRatio || window.devicePixelRatio || 1;
    setupHighDPICanvas(canvas, width, height);

    // Clear canvas
    clearCanvas(ctx, width * ratio, height * ratio, '#ffffff');
    ctx.scale(ratio, ratio);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, bounds, viewport, {
        gridColor: '#e0e0e0',
        gridLineWidth: 1
      });
    }

    // Draw axes
    if (showAxes) {
      drawAxes(ctx, bounds, viewport, {
        axisColor: '#333',
        labelColor: '#666',
        fontSize: 12
      });
    }

    // Render data points
    if (data.length > 0) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = useLowDetail ? Math.max(1, Math.floor(data.length / 2000)) : 1;
      let firstPoint = true;

      for (let i = 0; i < data.length; i += step) {
        const point = data[i];
        const { x, y } = dataToCanvas(point, bounds, viewport);

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
    }
  }, [width, height, data, color, bounds, viewport, showGrid, showAxes, useLowDetail, pixelRatio]);

  // Start render loop
  const startRenderLoop = useCallback(() => {
    if (isRenderingRef.current) return;

    isRenderingRef.current = true;
    const loop = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [render]);

  // Stop render loop
  const stopRenderLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isRenderingRef.current = false;
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupHighDPICanvas(canvas, width, height);
    render();
    startRenderLoop();

    return () => {
      stopRenderLoop();
    };
  }, [width, height, startRenderLoop, stopRenderLoop, render]);

  // Update render when data changes
  useEffect(() => {
    if (isRenderingRef.current) {
      // Render will be called in the next animation frame
    }
  }, [data, viewport]);

  return {
    canvasRef,
    viewport,
    bounds,
    render,
    startRenderLoop,
    stopRenderLoop
  };
}

