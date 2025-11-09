'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataPoint } from '@/lib/types';
import { DataGenerator } from '@/lib/dataGenerator';

interface UseDataStreamOptions {
  updateInterval?: number; // milliseconds
  maxDataPoints?: number;
  initialCount?: number;
}

export function useDataStream(options: UseDataStreamOptions = {}) {
  const {
    updateInterval = 100,
    maxDataPoints = 10000,
    initialCount = 1000
  } = options;

  const [data, setData] = useState<DataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const generatorRef = useRef(new DataGenerator());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // Initialize data
  useEffect(() => {
    const initialData = generatorRef.current.generateBatch(initialCount);
    setData(initialData);
    if (initialData.length > 0) {
      lastTimestampRef.current = initialData[initialData.length - 1].timestamp;
    }
  }, [initialCount]);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (isStreaming) return;

    setIsStreaming(true);
    intervalRef.current = setInterval(() => {
      setData(prevData => {
        const newPoint = generatorRef.current.generateNext(
          lastTimestampRef.current || Date.now()
        );
        lastTimestampRef.current = newPoint.timestamp;

        // Maintain max data points by removing oldest
        const updated = [...prevData, newPoint];
        if (updated.length > maxDataPoints) {
          return updated.slice(-maxDataPoints);
        }
        return updated;
      });
    }, updateInterval);
  }, [isStreaming, updateInterval, maxDataPoints]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    stopStreaming();
    generatorRef.current.reset();
    const newData = generatorRef.current.generateBatch(initialCount);
    setData(newData);
    if (newData.length > 0) {
      lastTimestampRef.current = newData[newData.length - 1].timestamp;
    }
  }, [stopStreaming, initialCount]);

  // Add data points manually
  const addDataPoints = useCallback((count: number) => {
    setData(prevData => {
      const newPoints: DataPoint[] = [];
      let lastTs = prevData.length > 0 
        ? prevData[prevData.length - 1].timestamp 
        : Date.now();

      for (let i = 0; i < count; i++) {
        const point = generatorRef.current.generateNext(lastTs);
        newPoints.push(point);
        lastTs = point.timestamp;
      }

      const updated = [...prevData, ...newPoints];
      if (updated.length > maxDataPoints) {
        return updated.slice(-maxDataPoints);
      }
      return updated;
    });
  }, [maxDataPoints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Memoized data statistics
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        categories: []
      };
    }

    const values = data.map(d => d.value);
    const categories = Array.from(new Set(data.map(d => d.category)));

    return {
      count: data.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      categories
    };
  }, [data]);

  return {
    data,
    isStreaming,
    stats,
    startStreaming,
    stopStreaming,
    resetData,
    addDataPoints
  };
}

