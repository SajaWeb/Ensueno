import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone, babyName, babyBirthDate, expectedDueDate, skinCondition } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios (email, contraseña, nombre)' }, { status: 400 });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'El correo electrónico ya se encuentra registrado' }, { status: 400 });
    }

    const user = await userRepository.createUser({
      email,
      password,
      fullName,
      phone,
      babyName,
      babyBirthDate: babyBirthDate ? new Date(babyBirthDate) : undefined,
      expectedDueDate: expectedDueDate ? new Date(expectedDueDate) : undefined,
      skinCondition,
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
        profile: user.motherProfile,
      },
    });

    response.cookies.set('ensueno_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Error en /api/v1/auth/register:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al registrar usuario' }, { status: 500 });
  }
}
