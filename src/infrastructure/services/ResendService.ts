import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export class ResendService {
  private resend: Resend | null = null;

  constructor() {
    if (resendApiKey && !resendApiKey.includes('placeholder')) {
      this.resend = new Resend(resendApiKey);
    }
  }

  /**
   * Envía correo de confirmación de cuenta con código numérico de 6 dígitos
   */
  async sendVerificationCodeEmail(to: string, name: string, code: string) {
    if (!this.resend) {
      console.log(`[Resend Simulación] Código de verificación para ${to}: ${code}`);
      return { success: true, simulated: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `🔒 Tu Código de Confirmación Ensueño: ${code}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #334155; background-color: #ffffff; border-radius: 16px; border: 1px solid #f1f5f9;">
            <div style="text-align: center; padding-bottom: 20px; border-b: 1px solid #f1f5f9;">
              <h1 style="color: #6b46c1; margin: 0; font-size: 26px; font-weight: 800;">Ensueño Baby ✨</h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Cuidado puro y natural para tu bebé</p>
            </div>
            
            <div style="padding: 24px 0;">
              <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0;">¡Bienvenida a la familia Ensueño, ${name}! 💕</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Para verificar que tu correo electrónico esté escrito correctamente y activar el acceso seguro a tu cuenta, ingresa el siguiente código de confirmación de 6 dígitos:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 2px dashed #9333ea; border-radius: 16px; padding: 16px 36px;">
                  <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6b21a8;">${code}</span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Este código expirará en <strong>15 minutos</strong>.</p>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Si no creaste una cuenta en Ensueño Baby, por favor ignora este mensaje.
              </p>
            </div>

            <div style="border-t: 1px solid #f1f5f9; pt: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 4px 0;">Ensueño Baby Colombia &copy; 2026 - Todos los derechos reservados</p>
              <p style="margin: 4px 0;">Atención a Clientes: <a href="mailto:soporte@ensueno.com.co" style="color: #8b5cf6;">soporte@ensueno.com.co</a></p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error enviando código de verificación con Resend:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Excepción en ResendService (Verification Code):', err);
      return { success: false, error: err };
    }
  }

  /**
   * Envía correo de recuperación de contraseña con código de 6 dígitos
   */
  async sendPasswordResetCodeEmail(to: string, name: string, code: string) {
    if (!this.resend) {
      console.log(`[Resend Simulación] Código de restablecimiento para ${to}: ${code}`);
      return { success: true, simulated: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `🔑 Código de Seguridad Restablecimiento: ${code} - Ensueño`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #334155; background-color: #ffffff; border-radius: 16px; border: 1px solid #f1f5f9;">
            <div style="text-align: center; padding-bottom: 20px; border-b: 1px solid #f1f5f9;">
              <h1 style="color: #6b46c1; margin: 0; font-size: 26px; font-weight: 800;">Ensueño Baby ✨</h1>
            </div>
            
            <div style="padding: 24px 0;">
              <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0;">Restablecimiento de Contraseña</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Hola <strong>${name}</strong>, hemos recibido una solicitud para cambiar tu contraseña de acceso en <strong>Ensueño</strong>.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Ingresa el siguiente código de seguridad en la pantalla de recuperación:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; background: #faf5ff; border: 2px solid #a855f7; border-radius: 16px; padding: 16px 36px;">
                  <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7e22ce;">${code}</span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Código válido por <strong>1 hora</strong>.</p>
              </div>

              <p style="font-size: 13px; color: #64748b;">
                Si no realizaste esta solicitud, tu cuenta sigue estando protegida y puedes ignorar este mensaje.
              </p>
            </div>

            <div style="border-t: 1px solid #f1f5f9; pt: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 4px 0;">Ensueño Baby Colombia &copy; 2026</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error enviando correo de reset de contraseña:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Excepción en ResendService (Password Reset Code):', err);
      return { success: false, error: err };
    }
  }

  /**
   * Envía correo dulce y completo de confirmación de pedido con productos, imágenes y resumen de envío
   */
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
    if (!this.resend) {
      console.log(`[Resend Simulación] Confirmación de pedido ${params.orderNumber} enviada a ${params.to}`);
      return { success: true, simulated: true };
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co';
      const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(params.total);

      const itemsHtml = (params.items || [])
        .map((item) => {
          const itemImg = item.product?.image || 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';
          const itemPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.unitPrice * item.quantity);
          const details = [item.selectedFragrance, item.selectedSize].filter(Boolean).join(' • ');

          return `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; width: 64px;">
                <img src="${itemImg}" alt="${item.productName}" style="width: 56px; h-auto: 56px; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0;" />
              </td>
              <td style="padding: 12px 12px; border-bottom: 1px solid #f1f5f9;">
                <strong style="font-size: 14px; color: #1e293b; display: block;">${item.productName}</strong>
                ${details ? `<span style="font-size: 11px; color: #64748b;">${details}</span>` : ''}
                <span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 2px;">Cantidad: ${item.quantity}</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #6b21a8; font-size: 14px;">
                ${itemPrice}
              </td>
            </tr>
          `;
        })
        .join('');

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [params.to],
        subject: `¡Pago Aprobado y Pedido Confirmado! #${params.orderNumber} 💖 - Ensueño Baby`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #334155; background-color: #ffffff; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            {/* Header Banner */}
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #faf5ff;">
              <h1 style="color: #6b46c1; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Ensueño Baby ✨</h1>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">El cuidado más tierno para tu bebé</p>
            </div>
            
            {/* Main Greeting & Sweet Message */}
            <div style="padding: 24px 0 16px 0;">
              <div style="display: inline-block; background-color: #fdf4ff; border: 1px solid #f0abfc; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 800; color: #c026d3; margin-bottom: 12px;">
                ¡PAGO APROBADO Y CONFIRMADO! 🎉
              </div>
              <h2 style="color: #1e293b; font-size: 22px; font-weight: 800; margin: 0 0 12px 0;">
                ¡Gracias por tu compra, ${params.customerName}! 💖
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 12px 0;">
                Queremos agradecerte de todo corazón por elegir a <strong>Ensueño Baby</strong> para cuidar la piel y acompañar el descanso de tu bebé. ☁️
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                Confirmamos que tu pago para la orden <strong style="color: #7e22ce;">#${params.orderNumber}</strong> fue procesado con éxito. En este momento, nuestro equipo en el taller se encuentra preparando y empaquetando tus productos con todo el amor, la higiene y la dedicación que tu bebé merece.
              </p>

              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 16px; padding: 14px 18px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #0369a1; font-weight: 700;">
                  📦 Pronto actualizaremos el estado de tu pedido a <strong>"Empacada"</strong> y <strong>"En Camino"</strong> con tu guía de rastreo Servientrega.
                </p>
              </div>
            </div>

            {/* Products Table */}
            ${
              params.items && params.items.length > 0
                ? `
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                Resumen de tus Productos 🌸
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            `
                : ''
            }

            {/* Summary Card */}
            <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 16px; padding: 16px 20px; margin-between: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Número de Orden:</span>
                <strong style="color: #7e22ce; font-family: monospace;">#${params.orderNumber}</strong>
              </div>
              ${
                params.shippingAddress
                  ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Dirección de Entrega:</span>
                <strong style="color: #334155;">${params.shippingAddress}${params.city ? `, ${params.city}` : ''}</strong>
              </div>
              `
                  : ''
              }
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span style="color: #64748b;">Tiempo Estimado:</span>
                <strong style="color: #334155;">${params.deliveryEstimate || '2-4 días hábiles'}</strong>
              </div>
              <div style="border-top: 1px dashed #d8b4fe; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 16px;">
                <span style="font-weight: 800; color: #1e293b;">Total Pagado:</span>
                <strong style="font-weight: 900; color: #7e22ce; font-size: 18px;">${formattedTotal}</strong>
              </div>
            </div>

            {/* CTA Button */}
            <div style="text-align: center; margin: 32px 0 16px 0;">
              <a href="${appUrl}/confirmacion/${params.orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #38bdf8 100%); color: #ffffff; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(244, 114, 182, 0.4);">
                Ver Estado de Mi Pedido ✨
              </a>
            </div>

            {/* Footer */}
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 4px 0;">¿Tienes alguna inquietud sobre tu envío? Escríbenos a <a href="mailto:soporte@ensueno.com.co" style="color: #a855f7; text-decoration: underline;">soporte@ensueno.com.co</a></p>
              <p style="margin: 4px 0;">Ensueño Baby Colombia &copy; 2026 - Con todo nuestro amor 💖</p>
            </div>
          </div>
        `,
      });
      return { success: !error, data, error };
    } catch (err) {
      console.error('Error enviando correo de confirmación de pedido:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Envía recordatorio de remarketing / recompra
   */
  async sendRemarketingReminder(to: string, motherName: string, babyName: string, productTitle: string) {
    if (!this.resend) {
      console.log(`[Resend Simulación] Recordatorio de remarketing para ${motherName} (${babyName})`);
      return { success: true, simulated: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `¿Cómo va la rutina de sueño de ${babyName}? ✨ - Ensueño`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6b46c1;">Hola ${motherName},</h2>
            <p>Sabemos lo importante que es mantener la rutina de descanso y cuidado de <strong>${babyName}</strong>.</p>
            <p>Es posible que tu kit de <strong>${productTitle}</strong> esté por terminarse. Mantén su piel suave e hidratada sin interrupciones.</p>
            <p style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co'}/productos" style="background-color: #8b5cf6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Renovar Pedido</a>
            </p>
          </div>
        `,
      });
      return { success: !error, data, error };
    } catch (err) {
      return { success: false, error: err };
    }
  }
}

export const resendService = new ResendService();
