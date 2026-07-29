import { NextResponse } from 'next/server';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ensueno_jwt_secret_token_9912';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Por favor ingresa tu correo y contraseña' }, { status: 400 });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await userRepository.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
    console.error('Error en /api/v1/auth/login:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error al iniciar sesión' }, { status: 500 });
  }
}
