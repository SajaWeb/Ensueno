import { NextResponse } from 'next/server';
import { shippingRepository } from '@/infrastructure/repositories/ShippingRepository';
import { prisma } from '@/lib/prisma';
import { requireAdmin, noAutorizado } from '@/lib/adminAuth';

/* Las tarifas se leen para cotizar el flete, pero cambiarlas es del panel:
   define lo que se le cobra a cada clienta según su ciudad. */

export async function GET() {
  try {
    const rates = await shippingRepository.getShippingRates();
    return NextResponse.json({ success: true, data: rates });
  } catch (err: any) {
    console.error('Error en GET /api/v1/shipping/rates:', err);
    return NextResponse.json({ success: false, error: 'Error al obtener tarifas de envío' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const body = await req.json();
    const { department, city, cities, cost, estimatedDays } = body;

    if (!department || cost === undefined || cost === null || cost === '') {
      return NextResponse.json({ success: false, error: 'Departamento y costo son obligatorios' }, { status: 400 });
    }

    const numericCost = typeof cost === 'string' ? parseFloat(cost.replace(/[^0-9]/g, '')) : Number(cost);

    if (isNaN(numericCost) || numericCost < 0) {
      return NextResponse.json({ success: false, error: 'El costo de envío debe ser un número válido' }, { status: 400 });
    }

    // Actualización masiva si se envía un array de ciudades
    if (Array.isArray(cities) && cities.length > 0) {
      const results = await shippingRepository.upsertDepartmentRates({
        department: String(department),
        cities,
        cost: numericCost,
        estimatedDays: estimatedDays ? String(estimatedDays) : '2-3 días hábiles',
      });
      return NextResponse.json({
        success: true,
        message: `Se actualizaron ${results.length} municipios en ${department}`,
        data: results,
      });
    }

    // Actualización individual por municipio
    if (!city) {
      return NextResponse.json({ success: false, error: 'El municipio es obligatorio para guardar una tarifa individual' }, { status: 400 });
    }

    const rate = await shippingRepository.upsertShippingRate({
      department: String(department),
      city: String(city),
      cost: numericCost,
      estimatedDays: estimatedDays ? String(estimatedDays) : '2-3 días hábiles',
    });

    return NextResponse.json({ success: true, message: 'Tarifa de envío guardada con éxito', data: rate });
  } catch (err: any) {
    console.error('Error detallado en POST /api/v1/shipping/rates:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error interno al guardar tarifa de envío' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido para eliminar' }, { status: 400 });
    }

    await prisma.shippingRate.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Tarifa eliminada con éxito' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Error al eliminar tarifa' }, { status: 500 });
  }
}
