import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mercadoPagoService } from '@/infrastructure/services/MercadoPagoService';

export async function POST(req: Request) {
  try {
    const { orderNumber } = await req.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el número de orden' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ orderNumber }, { id: orderNumber }] },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Map order items for MercadoPago
    const mpItems = order.items.map((item) => ({
      title: item.productName || item.product?.name || 'Producto Ensueño',
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || item.subtotal / (item.quantity || 1),
    }));

    if (order.shippingCost && order.shippingCost > 0) {
      mpItems.push({
        title: 'Envío',
        quantity: 1,
        unit_price: order.shippingCost,
      });
    }

    if (order.discount && order.discount > 0) {
      mpItems.push({
        title: `Descuento${order.couponCode ? ` (${order.couponCode})` : ''}`,
        quantity: 1,
        unit_price: -order.discount,
      });
    }

    const mpConfig = await mercadoPagoService.getCheckoutConfig(
      order.orderNumber,
      order.total,
      order.customerEmail,
      order.customerName,
      mpItems
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: mpConfig.checkoutUrl,
      preferenceId: mpConfig.preferenceId,
    });
  } catch (err: any) {
    console.error('Error reintentando pago MercadoPago:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error al generar la pasarela de pago' },
      { status: 500 }
    );
  }
}
