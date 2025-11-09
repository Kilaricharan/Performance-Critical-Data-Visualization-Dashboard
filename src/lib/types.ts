export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
  frameCount: number;
  lastFrameTime: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationPeriod {
  type: '1min' | '5min' | '1hour';
  label: string;
  milliseconds: number;
}

export interface FilterOptions {
  categories: string[];
  minValue?: number;
  maxValue?: number;
  timeRange?: TimeRange;
}

export interface ChartBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface RenderOptions {
  viewport?: Viewport;
  pixelRatio?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showLabels?: boolean;
}

