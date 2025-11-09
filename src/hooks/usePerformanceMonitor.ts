'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceMonitor } from '@/lib/performanceUtils';

export function usePerformanceMonitor(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    frameCount: 0,
    lastFrameTime: 0
  });

  const monitorRef = useRef(new PerformanceMonitor());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Measure frame performance
  const measureFrame = useCallback(() => {
    if (!enabled) return;
    monitorRef.current.measureFrame();
  }, [enabled]);

  // Update metrics periodically
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update metrics every second
    intervalRef.current = setInterval(() => {
      const newMetrics = monitorRef.current.getMetrics();
      setMetrics(newMetrics);
    }, 1000);

    // Start frame measurement loop
    const loop = () => {
      measureFrame();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, measureFrame]);

  // Measure data processing time
  const measureDataProcessing = useCallback(async <T,>(
    fn: () => T | Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      dataProcessingTime: Math.round((end - start) * 100) / 100
    }));
    
    return result;
  }, []);

  // Reset metrics
  const reset = useCallback(() => {
    monitorRef.current.reset();
    setMetrics({
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      dataProcessingTime: 0,
      frameCount: 0,
      lastFrameTime: 0
    });
  }, []);

  return {
    metrics,
    measureFrame,
    measureDataProcessing,
    reset
  };
}

