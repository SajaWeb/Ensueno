import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ensueño <no-reply@ensueno.com.co>';

export class ResendService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(resendApiKey);
  }

  /**
   * Envía correo de recuperación de contraseña con token temporal
   */
  async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
      console.log(`[Resend Simulación] Reset password link enviado a ${to}: ${resetLink}`);
      return { success: true, simulated: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: 'Restablece tu contraseña - Ensueño Baby',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6b46c1;">Hola ${name},</h2>
            <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>Ensueño</strong>.</p>
            <p>Haz clic en el siguiente botón para continuar:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
            </p>
            <p style="font-size: 13px; color: #666;">Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura. El enlace expirará en 1 hora.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">Ensueño Baby - Cuidado puro y natural para tu bebé.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Error enviando email de reset con Resend:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Excepción en ResendService:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Envía correo de confirmación de pedido
   */
  async sendOrderConfirmationEmail(to: string, customerName: string, orderId: string, total: number) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
      console.log(`[Resend Simulación] Confirmación de pedido ${orderId} enviada a ${to}`);
      return { success: true, simulated: true };
    }

    try {
      const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total);
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `¡Pedido Confirmado! #${orderId} - Ensueño`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6b46c1;">¡Gracias por tu compra, ${customerName}! 💖</h2>
            <p>Tu pedido <strong>#${orderId}</strong> ha sido confirmado con éxito y ya lo estamos preparando con todo el amor.</p>
            <p><strong>Total pagado:</strong> ${formattedTotal}</p>
            <p>Puedes hacerle seguimiento en tiempo real desde tu perfil en <a href="${process.env.NEXT_PUBLIC_APP_URL}/perfil">ensueno.com.co</a>.</p>
          </div>
        `,
      });
      return { success: !error, data, error };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  /**
   * Envía recordatorio de remarketing / recompra
   */
  async sendRemarketingReminder(to: string, motherName: string, babyName: string, productTitle: string) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
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
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/productos" style="background-color: #8b5cf6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Renovar Pedido</a>
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
