import { NextResponse } from 'next/server';
import { requireAdmin, noAutorizado } from '@/lib/adminAuth';
import { analyticsRepository } from '@/infrastructure/repositories/AnalyticsRepository';

export async function GET(request: Request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const { searchParams } = new URL(request.url);
    const dias = Number(searchParams.get('dias')) || 0;

    const data = await analyticsRepository.getMetrics({ dias });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error en GET /api/v1/admin/analytics:', err);
    return NextResponse.json({ success: false, error: 'Error al calcular las métricas' }, { status: 500 });
  }
}
