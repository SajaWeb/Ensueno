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
      // Retornar éxito por seguridad aunque no exista
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación pronto.',
      });
    }

    const resetTokenRecord = await userRepository.createPasswordResetToken(user.id);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ensueno.com.co'}/recuperar-password?token=${resetTokenRecord.token}`;

    const motherName = user.motherProfile?.fullName || 'Mamá Ensueño';
    await resendService.sendPasswordResetEmail(user.email, motherName, resetLink);

    return NextResponse.json({
      success: true,
      message: 'Correo de recuperación enviado con éxito.',
    });
  } catch (err: any) {
    console.error('Error en /api/v1/auth/forgot-password:', err);
    return NextResponse.json({ success: false, error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
