import React from 'react';

export const metadata = {
  title: 'Performance Dashboard | Real-time Data Visualization',
  description: 'High-performance real-time dashboard with 10,000+ data points at 60fps'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {children}
    </div>
  );
}

