import { NextResponse } from 'next/server';
import { MOCK_TIPS } from '@/data/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  let tips = [...MOCK_TIPS];

  if (category && category !== 'todos') {
    tips = tips.filter((t) => t.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    tips = tips.filter(
      (t) => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: tips,
  });
}
