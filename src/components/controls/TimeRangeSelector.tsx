'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { AggregationPeriod, TimeRange } from '@/lib/types';

interface TimeRangeSelectorProps {
  selectedPeriod: AggregationPeriod['type'];
  timeRange?: TimeRange;
  onPeriodChange: (period: AggregationPeriod['type']) => void;
  onTimeRangeChange?: (range: TimeRange) => void;
  className?: string;
}

const periods: AggregationPeriod[] = [
  { type: '1min', label: '1 Minute', milliseconds: 60000 },
  { type: '5min', label: '5 Minutes', milliseconds: 300000 },
  { type: '1hour', label: '1 Hour', milliseconds: 3600000 }
];

const TimeRangeSelector = memo(function TimeRangeSelector({
  selectedPeriod,
  timeRange,
  onPeriodChange,
  onTimeRangeChange,
  className
}: TimeRangeSelectorProps) {
  const handlePeriodClick = useCallback((period: AggregationPeriod['type']) => {
    onPeriodChange(period);
  }, [onPeriodChange]);

  const handleTimeRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    if (!onTimeRangeChange || !timeRange) return;
    
    const dateValue = new Date(e.target.value);
    if (isNaN(dateValue.getTime())) return;

    onTimeRangeChange({
      ...timeRange,
      [type]: dateValue.getTime()
    });
  }, [onTimeRangeChange, timeRange]);

  const selectedPeriodData = useMemo(() => {
    return periods.find(p => p.type === selectedPeriod) || periods[0];
  }, [selectedPeriod]);

  return (
    <div className={`time-range-selector ${className || ''}`} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Time Range</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Aggregation Period
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {periods.map(period => (
            <button
              key={period.type}
              onClick={() => handlePeriodClick(period.type)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: selectedPeriod === period.type ? '#3454d1' : '#fff',
                color: selectedPeriod === period.type ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedPeriod === period.type ? '600' : '400'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {onTimeRangeChange && timeRange && (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Custom Range
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: '#666' }}>Start:</label>
              <input
                type="datetime-local"
                value={new Date(timeRange.start).toISOString().slice(0, 16)}
                onChange={(e) => handleTimeRangeChange(e, 'start')}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.25rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: '#666' }}>End:</label>
              <input
                type="datetime-local"
                value={new Date(timeRange.end).toISOString().slice(0, 16)}
                onChange={(e) => handleTimeRangeChange(e, 'end')}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.25rem' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TimeRangeSelector.displayName = 'TimeRangeSelector';

export default TimeRangeSelector;

