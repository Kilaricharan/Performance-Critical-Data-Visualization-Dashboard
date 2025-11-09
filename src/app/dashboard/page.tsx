import React from 'react';
import { DataGenerator } from '@/lib/dataGenerator';
import DashboardClient from '@/components/dashboard/DashboardClient';

// Server Component - generates initial data
export default async function DashboardPage() {
  const generator = new DataGenerator();
  const initialData = generator.generateBatch(1000);

  return (
    <DashboardClient initialData={initialData} />
  );
}

