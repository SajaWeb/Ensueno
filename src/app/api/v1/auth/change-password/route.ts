import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getJwtSecretEncoded } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/ensueno_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado: Token no proporcionado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecretEncoded());
    const userId = (payload.id || payload.userId) as string;

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'La contraseña actual es incorrecta' }, { status: 400 });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: '¡Contraseña actualizada exitosamente!' });
  } catch (err: any) {
    console.error('Error cambiando contraseña:', err);
    return NextResponse.json({ success: false, error: 'Error al cambiar contraseña' }, { status: 500 });
  }
}
