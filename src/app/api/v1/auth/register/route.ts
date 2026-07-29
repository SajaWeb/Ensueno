import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { resendService } from '@/infrastructure/services/ResendService';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, docType, docNumber, phone, babyName, babyBirthDate, expectedDueDate, skinCondition, acceptDataPolicy } = body;

    if (!acceptDataPolicy) {
      return NextResponse.json({ success: false, error: 'Debes aceptar la Política de Tratamiento de Datos Personales para registrarte.' }, { status: 400 });
    }

    if (!email || !password || !fullName || !docNumber) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios (email, contraseña, nombre, número de documento)' }, { status: 400 });
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'El correo electrónico ya se encuentra registrado con otra cuenta.' }, { status: 400 });
    }

    const existingDoc = await userRepository.findByDocNumber(docNumber);
    if (existingDoc) {
      return NextResponse.json({ success: false, error: 'El número de documento ya se encuentra registrado con otra cuenta.' }, { status: 400 });
    }

    if (phone && phone.trim()) {
      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        return NextResponse.json({ success: false, error: 'El número de teléfono / WhatsApp ya se encuentra registrado con otra cuenta.' }, { status: 400 });
      }
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const user = await userRepository.createUser({
      email,
      password,
      fullName,
      docType: docType || 'CC',
      docNumber,
      phone,
      babyName,
      babyBirthDate: babyBirthDate ? new Date(babyBirthDate) : undefined,
      expectedDueDate: expectedDueDate ? new Date(expectedDueDate) : undefined,
      skinCondition,
      verificationCode,
      verificationExpires,
    });

    // Envío del correo con código numérico de 6 dígitos mediante Resend
    resendService.sendVerificationCodeEmail(email, fullName, verificationCode).catch((e) => {
      console.error('Error enviando correo de verificación con Resend:', e);
    });

    const secret = getJwtSecret();
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: false,
        profile: user.motherProfile,
      },
      message: 'Cuenta creada exitosamente. Se ha enviado un código de confirmación de 6 dígitos a tu correo.',
    });

    response.cookies.set('ensueno_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Error en /api/v1/auth/register:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al registrar usuario' }, { status: 500 });
  }
}
