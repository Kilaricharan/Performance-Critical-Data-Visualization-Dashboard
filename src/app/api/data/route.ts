import { NextRequest, NextResponse } from 'next/server';
import { DataGenerator } from '@/lib/dataGenerator';

const generator = new DataGenerator();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get('count') || '1000');
  const category = searchParams.get('category') || undefined;

  try {
    const data = generator.generateBatch(count);
    
    // Filter by category if provided
    const filteredData = category
      ? data.filter(d => d.category === category)
      : data;

    return NextResponse.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lastTimestamp } = body;

    const nextPoint = generator.generateNext(lastTimestamp || Date.now());

    return NextResponse.json({
      success: true,
      data: nextPoint,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate next data point' },
      { status: 500 }
    );
  }
}

