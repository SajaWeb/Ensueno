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
   * Envía correo de confirmación de pedido
   */
  async sendOrderConfirmationEmail(to: string, customerName: string, orderId: string, total: number) {
    if (!this.resend) {
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
            <p>Puedes hacerle seguimiento en tiempo real desde tu perfil en <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co'}/perfil">ensueno.com.co</a>.</p>
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
