import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/data/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  let products = [...MOCK_PRODUCTS];

  if (category && category !== 'todos') {
    products = products.filter((p) => p.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: products,
    count: products.length,
  });
}
