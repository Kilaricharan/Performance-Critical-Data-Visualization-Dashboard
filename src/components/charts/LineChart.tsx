'use client';

import React, { useMemo, memo } from 'react';
import { DataPoint, Viewport } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  viewport?: Viewport;
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
}

const LineChart = memo(function LineChart({
  data,
  width,
  height,
  color = '#3454d1',
  viewport,
  showGrid = true,
  showAxes = true,
  className
}: LineChartProps) {
  const { canvasRef } = useChartRenderer({
    width,
    height,
    data,
    color,
    viewport,
    showGrid,
    showAxes
  });

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

LineChart.displayName = 'LineChart';

export default LineChart;

