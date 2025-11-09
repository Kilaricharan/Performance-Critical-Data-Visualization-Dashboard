'use client';

import React, { memo, useCallback } from 'react';
import { FilterOptions } from '@/lib/types';

interface FilterPanelProps {
  categories: string[];
  selectedCategories: string[];
  minValue?: number;
  maxValue?: number;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const FilterPanel = memo(function FilterPanel({
  categories,
  selectedCategories,
  minValue,
  maxValue,
  onFilterChange,
  className
}: FilterPanelProps) {
  const handleCategoryToggle = useCallback((category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    onFilterChange({
      categories: newCategories,
      minValue,
      maxValue
    });
  }, [selectedCategories, minValue, maxValue, onFilterChange]);

  const handleMinValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      categories: selectedCategories,
      minValue: value,
      maxValue
    });
  }, [selectedCategories, maxValue, onFilterChange]);

  const handleMaxValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      categories: selectedCategories,
      minValue,
      maxValue: value
    });
  }, [selectedCategories, minValue, onFilterChange]);

  return (
    <div className={`filter-panel ${className || ''}`} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Filters</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map(category => (
            <label key={category} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                style={{ marginRight: '0.5rem' }}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Value Range
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={minValue ?? ''}
            onChange={handleMinValueChange}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxValue ?? ''}
            onChange={handleMaxValueChange}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;

