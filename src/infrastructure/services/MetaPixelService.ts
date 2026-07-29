/**
 * Meta Pixel & Conversions API (CAPI) Service for Ensueño E-Commerce
 */

declare global {
  interface Window {
    fbq: any;
  }
}

export class MetaPixelService {
  private pixelId: string;
  private capiToken: string;

  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
    this.capiToken = process.env.META_CONVERSIONS_API_TOKEN || '';
  }

  /**
   * Rastreo Client-Side de Meta Pixel
   */
  trackClientEvent(eventName: string, data?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, data);
    }
  }

  /**
   * Eventos estándar de Meta Pixel
   */
  trackPageView() {
    this.trackClientEvent('PageView');
  }

  trackAddToCart(productId: string, productName: string, value: number, currency = 'COP') {
    this.trackClientEvent('AddToCart', {
      content_ids: [productId],
      content_name: productName,
      value,
      currency,
    });
  }

  trackInitiateCheckout(value: number, numItems: number, currency = 'COP') {
    this.trackClientEvent('InitiateCheckout', {
      value,
      num_items: numItems,
      currency,
    });
  }

  trackPurchase(orderId: string, value: number, currency = 'COP') {
    this.trackClientEvent('Purchase', {
      content_type: 'product',
      value,
      currency,
      order_id: orderId,
    });
  }

  trackLead(leadType: string, email?: string) {
    this.trackClientEvent('Lead', {
      lead_type: leadType,
      email,
    });
  }

  /**
   * Envia un evento Server-Side vía Meta Conversions API (CAPI)
   */
  async sendCapiEvent(eventName: string, userData: { email?: string; phone?: string }, customData?: Record<string, any>) {
    if (!this.capiToken || this.capiToken.includes('placeholder')) {
      console.log(`[Meta CAPI Simulación] Evento ${eventName} registrado`);
      return;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.pixelId}/events?access_token=${this.capiToken}`;
      const body = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            user_data: {
              em: userData.email ? [this.hashData(userData.email)] : undefined,
              ph: userData.phone ? [this.hashData(userData.phone)] : undefined,
            },
            custom_data: customData,
          },
        ],
      };

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('Error enviando evento CAPI a Meta:', err);
    }
  }

  private hashData(data: string): string {
    return require('crypto').createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  }
}

export const metaPixelService = new MetaPixelService();
