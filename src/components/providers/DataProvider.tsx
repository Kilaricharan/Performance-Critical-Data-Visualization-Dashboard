'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DataPoint, FilterOptions, AggregationPeriod, TimeRange } from '@/lib/types';
import { aggregateData, filterData } from '@/lib/dataGenerator';

interface DataContextValue {
  data: DataPoint[];
  filteredData: DataPoint[];
  filters: FilterOptions;
  aggregationPeriod: AggregationPeriod['type'];
  setData: (data: DataPoint[]) => void;
  setFilters: (filters: FilterOptions) => void;
  setAggregationPeriod: (period: AggregationPeriod['type']) => void;
  resetFilters: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  initialData?: DataPoint[];
}

const aggregationPeriods: Record<AggregationPeriod['type'], number> = {
  '1min': 60000,
  '5min': 300000,
  '1hour': 3600000
};

export function DataProvider({ children, initialData = [] }: DataProviderProps) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: []
  });
  const [aggregationPeriod, setAggregationPeriod] = useState<AggregationPeriod['type']>('1min');

  // Apply filters
  const filteredData = useMemo(() => {
    let result = data;

    // Apply category and value filters
    if (filters.categories && filters.categories.length > 0) {
      result = filterData(result, {
        categories: filters.categories,
        minValue: filters.minValue,
        maxValue: filters.maxValue,
        timeRange: filters.timeRange
      });
    } else if (filters.minValue !== undefined || filters.maxValue !== undefined || filters.timeRange) {
      result = filterData(result, {
        minValue: filters.minValue,
        maxValue: filters.maxValue,
        timeRange: filters.timeRange
      });
    }

    // Apply aggregation
    if (aggregationPeriod !== '1min' && result.length > 0) {
      result = aggregateData(result, aggregationPeriods[aggregationPeriod]);
    }

    return result;
  }, [data, filters, aggregationPeriod]);

  const resetFilters = useCallback(() => {
    setFilters({ categories: [] });
    setAggregationPeriod('1min');
  }, []);

  const value = useMemo(() => ({
    data,
    filteredData,
    filters,
    aggregationPeriod,
    setData,
    setFilters,
    setAggregationPeriod,
    resetFilters
  }), [data, filteredData, filters, aggregationPeriod, resetFilters]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
}

