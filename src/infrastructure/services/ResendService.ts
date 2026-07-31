import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co';
const SUPPORT_EMAIL = 'soporte@ensueno.com.co';
const LOGO_URL = 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';

/* --------------------------------------------------------------------------
 * Paleta de marca, igual que el sitio. Los clientes de correo no entienden
 * variables CSS ni clases: todo va en hex y en `style` inline.
 * ------------------------------------------------------------------------ */
const C = {
  azul: '#1d5c7c',
  azulHondo: '#153d51',
  celeste: '#bde4f8',
  cian: '#e4f3f7',
  amarillo: '#f4e5a6',
  rosa: '#f6bac7',
  tinta: '#1f2333',
  tintaSuave: '#4f5469',
  borde: '#d3d5e5',
  blanco: '#ffffff',
};

const money = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);

/**
 * Envoltura común de todos los correos.
 *
 * Se usa una tabla y no divs con flexbox: Outlook no soporta flex, así que
 * `display:flex; justify-content:space-between` simplemente no alinea nada.
 */
function layout(opts: { preheader: string; eyebrow: string; title: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${C.cian};">
  <!-- Texto de vista previa en la bandeja de entrada -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cian};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${C.blanco};border:1px solid ${C.borde};border-radius:20px;overflow:hidden;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

        <tr><td align="center" style="background-color:${C.celeste};padding:28px 24px;">
          <img src="${LOGO_URL}" alt="Ensueño" width="132" style="display:block;border:0;max-width:132px;height:auto;">
        </td></tr>

        <tr><td style="padding:32px 28px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.azul};">${opts.eyebrow}</p>
          <h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.25;font-weight:700;color:${C.tinta};">${opts.title}</h1>
          ${opts.body}
        </td></tr>

        <tr><td style="background-color:${C.cian};padding:22px 28px;text-align:center;border-top:1px solid ${C.borde};">
          <p style="margin:0 0 6px 0;font-size:12px;color:${C.tintaSuave};line-height:1.6;">
            ¿Necesitas ayuda? Escríbenos a
            <a href="mailto:${SUPPORT_EMAIL}" style="color:${C.azul};font-weight:700;text-decoration:underline;">${SUPPORT_EMAIL}</a>
          </p>
          <p style="margin:0;font-size:11px;color:${C.tintaSuave};">
            Ensueño Baby Colombia &copy; ${new Date().getFullYear()}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (text: string) =>
  `<p style="margin:16px 0 0 0;font-size:15px;line-height:1.65;color:${C.tintaSuave};">${text}</p>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
     <tr><td style="background-color:${C.azul};border-radius:999px;">
       <a href="${href}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:700;color:${C.blanco};text-decoration:none;">${label}</a>
     </td></tr>
   </table>`;

/** Bloque grande para códigos de 6 dígitos. */
const codeBlock = (code: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0 0;">
     <tr><td align="center" style="background-color:${C.cian};border:2px dashed ${C.celeste};border-radius:16px;padding:22px;">
       <span style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:${C.azulHondo};">${code}</span>
     </td></tr>
   </table>
   <p style="margin:12px 0 0 0;font-size:12px;color:${C.tintaSuave};text-align:center;">Vence en 15 minutos.</p>`;

/** Fila etiqueta/valor. Tabla en vez de flex, por Outlook. */
const row = (label: string, value: string, strong = false) =>
  `<tr>
     <td style="padding:7px 0;font-size:13px;color:${C.tintaSuave};">${label}</td>
     <td align="right" style="padding:7px 0;font-size:${strong ? '18px' : '13px'};font-weight:700;color:${strong ? C.azul : C.tinta};">${value}</td>
   </tr>`;

export class ResendService {
  private resend: Resend | null = null;

  constructor() {
    if (resendApiKey && !resendApiKey.includes('placeholder')) {
      this.resend = new Resend(resendApiKey);
    }
  }

  private async send(to: string, subject: string, html: string, tag: string) {
    if (!this.resend) {
      console.log(`[Resend Simulación] ${tag} -> ${to}`);
      return { success: true, simulated: true };
    }
    try {
      const { data, error } = await this.resend.emails.send({ from: fromEmail, to: [to], subject, html });
      if (error) {
        console.error(`Error enviando correo (${tag}):`, error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error(`Excepción enviando correo (${tag}):`, err);
      return { success: false, error: err };
    }
  }

  /** Creación de cuenta: código de verificación de 6 dígitos. */
  async sendVerificationCodeEmail(to: string, name: string, code: string) {
    const html = layout({
      preheader: `Tu código de confirmación es ${code}`,
      eyebrow: 'Confirma tu cuenta',
      title: `Bienvenida a Ensueño, ${name}`,
      body:
        p('Ingresa este código para activar tu cuenta y terminar el registro.') +
        codeBlock(code) +
        p('Si no creaste esta cuenta, puedes ignorar este mensaje.'),
    });
    return this.send(to, `Tu código de confirmación: ${code}`, html, 'verificación');
  }

  /** Recuperación de contraseña: código de 6 dígitos. */
  async sendPasswordResetCodeEmail(to: string, name: string, code: string) {
    const html = layout({
      preheader: `Tu código para restablecer la contraseña es ${code}`,
      eyebrow: 'Restablecer contraseña',
      title: `Hola ${name}, aquí está tu código`,
      body:
        p('Usa este código para crear una contraseña nueva.') +
        codeBlock(code) +
        p(
          `Si no pediste este cambio, ignora el correo y escríbenos a <a href="mailto:${SUPPORT_EMAIL}" style="color:${C.azul};font-weight:700;">${SUPPORT_EMAIL}</a>: tu contraseña actual sigue funcionando.`
        ),
    });
    return this.send(to, `Tu código para restablecer la contraseña: ${code}`, html, 'reset de clave');
  }

  /** Aviso tras cambiar la contraseña — cierra el hueco de seguridad. */
  async sendPasswordChangedEmail(to: string, name: string) {
    const html = layout({
      preheader: 'Tu contraseña de Ensueño fue actualizada',
      eyebrow: 'Contraseña actualizada',
      title: `${name}, cambiamos tu contraseña`,
      body:
        p('Tu contraseña se actualizó correctamente. No tienes que hacer nada más.') +
        p(
          `Si no fuiste tú, escríbenos de inmediato a <a href="mailto:${SUPPORT_EMAIL}" style="color:${C.azul};font-weight:700;">${SUPPORT_EMAIL}</a>.`
        ) +
        button(`${APP_URL}/perfil`, 'Ir a mi cuenta'),
    });
    return this.send(to, 'Tu contraseña de Ensueño fue actualizada', html, 'clave cambiada');
  }

  /** Confirmación de pedido pagado. */
  async sendOrderConfirmationEmail(params: {
    to: string;
    customerName: string;
    orderNumber: string;
    total: number;
    items?: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      selectedFragrance?: string | null;
      selectedSize?: string | null;
      product?: { image?: string | null } | null;
    }>;
    shippingAddress?: string;
    city?: string;
    department?: string;
    deliveryEstimate?: string;
  }) {
    const itemsHtml = (params.items || [])
      .map((item) => {
        const img = item.product?.image || LOGO_URL;
        const details = [item.selectedFragrance, item.selectedSize].filter(Boolean).join(' · ');
        return `<tr>
          <td width="64" style="padding:12px 0;border-bottom:1px solid ${C.borde};">
            <img src="${img}" alt="" width="56" style="display:block;border:0;width:56px;height:56px;border-radius:12px;background-color:${C.cian};">
          </td>
          <td style="padding:12px;border-bottom:1px solid ${C.borde};">
            <strong style="font-size:14px;color:${C.tinta};">${item.productName}</strong>
            ${details ? `<br><span style="font-size:12px;color:${C.tintaSuave};">${details}</span>` : ''}
            <br><span style="font-size:12px;color:${C.tintaSuave};">Cantidad: ${item.quantity}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid ${C.borde};font-size:14px;font-weight:700;color:${C.azul};">
            ${money(item.unitPrice * item.quantity)}
          </td>
        </tr>`;
      })
      .join('');

    const body =
      p(`Gracias por tu compra, ${params.customerName}. Recibimos tu pago y ya estamos preparando el pedido.`) +
      (itemsHtml
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">${itemsHtml}</table>`
        : '') +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0 0;background-color:${C.cian};border-radius:16px;padding:6px 18px;">
         ${row('Número de pedido', `#${params.orderNumber}`)}
         ${params.shippingAddress ? row('Entrega', `${params.shippingAddress}${params.city ? `, ${params.city}` : ''}`) : ''}
         ${row('Tiempo estimado', params.deliveryEstimate || '2 a 4 días hábiles')}
         ${row('Total pagado', money(params.total), true)}
       </table>` +
      button(`${APP_URL}/confirmacion/${params.orderNumber}`, 'Ver mi pedido');

    const html = layout({
      preheader: `Pedido #${params.orderNumber} confirmado por ${money(params.total)}`,
      eyebrow: 'Pedido confirmado',
      title: `Tu pedido #${params.orderNumber} está en camino`,
      body,
    });
    return this.send(params.to, `Confirmamos tu pedido #${params.orderNumber}`, html, 'confirmación de pedido');
  }

  /**
   * Actualización de estado del pedido. Antes no existía: el panel cambiaba el
   * estado y el cliente nunca se enteraba.
   */
  async sendOrderStatusEmail(params: {
    to: string;
    customerName: string;
    orderNumber: string;
    status: string;
    deliveryEstimate?: string;
  }) {
    const COPY: Record<string, { eyebrow: string; title: string; text: string }> = {
      confirmado: {
        eyebrow: 'Pedido confirmado',
        title: 'Confirmamos tu pedido',
        text: 'Ya tenemos tu pedido registrado y pasa a preparación.',
      },
      empacada: {
        eyebrow: 'Pedido empacado',
        title: 'Tu pedido está empacado',
        text: 'Empacamos tus productos y quedan listos para despacho.',
      },
      en_camino: {
        eyebrow: 'Pedido en camino',
        title: 'Tu pedido va en camino',
        text: 'La transportadora ya lo recogió. Te avisamos cuando llegue.',
      },
      sin_poder_entregarse: {
        eyebrow: 'Entrega fallida',
        title: 'No pudimos entregar tu pedido',
        text: 'La transportadora no logró completar la entrega. Escríbenos para reprogramarla.',
      },
      entregada: {
        eyebrow: 'Pedido entregado',
        title: 'Tu pedido llegó',
        text: 'Ya está en tus manos. Nos encantaría saber qué te pareció.',
      },
      devolucion: {
        eyebrow: 'Devolución',
        title: 'Registramos la devolución',
        text: 'Estamos procesando la devolución de tu pedido.',
      },
      anulada: {
        eyebrow: 'Pedido anulado',
        title: 'Anulamos tu pedido',
        text: 'Si esto no lo pediste tú, escríbenos y lo revisamos.',
      },
    };

    const copy = COPY[params.status];
    // Estados sin copy propio (orden_generada) no ameritan correo.
    if (!copy) return { success: true, skipped: true };

    const body =
      p(`${params.customerName}, ${copy.text}`) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0 0;background-color:${C.cian};border-radius:16px;padding:6px 18px;">
         ${row('Número de pedido', `#${params.orderNumber}`)}
         ${params.deliveryEstimate ? row('Tiempo estimado', params.deliveryEstimate) : ''}
       </table>` +
      button(`${APP_URL}/confirmacion/${params.orderNumber}`, 'Seguir mi pedido');

    const html = layout({
      preheader: `${copy.title} — pedido #${params.orderNumber}`,
      eyebrow: copy.eyebrow,
      title: copy.title,
      body,
    });
    return this.send(params.to, `${copy.title} · pedido #${params.orderNumber}`, html, 'estado de pedido');
  }

  /** Recordatorio de recompra. */
  async sendRemarketingReminder(to: string, motherName: string, babyName: string, productTitle: string) {
    const html = layout({
      preheader: `¿Cómo va la rutina de ${babyName}?`,
      eyebrow: 'Te extrañamos',
      title: `Hola ${motherName}`,
      body:
        p(`Sabemos lo importante que es sostener la rutina de cuidado de <strong style="color:${C.tinta};">${babyName}</strong>.`) +
        p(`Puede que tu <strong style="color:${C.tinta};">${productTitle}</strong> esté por acabarse.`) +
        button(`${APP_URL}/#productos`, 'Volver a pedir'),
    });
    return this.send(to, `¿Cómo va la rutina de sueño de ${babyName}?`, html, 'remarketing');
  }
}

export const resendService = new ResendService();
