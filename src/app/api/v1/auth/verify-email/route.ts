import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Correo y código de 6 dígitos son obligatorios' }, { status: 400 });
    }

    const result = await userRepository.verifyEmailCode(email, code);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '¡Correo electrónico verificado exitosamente!',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        role: result.user?.role,
        emailVerified: true,
        profile: result.user?.motherProfile,
      },
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/verify-email:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al verificar código' }, { status: 500 });
  }
}
