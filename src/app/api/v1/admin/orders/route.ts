import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, noAutorizado } from '@/lib/adminAuth';
import { resendService } from '@/infrastructure/services/ResendService';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return noAutorizado();
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const orders = await prisma.order.findMany({
      where: {
        ...(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { shippingAddress: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            loyaltyPoints: true,
            motherProfile: {
              select: {
                fullName: true,
                phone: true,
                babies: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute Accounting & Control Metrics
    const allOrders = await prisma.order.findMany({
      select: { status: true, total: true },
    });

    const metrics = {
      totalRevenue: allOrders
        .filter((o) => ['confirmado', 'empacada', 'en_camino', 'entregada'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
      totalOrders: allOrders.length,
      generatedCount: allOrders.filter((o) => o.status === 'orden_generada').length,
      confirmedCount: allOrders.filter((o) => o.status === 'confirmado').length,
      packedCount: allOrders.filter((o) => o.status === 'empacada').length,
      shippedCount: allOrders.filter((o) => o.status === 'en_camino').length,
      failedDeliveryCount: allOrders.filter((o) => o.status === 'sin_poder_entregarse').length,
      deliveredCount: allOrders.filter((o) => o.status === 'entregada').length,
      returnedCount: allOrders.filter((o) => o.status === 'devolucion').length,
      canceledCount: allOrders.filter((o) => o.status === 'anulada').length,
    };

    return NextResponse.json({ success: true, data: orders, metrics });
  } catch (err: any) {
    console.error('[Admin Orders API GET Error]:', err);
    return NextResponse.json({ success: false, error: 'Error al consultar pedidos' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return noAutorizado();
    }

    const body = await req.json();
    const { orderId, status, deliveryEstimate } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Falta orderId o status' }, { status: 400 });
    }

    const allowedStatuses = [
      'orden_generada',
      'confirmado',
      'empacada',
      'en_camino',
      'sin_poder_entregarse',
      'entregada',
      'devolucion',
      'anulada',
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: `Estado no válido. Debe ser uno de: ${allowedStatuses.join(', ')}` }, { status: 400 });
    }

    // Map status to step index for progress tracker
    let statusStep = 1;
    switch (status) {
      case 'orden_generada':
        statusStep = 1;
        break;
      case 'confirmado':
        statusStep = 1;
        break;
      case 'empacada':
        statusStep = 2;
        break;
      case 'en_camino':
        statusStep = 3;
        break;
      case 'sin_poder_entregarse':
        statusStep = 3;
        break;
      case 'entregada':
        statusStep = 4;
        break;
      case 'devolucion':
        statusStep = 4;
        break;
      case 'anulada':
        statusStep = 0;
        break;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusStep,
        ...(deliveryEstimate ? { deliveryEstimate } : {}),
      },
      include: {
        items: true,
      },
    });

    // Avisar al cliente del nuevo estado. No se espera ni se deja que un fallo
    // de correo tumbe la actualización: el estado ya quedó guardado.
    if (updatedOrder.customerEmail) {
      resendService
        .sendOrderStatusEmail({
          to: updatedOrder.customerEmail,
          customerName: updatedOrder.customerName || 'Hola',
          orderNumber: updatedOrder.orderNumber || updatedOrder.id,
          status,
          deliveryEstimate: updatedOrder.deliveryEstimate || undefined,
        })
        .catch((e) => console.error('No se pudo enviar el correo de estado:', e));
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    console.error('[Admin Orders API PUT Error]:', err);
    return NextResponse.json({ success: false, error: 'Error al actualizar estado del pedido' }, { status: 500 });
  }
}
