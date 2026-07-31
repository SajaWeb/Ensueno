/**
 * MercadoPago Payment Service for Ensueño
 * 
 * Uses the MercadoPago Checkout Pro API to create payment preferences
 * and verify webhook notifications (IPN).
 * 
 * Docs: https://www.mercadopago.com.co/developers/es/docs/checkout-pro/landing
 */

export interface MercadoPagoPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;       // URL de pago (producción)
  sandbox_init_point: string; // URL de pago (sandbox/test)
}

export class MercadoPagoService {
  private accessToken: string;
  private publicKey: string;
  private webhookSecret: string;
  private isSandbox: boolean;

  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    this.publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
    this.webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
    this.isSandbox = (process.env.MERCADOPAGO_SANDBOX || 'true') === 'true';
  }

  /**
   * Crea una preferencia de pago en MercadoPago Checkout Pro.
   * Retorna la URL a la que se debe redirigir al cliente.
   */
  async createPreference(data: {
    orderNumber: string;
    total: number;
    customerEmail: string;
    customerName: string;
    items: MercadoPagoPreferenceItem[];
  }): Promise<{ preferenceId: string; checkoutUrl: string }> {
    let rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co';
    // MercadoPago API rejects back_urls with localhost or 127.0.0.1 with "Algo ha salido mal" error.
    const isLocal = rawAppUrl.includes('localhost') || rawAppUrl.includes('127.0.0.1');
    const appUrl = isLocal ? 'https://ensueno.com.co' : rawAppUrl;

    // Las credenciales de prueba se deducen del TOKEN, no de la bandera
    // MERCADOPAGO_SANDBOX. Antes se usaba `this.isSandbox || ...`, y con un
    // token de producción (APP_USR-) más SANDBOX=true daba `true`: se omitía el
    // `payer` y ningún cliente real llegaba con su correo a MercadoPago.
    // El token es la única fuente que no puede contradecirse a sí misma.
    const isTestCredentials =
      this.accessToken.startsWith('TEST-') || this.accessToken.includes('3573047533');

    if (this.isSandbox && this.accessToken.startsWith('APP_USR-')) {
      console.warn(
        '[MercadoPago] MERCADOPAGO_SANDBOX=true pero el token es de producción (APP_USR-). ' +
          'Se ignora la bandera y se opera en producción; ponla en false para evitar confusión.'
      );
    }

    // Con credenciales de prueba, mandar un correo real (gmail.com) hace que
    // MercadoPago rechace con "Una de las partes con la que intentas hacer el
    // pago es de prueba".
    const payerEmail = (isTestCredentials && !data.customerEmail.includes('@testuser.com'))
      ? undefined
      : data.customerEmail;

    const body = {
      items: data.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'COP',
      })),
      ...(payerEmail ? { payer: { email: payerEmail, name: data.customerName } } : {}),
      external_reference: data.orderNumber,
      back_urls: {
        success: `${appUrl}/confirmacion/${data.orderNumber}?status=approved`,
        failure: `${appUrl}/confirmacion/${data.orderNumber}?status=rejected`,
        pending: `${appUrl}/confirmacion/${data.orderNumber}?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/v1/payments/mercadopago/webhook`,
      statement_descriptor: 'ENSUENO BABY',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MercadoPago] Error creando preferencia:', errorText);
      throw new Error(`Error al crear preferencia de pago MercadoPago: ${response.status}`);
    }

    const preference: MercadoPagoPreference = await response.json();

    // Use sandbox_init_point ONLY if using a TEST access token (TEST-...)
    // Production tokens (APP_USR-...) must use init_point to prevent credential mismatch errors
    const isTestToken = this.accessToken.startsWith('TEST-');
    const checkoutUrl = isTestToken
      ? (preference.sandbox_init_point || preference.init_point)
      : (preference.init_point || preference.sandbox_init_point);

    return {
      preferenceId: preference.id,
      checkoutUrl,
    };
  }

  /**
   * Genera la configuración para el checkout del frontend.
   * Crea la preferencia y devuelve la URL de redirección.
   */
  async getCheckoutConfig(
    orderNumber: string,
    total: number,
    customerEmail: string,
    customerName: string = 'Cliente Ensueño',
    itemsSummary: MercadoPagoPreferenceItem[] = []
  ) {
    // Si no hay items detallados, crear un item genérico con el total
    const items = itemsSummary.length > 0
      ? itemsSummary
      : [{ title: `Pedido Ensueño #${orderNumber}`, quantity: 1, unit_price: total }];

    const { preferenceId, checkoutUrl } = await this.createPreference({
      orderNumber,
      total,
      customerEmail,
      customerName,
      items,
    });

    return {
      preferenceId,
      checkoutUrl,
      publicKey: this.publicKey,
    };
  }

  /**
   * Obtiene el detalle de un pago por su ID desde la API de MercadoPago.
   * Se usa para verificar el estado del pago en el webhook.
   */
  async getPaymentInfo(paymentId: string) {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MercadoPago] Error obteniendo info del pago:', errorText);
      throw new Error(`Error consultando pago ${paymentId}: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verifica la firma HMAC del webhook de MercadoPago (x-signature header).
   * Si no hay webhook_secret configurado, se omite la validación por seguridad en desarrollo.
   */
  verifyWebhookSignature(xSignature: string, xRequestId: string, dataId: string): boolean {
    if (!this.webhookSecret) {
      console.warn('[MercadoPago] No webhook secret configurado, omitiendo validación de firma');
      return true;
    }

    try {
      const crypto = require('crypto');

      // Parse x-signature: ts=xxx,v1=xxx
      const parts: Record<string, string> = {};
      xSignature.split(',').forEach((part: string) => {
        const [key, value] = part.trim().split('=');
        parts[key] = value;
      });

      const ts = parts['ts'];
      const v1 = parts['v1'];

      if (!ts || !v1) return false;

      // Build manifest string
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', this.webhookSecret).update(manifest).digest('hex');

      return hmac === v1;
    } catch (err) {
      console.error('[MercadoPago] Error verificando firma de webhook:', err);
      return false;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
