import { NextResponse } from 'next/server';
import { shippingRepository } from '@/infrastructure/repositories/ShippingRepository';

export async function POST(req: Request) {
  try {
    const { department, city, subtotal, productCount } = await req.json();

    const calculation = await shippingRepository.calculateShipping(
      department,
      city,
      subtotal ? parseFloat(subtotal) : 0,
      productCount ? parseInt(productCount) : 1
    );

    return NextResponse.json({ success: true, data: calculation });
  } catch (err: any) {
    console.error('Error en POST /api/v1/shipping/calculate:', err);
    return NextResponse.json({ success: false, error: 'Error al calcular tarifa de envío' }, { status: 500 });
  }
}
