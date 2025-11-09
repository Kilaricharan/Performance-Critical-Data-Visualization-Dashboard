import { DataPoint } from './types';

export class DataGenerator {
  private baseTime: number;
  private categories: string[];
  private valueRange: { min: number; max: number };
  private trend: number;

  constructor() {
    this.baseTime = Date.now();
    this.categories = ['temperature', 'pressure', 'humidity', 'voltage', 'current'];
    this.valueRange = { min: 0, max: 100 };
    this.trend = 0;
  }

  /**
   * Generate a single data point with realistic time-series characteristics
   */
  generatePoint(category?: string, offset: number = 0): DataPoint {
    const categoryName = category || this.categories[Math.floor(Math.random() * this.categories.length)];
    const timestamp = this.baseTime + offset;
    
    // Add some realistic variation with trend
    this.trend += (Math.random() - 0.5) * 0.1;
    this.trend = Math.max(-2, Math.min(2, this.trend)); // Clamp trend
    
    const baseValue = 50 + this.trend * 10;
    const noise = (Math.random() - 0.5) * 10;
    const seasonal = Math.sin((offset / 1000) * 0.01) * 5;
    
    const value = Math.max(
      this.valueRange.min,
      Math.min(this.valueRange.max, baseValue + noise + seasonal)
    );

    return {
      timestamp,
      value: Math.round(value * 100) / 100,
      category: categoryName,
      metadata: {
        quality: Math.random() > 0.1 ? 'good' : 'warning',
        source: 'sensor-' + Math.floor(Math.random() * 10)
      }
    };
  }

  /**
   * Generate a batch of data points for initial load
   */
  generateBatch(count: number, startTime?: number): DataPoint[] {
    const start = startTime || this.baseTime;
    const points: DataPoint[] = [];
    const interval = 100; // 100ms intervals

    for (let i = 0; i < count; i++) {
      points.push(this.generatePoint(undefined, start + i * interval));
    }

    return points;
  }

  /**
   * Generate next data point for real-time updates
   */
  generateNext(lastTimestamp: number): DataPoint {
    return this.generatePoint(undefined, lastTimestamp + 100);
  }

  /**
   * Set value range for generated data
   */
  setValueRange(min: number, max: number): void {
    this.valueRange = { min, max };
  }

  /**
   * Set categories for generated data
   */
  setCategories(categories: string[]): void {
    this.categories = categories;
  }

  /**
   * Reset generator state
   */
  reset(): void {
    this.baseTime = Date.now();
    this.trend = 0;
  }
}

/**
 * Aggregate data points by time period
 */
export function aggregateData(
  data: DataPoint[],
  periodMs: number
): DataPoint[] {
  if (data.length === 0) return [];

  const aggregated: DataPoint[] = [];
  const buckets = new Map<number, DataPoint[]>();

  // Group data into time buckets
  data.forEach(point => {
    const bucketTime = Math.floor(point.timestamp / periodMs) * periodMs;
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(point);
  });

  // Aggregate each bucket
  buckets.forEach((points, bucketTime) => {
    const values = points.map(p => p.value);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    aggregated.push({
      timestamp: bucketTime,
      value: Math.round(avgValue * 100) / 100,
      category: points[0].category,
      metadata: {
        count: points.length,
        min: minValue,
        max: maxValue,
        avg: avgValue
      }
    });
  });

  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Filter data based on criteria
 */
export function filterData(
  data: DataPoint[],
  filters: {
    categories?: string[];
    minValue?: number;
    maxValue?: number;
    timeRange?: { start: number; end: number };
  }
): DataPoint[] {
  return data.filter(point => {
    if (filters.categories && !filters.categories.includes(point.category)) {
      return false;
    }
    if (filters.minValue !== undefined && point.value < filters.minValue) {
      return false;
    }
    if (filters.maxValue !== undefined && point.value > filters.maxValue) {
      return false;
    }
    if (filters.timeRange) {
      if (point.timestamp < filters.timeRange.start || point.timestamp > filters.timeRange.end) {
        return false;
      }
    }
    return true;
  });
}

