'use client';

import React, { memo, useMemo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
  className?: string;
}

const DataTable = memo(function DataTable({
  data,
  height = 400,
  className
}: DataTableProps) {
  const itemHeight = 40;
  const containerHeight = height;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.timestamp - a.timestamp);
  }, [data]);

  const {
    visibleItems: visibleSortedItems,
    totalHeight: sortedTotalHeight,
    offsetY: sortedOffsetY,
    containerRef: sortedContainerRef,
    handleScroll: handleSortedScroll
  } = useVirtualization(sortedData, {
    itemHeight,
    containerHeight,
    overscan: 5
  });

  return (
    <div className={`data-table ${className || ''}`} style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', fontWeight: '600' }}>
        Data Table ({data.length.toLocaleString()} points)
      </div>
      
      <div
        ref={sortedContainerRef}
        onScroll={handleSortedScroll}
        style={{
          height: `${containerHeight}px`,
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <div style={{ height: `${sortedTotalHeight}px`, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: `${sortedOffsetY}px`,
            width: '100%'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {visibleSortedItems.map(({ item, index }) => (
                  <tr
                    key={`${item.timestamp}-${index}`}
                    style={{
                      borderBottom: '1px solid #e0e0e0',
                      height: `${itemHeight}px`
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                      {item.value.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        background: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;

