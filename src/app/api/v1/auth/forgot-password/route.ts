import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Correo electrónico requerido' }, { status: 400 });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Retornar éxito por seguridad para prevenir enumeración de cuentas
      return NextResponse.json({
        success: true,
        message: 'Si el correo está registrado en nuestro sistema, recibirás un código de 6 dígitos pronto.',
      });
    }

    const resetTokenRecord = await userRepository.createPasswordResetToken(user.id);
    const motherName = user.motherProfile?.fullName || 'Mamá Ensueño';

    // Envío del correo con código numérico de 6 dígitos usando Resend
    await resendService.sendPasswordResetCodeEmail(user.email, motherName, resetTokenRecord.token);

    return NextResponse.json({
      success: true,
      message: 'Código de seguridad de 6 dígitos enviado exitosamente a tu correo.',
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/forgot-password:', err);
    return NextResponse.json({ success: false, error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
