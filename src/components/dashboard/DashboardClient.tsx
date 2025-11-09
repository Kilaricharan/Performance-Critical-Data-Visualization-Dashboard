'use client';

import React, { useState, useCallback, useMemo, useTransition } from 'react';
import { DataPoint, ChartConfig, AggregationPeriod } from '@/lib/types';
import { DataProvider, useDataContext } from '@/components/providers/DataProvider';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import { useDataStream } from '@/hooks/useDataStream';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface DashboardClientProps {
  initialData: DataPoint[];
}

function DashboardContent() {
  const {
    filteredData,
    filters,
    aggregationPeriod,
    setFilters,
    setAggregationPeriod,
    setData
  } = useDataContext();

  const [selectedChartType, setSelectedChartType] = useState<ChartConfig['type']>('line');
  const [isPending, startTransition] = useTransition();
  
  const {
    data: streamData,
    isStreaming,
    stats,
    startStreaming,
    stopStreaming,
    resetData,
    addDataPoints
  } = useDataStream({
    updateInterval: 100,
    maxDataPoints: 10000,
    initialCount: 1000
  });

  const { metrics } = usePerformanceMonitor(true);

  // Update context data when stream data changes
  React.useEffect(() => {
    setData(streamData);
  }, [streamData, setData]);

  const chartConfigs: ChartConfig[] = useMemo(() => [
    { type: 'line', dataKey: 'value', color: '#3454d1', visible: true },
    { type: 'bar', dataKey: 'value', color: '#25b865', visible: selectedChartType === 'bar' },
    { type: 'scatter', dataKey: 'value', color: '#ffa500', visible: selectedChartType === 'scatter' },
    { type: 'heatmap', dataKey: 'value', color: '#d13b4c', visible: selectedChartType === 'heatmap' }
  ], [selectedChartType]);

  const currentConfig = useMemo(() => 
    chartConfigs.find(c => c.type === selectedChartType) || chartConfigs[0],
    [chartConfigs, selectedChartType]
  );

  const categories = useMemo(() => {
    return Array.from(new Set(streamData.map(d => d.category)));
  }, [streamData]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, [setFilters]);

  const handlePeriodChange = useCallback((period: AggregationPeriod['type']) => {
    startTransition(() => {
      setAggregationPeriod(period);
    });
  }, [setAggregationPeriod]);

  const [chartSize, setChartSize] = useState({ width: 800, height: 400 });

  React.useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('chart-container');
      if (container) {
        setChartSize({
          width: container.clientWidth - 40,
          height: 400
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1920px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          Performance Dashboard
        </h1>
        <p style={{ margin: '0.5rem 0', color: '#666' }}>
          Real-time data visualization with 10,000+ data points at 60fps
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PerformanceMonitor metrics={metrics} />
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Controls</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <button
                  onClick={isStreaming ? stopStreaming : startStreaming}
                  style={{
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    background: isStreaming ? '#d13b4c' : '#25b865',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
                </button>
                
                <button
                  onClick={resetData}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Reset Data
                </button>
                
                <button
                  onClick={() => addDataPoints(1000)}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Add 1000 Points
                </button>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <div>Data Points: {stats.count.toLocaleString()}</div>
                <div>Min: {stats.min.toFixed(2)}</div>
                <div>Max: {stats.max.toFixed(2)}</div>
                <div>Avg: {stats.avg.toFixed(2)}</div>
              </div>
            </div>

            <FilterPanel
              categories={categories}
              selectedCategories={filters.categories || []}
              minValue={filters.minValue}
              maxValue={filters.maxValue}
              onFilterChange={handleFilterChange}
            />

            <TimeRangeSelector
              selectedPeriod={aggregationPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>
        </aside>

        <main>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {chartConfigs.map(config => (
                <button
                  key={config.type}
                  onClick={() => setSelectedChartType(config.type)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: selectedChartType === config.type ? '#3454d1' : '#fff',
                    color: selectedChartType === config.type ? '#fff' : '#333',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: selectedChartType === config.type ? '600' : '400'
                  }}
                >
                  {config.type}
                </button>
              ))}
            </div>

            <div
              id="chart-container"
              style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {selectedChartType === 'line' && (
                <LineChart
                  data={filteredData}
                  width={chartSize.width}
                  height={chartSize.height}
                  color={currentConfig.color}
                />
              )}
              {selectedChartType === 'bar' && (
                <BarChart
                  data={filteredData}
                  width={chartSize.width}
                  height={chartSize.height}
                  color={currentConfig.color}
                />
              )}
              {selectedChartType === 'scatter' && (
                <ScatterPlot
                  data={filteredData}
                  width={chartSize.width}
                  height={chartSize.height}
                  color={currentConfig.color}
                />
              )}
              {selectedChartType === 'heatmap' && (
                <Heatmap
                  data={filteredData}
                  width={chartSize.width}
                  height={chartSize.height}
                />
              )}
            </div>
          </div>

          <DataTable data={filteredData} height={400} />
        </main>
      </div>
    </div>
  );
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  return (
    <DataProvider initialData={initialData}>
      <DashboardContent />
    </DataProvider>
  );
}

