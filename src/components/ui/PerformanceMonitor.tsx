'use client';

import React, { memo } from 'react';
import { PerformanceMetrics } from '@/lib/types';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  className?: string;
}

const PerformanceMonitor = memo(function PerformanceMonitor({
  metrics,
  className
}: PerformanceMonitorProps) {
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return '#25b865';
    if (fps >= 30) return '#ffa500';
    return '#d13b4c';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return '#25b865';
    if (memory < 100) return '#ffa500';
    return '#d13b4c';
  };

  return (
    <div className={`performance-monitor ${className || ''}`} style={{
      padding: '1rem',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Performance</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>FPS</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getFpsColor(metrics.fps)
          }}>
            {metrics.fps}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Memory</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getMemoryColor(metrics.memoryUsage)
          }}>
            {metrics.memoryUsage.toFixed(1)} MB
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Render Time</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            {metrics.renderTime.toFixed(2)} ms
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Data Processing</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            {metrics.dataProcessingTime.toFixed(2)} ms
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Frame Count</div>
          <div style={{ fontSize: '1rem', fontWeight: '500' }}>
            {metrics.frameCount.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

