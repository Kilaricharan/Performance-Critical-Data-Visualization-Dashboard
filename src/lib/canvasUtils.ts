import { DataPoint, Viewport, ChartBounds } from './types';

/**
 * Convert data point to canvas coordinates
 */
export function dataToCanvas(
  point: DataPoint,
  bounds: ChartBounds,
  viewport: Viewport
): { x: number; y: number } {
  const x = bounds.x + ((point.timestamp - viewport.xMin) / (viewport.xMax - viewport.xMin)) * bounds.width;
  const y = bounds.y + bounds.height - ((point.value - viewport.yMin) / (viewport.yMax - viewport.yMin)) * bounds.height;
  return { x, y };
}

/**
 * Convert canvas coordinates to data point
 */
export function canvasToData(
  canvasX: number,
  canvasY: number,
  bounds: ChartBounds,
  viewport: Viewport
): { timestamp: number; value: number } {
  const timestamp = viewport.xMin + ((canvasX - bounds.x) / bounds.width) * (viewport.xMax - viewport.xMin);
  const value = viewport.yMax - ((canvasY - bounds.y) / bounds.height) * (viewport.yMax - viewport.yMin);
  return { timestamp, value };
}

/**
 * Calculate optimal viewport from data
 */
export function calculateViewport(
  data: DataPoint[],
  padding: number = 0.1
): Viewport {
  if (data.length === 0) {
    return {
      xMin: Date.now() - 3600000,
      xMax: Date.now(),
      yMin: 0,
      yMax: 100
    };
  }

  const timestamps = data.map(p => p.timestamp);
  const values = data.map(p => p.value);

  const xMin = Math.min(...timestamps);
  const xMax = Math.max(...timestamps);
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  return {
    xMin: xMin - xRange * padding,
    xMax: xMax + xRange * padding,
    yMin: Math.max(0, yMin - yRange * padding),
    yMax: yMax + yRange * padding
  };
}

/**
 * Draw grid lines on canvas
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  viewport: Viewport,
  options: {
    gridColor?: string;
    gridLineWidth?: number;
    showVertical?: boolean;
    showHorizontal?: boolean;
  } = {}
): void {
  const {
    gridColor = '#e0e0e0',
    gridLineWidth = 1,
    showVertical = true,
    showHorizontal = true
  } = options;

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = gridLineWidth;

  // Vertical grid lines (time-based)
  if (showVertical) {
    const timeRange = viewport.xMax - viewport.xMin;
    const step = timeRange / 10;
    for (let i = 0; i <= 10; i++) {
      const x = bounds.x + (i / 10) * bounds.width;
      ctx.beginPath();
      ctx.moveTo(x, bounds.y);
      ctx.lineTo(x, bounds.y + bounds.height);
      ctx.stroke();
    }
  }

  // Horizontal grid lines (value-based)
  if (showHorizontal) {
    const valueRange = viewport.yMax - viewport.yMin;
    const step = valueRange / 10;
    for (let i = 0; i <= 10; i++) {
      const y = bounds.y + bounds.height - (i / 10) * bounds.height;
      ctx.beginPath();
      ctx.moveTo(bounds.x, y);
      ctx.lineTo(bounds.x + bounds.width, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw axes with labels
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  viewport: Viewport,
  options: {
    axisColor?: string;
    labelColor?: string;
    fontSize?: number;
    formatTimestamp?: (ts: number) => string;
    formatValue?: (val: number) => string;
  } = {}
): void {
  const {
    axisColor = '#333',
    labelColor = '#666',
    fontSize = 12,
    formatTimestamp = (ts: number) => new Date(ts).toLocaleTimeString(),
    formatValue = (val: number) => val.toFixed(1)
  } = options;

  ctx.save();
  ctx.strokeStyle = axisColor;
  ctx.fillStyle = labelColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // X-axis (bottom)
  ctx.beginPath();
  ctx.moveTo(bounds.x, bounds.y + bounds.height);
  ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
  ctx.stroke();

  // Y-axis (left)
  ctx.beginPath();
  ctx.moveTo(bounds.x, bounds.y);
  ctx.lineTo(bounds.x, bounds.y + bounds.height);
  ctx.stroke();

  // X-axis labels
  for (let i = 0; i <= 10; i++) {
    const timestamp = viewport.xMin + (i / 10) * (viewport.xMax - viewport.xMin);
    const x = bounds.x + (i / 10) * bounds.width;
    const label = formatTimestamp(timestamp);
    ctx.fillText(label, x, bounds.y + bounds.height + fontSize + 5);
  }

  // Y-axis labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 10; i++) {
    const value = viewport.yMin + (i / 10) * (viewport.yMax - viewport.yMin);
    const y = bounds.y + bounds.height - (i / 10) * bounds.height;
    const label = formatValue(value);
    ctx.fillText(label, bounds.x - 10, y);
  }

  ctx.restore();
}

/**
 * Clear canvas with optional background color
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor?: string
): void {
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Get device pixel ratio for high-DPI displays
 */
export function getPixelRatio(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
}

/**
 * Set up high-DPI canvas
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  const ratio = getPixelRatio();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  // Note: scaling is done in the render function to avoid double scaling
}

