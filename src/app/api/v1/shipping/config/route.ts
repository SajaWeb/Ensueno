import { NextResponse } from 'next/server';
import { shippingRepository } from '@/infrastructure/repositories/ShippingRepository';
import { requireAdmin, noAutorizado } from '@/lib/adminAuth';

/* El GET lo lee el carrito sin sesión; el POST define cuánto se le cobra a la
   clienta por el flete, así que exige administrador. */

export async function GET() {
  try {
    const config = await shippingRepository.getShippingConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    console.error('Error en GET /api/v1/shipping/config:', err);
    return NextResponse.json({ success: false, error: 'Error al obtener configuración de envíos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const body = await req.json();
    const { freeShippingThreshold, defaultRate, qtyDiscountThreshold, qtyDiscountAmount } = body;

    const updated = await shippingRepository.updateShippingConfig({
      freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : undefined,
      defaultRate: defaultRate ? parseFloat(defaultRate) : undefined,
      qtyDiscountThreshold: qtyDiscountThreshold ? parseInt(qtyDiscountThreshold) : undefined,
      qtyDiscountAmount: qtyDiscountAmount ? parseFloat(qtyDiscountAmount) : undefined,
    });

    return NextResponse.json({ success: true, message: 'Configuración de envíos actualizada con éxito', data: updated });
  } catch (err: any) {
    console.error('Error en POST /api/v1/shipping/config:', err);
    return NextResponse.json({ success: false, error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
