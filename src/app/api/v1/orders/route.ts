import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { orderRepository } from '@/infrastructure/repositories/OrderRepository';
import { mercadoPagoService } from '@/infrastructure/services/MercadoPagoService';
import { resendService } from '@/infrastructure/services/ResendService';
import { metaPixelService } from '@/infrastructure/services/MetaPixelService';
import { prisma } from '@/lib/prisma';
import { getJwtSecretEncoded } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    // Expira órdenes de más de 15 minutos automáticamente
    await orderRepository.autoExpirePendingOrders();

    let userId: string | undefined;
    let email: string | undefined;

    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');

    if (orderNumber) {
      let order = await prisma.order.findFirst({
        where: { OR: [{ orderNumber }, { id: orderNumber }] },
        include: { items: { include: { product: true } } },
      });

      const mpStatus = (searchParams.get('status') || searchParams.get('collection_status') || '').toLowerCase();
      const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || undefined;

      if (order && (mpStatus === 'approved' || mpStatus === 'success') && order.status !== 'confirmado') {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'confirmado',
            statusStep: 1,
            paymentStatus: 'approved',
            ...(paymentId ? { paymentTransactionId: paymentId } : {}),
          },
          include: { items: { include: { product: true } } },
        });
        console.log(`[Order API] Order #${order.orderNumber} confirmed via redirect params`);

        // Send rich confirmation email with product images & sweet message
        resendService.sendOrderConfirmationEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          total: order.total,
          items: order.items,
          shippingAddress: order.shippingAddress,
          city: order.city || undefined,
          department: order.department || undefined,
          deliveryEstimate: order.deliveryEstimate || '2-4 días hábiles',
        }).catch((e) => console.error('Error enviando correo de confirmación:', e));
      } else if (order && (mpStatus === 'rejected' || mpStatus === 'failure') && order.status === 'orden_generada') {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'anulada',
            statusStep: 0,
            paymentStatus: 'rejected',
            ...(paymentId ? { paymentTransactionId: paymentId } : {}),
          },
          include: { items: { include: { product: true } } },
        });
        console.log(`[Order API] Order #${order.orderNumber} set to rejected via redirect params`);
      }

      return NextResponse.json({ success: true, data: order });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('ensueno_token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecretEncoded());
        userId = payload.id as string;
        email = payload.email as string;
      } catch {
        // ignore
      }
    }

    if (!userId && !email) {
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
          const { payload } = await jwtVerify(token, getJwtSecretEncoded());
          userId = payload.id as string;
        } catch {
          // ignore
        }
      }
    }

    // Verificar si el cliente ya tiene una orden activa pendiente (< 15 minutos)
    const existingPendingOrder = await orderRepository.getPendingOrderForCustomer(customerEmail, userId);
    if (existingPendingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Tienes una orden de compra pendiente (#${existingPendingOrder.orderNumber}) realizada hace menos de 15 minutos. Debes completar el pago de esa orden o esperar 15 minutos a que expire antes de generar una nueva.`,
          pendingOrderNumber: existingPendingOrder.orderNumber,
        },
        { status: 400 }
      );
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

    // 2. Meta CAPI: aquí la orden solo está GENERADA, todavía no pagada, así
    // que el evento correcto es InitiateCheckout. El `Purchase` lo dispara el
    // webhook cuando MercadoPago confirma el pago aprobado.
    await metaPixelService.sendCapiEvent(
      'InitiateCheckout',
      { email: customerEmail, phone: customerPhone },
      { order_id: order.orderNumber, value: total, currency: 'COP' }
    );

    // 3. NO se envía el correo de confirmación aquí.
    //
    // En este punto el cliente todavía no ha pagado: apenas va camino a
    // MercadoPago. Enviarlo ahora le afirmaba "recibimos tu pago" a quien luego
    // abandonaba el checkout o era rechazado, y quien sí pagaba recibía el mismo
    // correo dos veces (el webhook ya lo manda al aprobarse el pago).
    // Ver el manejador de `approved` en
    // src/app/api/v1/payments/mercadopago/webhook/route.ts

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
