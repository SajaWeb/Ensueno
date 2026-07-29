import crypto from 'crypto';

export interface WompiIntegrityParams {
  reference: string;
  amountInCents: number;
  currency?: string;
}

export class WompiService {
  private publicKey: string;
  private integritySecret: string;
  private eventsSecret: string;
  private checkoutUrl: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '';
    this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET || '';
    this.eventsSecret = process.env.WOMPI_EVENTS_SECRET || '';
    this.checkoutUrl = process.env.NEXT_PUBLIC_WOMPI_CHECKOUT_URL || 'https://checkout.wompi.co/p/';
  }

  /**
   * Genera la firma de integridad SHA-256 para el Widget de Wompi
   * Fórmula Wompi: SHA256(Referencia + MantoEnCentavos + Moneda + SecretoIntegridad)
   */
  generateIntegritySignature({ reference, amountInCents, currency = 'COP' }: WompiIntegrityParams): string {
    const rawString = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Genera las propiedades requeridas para renderizar o abrir el Checkout de Wompi
   */
  getCheckoutConfig(reference: string, totalAmount: number, customerEmail: string) {
    const amountInCents = Math.round(totalAmount * 100);
    const signature = this.generateIntegritySignature({ reference, amountInCents, currency: 'COP' });

    return {
      publicKey: this.publicKey,
      currency: 'COP',
      amountInCents,
      reference,
      signature,
      customerEmail,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?reference=${reference}`,
      checkoutUrl: this.checkoutUrl,
    };
  }

  /**
   * Verifica la validez del evento recibido por Webhook de Wompi
   */
  verifyWebhookSignature(eventPayload: any, receivedChecksum: string): boolean {
    try {
      const transaction = eventPayload?.data?.transaction;
      const timestamp = eventPayload?.timestamp;

      if (!transaction || !timestamp) return false;

      // Fórmula Wompi Webhook: SHA256(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + eventsSecret)
      const concatenation = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${this.eventsSecret}`;
      const calculatedChecksum = crypto.createHash('sha256').update(concatenation).digest('hex');

      return calculatedChecksum === receivedChecksum;
    } catch (err) {
      console.error('Error al verificar firma de Webhook Wompi:', err);
      return false;
    }
  }
}

export const wompiService = new WompiService();
