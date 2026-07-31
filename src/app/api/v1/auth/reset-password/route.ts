import { NextResponse } from 'next/server';
import { resendService } from '@/infrastructure/services/ResendService';
import { userRepository } from '@/infrastructure/repositories/UserRepository';

export async function POST(req: Request) {
  try {
    const { token, code, email, newPassword } = await req.json();
    const verificationCode = code || token;

    if (!verificationCode || !newPassword) {
      return NextResponse.json({ success: false, error: 'Código de seguridad y nueva contraseña son requeridos' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const result = await userRepository.resetPasswordWithToken(email || '', verificationCode, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    if (email) {
      resendService
        .sendPasswordChangedEmail(email, email.split('@')[0])
        .catch((e) => console.error('No se pudo enviar el aviso de cambio de clave:', e));
    }

    return NextResponse.json({
      success: true,
      message: '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva clave.',
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/reset-password:', err);
    return NextResponse.json({ success: false, error: 'Error al restablecer contraseña' }, { status: 500 });
  }
}
