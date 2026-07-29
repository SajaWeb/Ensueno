import { prisma } from '@/lib/prisma';

export class OrderRepository {
  /**
   * Crea una nueva orden de compra
   */
  async createOrder(data: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    city?: string;
    department?: string;
    subtotal: number;
    discount?: number;
    couponCode?: string;
    shippingCost?: number;
    total: number;
    deliveryEstimate?: string;
    items: Array<{
      productId: string;
      productName: string;
      selectedFragrance?: string;
      selectedSize?: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>;
  }) {
    const orderNumber = `ENS-${Date.now().toString().slice(-6)}`;

    return prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail.toLowerCase().trim(),
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        city: data.city,
        department: data.department,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        couponCode: data.couponCode,
        shippingCost: data.shippingCost || 0,
        total: data.total,
        deliveryEstimate: data.deliveryEstimate || '2-4 días hábiles',
        status: 'orden_generada',
        statusStep: 1,
        paymentStatus: 'pending',
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            selectedFragrance: item.selectedFragrance,
            selectedSize: item.selectedSize,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene una orden por su ID u OrderNumber
   */
  async getOrderById(idOrNumber: string) {
    return prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene las órdenes de un usuario específico
   */
  async getOrdersByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualiza el estado de una orden y datos de pago (MercadoPago)
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    statusStep?: number,
    paymentData?: { transactionId?: string; paymentStatus?: string; paymentMethod?: string }
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(statusStep ? { statusStep } : {}),
        ...(paymentData?.transactionId ? { paymentTransactionId: paymentData.transactionId } : {}),
        ...(paymentData?.paymentStatus ? { paymentStatus: paymentData.paymentStatus } : {}),
        ...(paymentData?.paymentMethod ? { paymentMethod: paymentData.paymentMethod } : {}),
      },
    });
  }

  /**
   * Obtiene todas las órdenes para el Admin Dashboard
   */
  async getAllOrdersAdmin(limit = 50) {
    return prisma.order.findMany({
      take: limit,
      include: {
        items: true,
        user: {
          include: {
            motherProfile: {
              include: {
                babies: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const orderRepository = new OrderRepository();
