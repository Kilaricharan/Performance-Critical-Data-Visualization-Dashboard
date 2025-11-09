import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastFrameTime: number = performance.now();
  private fps: number = 60;
  private frameTimes: number[] = [];
  private readonly maxFrameTimeHistory = 60;

  /**
   * Measure frame rendering performance
   */
  measureFrame(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    
    this.frameCount++;
    this.frameTimes.push(delta);
    
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }
    
    // Calculate FPS from average frame time
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgFrameTime);
    
    this.lastFrameTime = now;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const memory = (performance as any).memory 
      ? (performance as any).memory.usedJSHeapSize / 1048576 
      : 0;

    const avgFrameTime = this.frameTimes.length > 0
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      : 0;

    return {
      fps: this.fps,
      memoryUsage: Math.round(memory * 100) / 100,
      renderTime: Math.round(avgFrameTime * 100) / 100,
      dataProcessingTime: 0, // Will be set by data processing hooks
      frameCount: this.frameCount,
      lastFrameTime: this.lastFrameTime
    };
  }

  /**
   * Reset performance counters
   */
  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }
}

/**
 * Throttle function calls to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function calls to delay execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Check if we should use low detail rendering based on performance
 */
export function shouldUseLowDetail(fps: number, dataPointCount: number): boolean {
  return fps < 30 || dataPointCount > 50000;
}

