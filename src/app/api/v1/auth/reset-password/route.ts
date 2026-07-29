import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: 'Token y nueva contraseña son requeridos' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const result = await userRepository.resetPasswordWithToken(token, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva clave.',
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/reset-password:', err);
    return NextResponse.json({ success: false, error: 'Error al restablecer contraseña' }, { status: 500 });
  }
}
