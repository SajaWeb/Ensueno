import { NextResponse } from 'next/server';
import { Order } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, subtotal, discount, couponCode, shipping, total, customerName, customerEmail, address } = body;

    const orderId = `ENS-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newOrder: Order = {
      id: orderId,
      date: formattedDate,
      status: 'confirmado',
      statusStep: 1,
      items: items || [],
      subtotal: subtotal || 0,
      discount: discount || 0,
      couponCode: couponCode || '',
      shipping: shipping || 0,
      total: total || 0,
      customerName: customerName || 'Cliente Ensueño',
      customerEmail: customerEmail || 'cliente@ensueno.com',
      address: address || 'Dirección de envío principal',
      deliveryEstimate: '2 - 3 días hábiles',
    };

    return NextResponse.json({
      success: true,
      message: 'Orden creada exitosamente',
      data: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar la orden' },
      { status: 500 }
    );
  }
}
