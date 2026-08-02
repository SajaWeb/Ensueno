import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecretEncoded } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export interface AdminSession {
  id: string;
  role: string;
  email: string;
}

/** Respuesta única para todo lo que exige rol de administrador. */
export const noAutorizado = () =>
  NextResponse.json(
    { success: false, error: 'No autorizado. Se requiere rol de Administrador' },
    { status: 401 }
  );

/**
 * Devuelve la sesión si quien llama es administrador, o null.
 *
 * El middleware ya filtra `/api/v1/admin/*`, pero el rol se revalida aquí
 * contra la base y no contra el payload del token: un token firmado antes de
 * que se le revocara el acceso a alguien seguiría diciendo `role: 'ADMIN'`.
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ensueno_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretEncoded());
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, role: true, email: true },
    });

    if (user && user.role === 'ADMIN') {
      return user;
    }
  } catch (err) {
    // Token inválido, expirado o firmado con otro secreto.
  }
  return null;
}
