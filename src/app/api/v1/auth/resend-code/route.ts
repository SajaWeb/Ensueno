import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Correo electrónico es requerido' }, { status: 400 });
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: 'Tu cuenta ya se encuentra verificada' });
    }

    const newCode = await userRepository.generateVerificationCode(user.id);
    const motherName = user.motherProfile?.fullName || email.split('@')[0];

    await resendService.sendVerificationCodeEmail(email, motherName, newCode);

    return NextResponse.json({
      success: true,
      message: `Nuevo código de confirmación enviado a ${email}`,
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/resend-code:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al reenviar código' }, { status: 500 });
  }
}
