import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { orderRepository } from '@/infrastructure/repositories/OrderRepository';
import { mercadoPagoService } from '@/infrastructure/services/MercadoPagoService';
import { resendService } from '@/infrastructure/services/ResendService';
import { metaPixelService } from '@/infrastructure/services/MetaPixelService';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ensueno_jwt_secret_token_9912');

export async function GET(req: Request) {
  try {
    let userId: string | undefined;
    let email: string | undefined;

    const cookieStore = await cookies();
    const token = cookieStore.get('ensueno_token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.id as string;
        email = payload.email as string;
      } catch {
        // ignore
      }
    }

    if (!userId && !email) {
      const { searchParams } = new URL(req.url);
      userId = searchParams.get('userId') || undefined;
      email = searchParams.get('email') || undefined;
    }

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: 'Se requiere autenticación para ver los pedidos' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ customerEmail: email.toLowerCase().trim() }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    console.error('Error en GET /api/v1/orders:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { userId, customerName, customerEmail, customerPhone, shippingAddress, city, department, items, subtotal, discount, couponCode, shippingCost, total, deliveryEstimate } = body;

    if (!customerName || !customerEmail || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios del pedido' }, { status: 400 });
    }

    // Try to get authenticated user from cookie if not provided
    if (!userId) {
      const cookieStore = await cookies();
      const token = cookieStore.get('ensueno_token')?.value;
      if (token) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          userId = payload.id as string;
        } catch {
          // ignore
        }
      }
    }

    const order = await orderRepository.createOrder({
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      department,
      items,
      subtotal,
      discount,
      couponCode,
      shippingCost,
      total,
      deliveryEstimate,
    });

    // Award loyalty points to user if logged in (1 point per 1000 COP)
    if (userId) {
      const earnedPoints = Math.floor(total / 1000);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: { increment: earnedPoints },
          },
        });
      } catch (e) {
        console.warn('Error otorgando puntos de fidelidad:', e);
      }
    }

    // 1. Crear Preferencia de Pago en MercadoPago
    let mercadoPagoConfig = null;
    try {
      const mpItems = items.map((item: any) => ({
        title: item.productName || 'Producto Ensueño',
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || item.subtotal / (item.quantity || 1),
      }));

      // Agregar envío como ítem si tiene costo
      if (shippingCost && shippingCost > 0) {
        mpItems.push({
          title: 'Envío',
          quantity: 1,
          unit_price: shippingCost,
        });
      }

      // Si hay descuento, agregar como ítem negativo
      if (discount && discount > 0) {
        mpItems.push({
          title: `Descuento${couponCode ? ` (${couponCode})` : ''}`,
          quantity: 1,
          unit_price: -discount,
        });
      }

      mercadoPagoConfig = await mercadoPagoService.getCheckoutConfig(
        order.orderNumber,
        total,
        customerEmail,
        customerName,
        mpItems
      );
    } catch (mpError: any) {
      console.error('[MercadoPago] Error creando preferencia:', mpError);
      // No lanzar error — la orden se creó; el usuario puede reintentar el pago
    }

    // 2. Enviar evento de compra a Meta Conversions API (CAPI)
    await metaPixelService.sendCapiEvent(
      'Purchase',
      { email: customerEmail, phone: customerPhone },
      { order_id: order.orderNumber, value: total, currency: 'COP' }
    );

    // 3. Enviar correo de confirmación de pedido con Resend
    await resendService.sendOrderConfirmationEmail(customerEmail, customerName, order.orderNumber, total);

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: order,
      mercadopago: mercadoPagoConfig,
    });
  } catch (err: any) {
    console.error('Error en POST /api/v1/orders:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al procesar el pedido' }, { status: 500 });
  }
}
