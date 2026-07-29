import { NextResponse } from 'next/server';
import { mercadoPagoService } from '@/infrastructure/services/MercadoPagoService';
import { orderRepository } from '@/infrastructure/repositories/OrderRepository';

/**
 * Webhook IPN de MercadoPago.
 * MercadoPago envía notificaciones aquí cuando un pago cambia de estado.
 * 
 * Docs: https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json();

    // MercadoPago envía el tipo de evento y data.id
    const type = body?.type || url.searchParams.get('type');
    const dataId = body?.data?.id?.toString() || url.searchParams.get('data.id');

    // Verificar firma HMAC si está configurada
    const xSignature = req.headers.get('x-signature') || '';
    const xRequestId = req.headers.get('x-request-id') || '';

    if (xSignature && dataId) {
      const isValid = mercadoPagoService.verifyWebhookSignature(xSignature, xRequestId, dataId);
      if (!isValid) {
        console.warn('[MercadoPago Webhook] Firma no válida');
        return NextResponse.json({ success: false, error: 'Firma no válida' }, { status: 400 });
      }
    }

    // Solo procesar notificaciones de tipo "payment"
    if (type === 'payment' && dataId) {
      const paymentInfo = await mercadoPagoService.getPaymentInfo(dataId);

      const externalReference = paymentInfo.external_reference; // orderNumber
      const mpStatus = paymentInfo.status; // approved, rejected, pending, in_process, cancelled
      const mpPaymentMethod = paymentInfo.payment_type_id; // credit_card, debit_card, bank_transfer, etc.
      const mpTransactionId = paymentInfo.id?.toString();

      if (externalReference) {
        const order = await orderRepository.getOrderById(externalReference);

        if (order) {
          let newStatus = order.status;
          let newStep = order.statusStep;

          switch (mpStatus) {
            case 'approved':
              newStatus = 'preparando';
              newStep = 2;
              break;
            case 'rejected':
            case 'cancelled':
              newStatus = 'cancelado';
              break;
            case 'pending':
            case 'in_process':
              newStatus = 'confirmado';
              newStep = 1;
              break;
          }

          await orderRepository.updateOrderStatus(order.id, newStatus, newStep, {
            transactionId: mpTransactionId,
            paymentStatus: mpStatus,
            paymentMethod: mpPaymentMethod,
          });

          console.log(`[MercadoPago Webhook] Orden ${externalReference} actualizada a ${mpStatus} -> ${newStatus}`);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Notificación de MercadoPago procesada' });
  } catch (err: any) {
    console.error('[MercadoPago Webhook] Error:', err);
    return NextResponse.json({ success: false, error: 'Error procesando webhook' }, { status: 500 });
  }
}
