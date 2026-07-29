import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ensueno_jwt_secret_token_9912');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger la API de administración (/api/v1/admin) para verificar el rol ADMIN
  if (pathname.startsWith('/api/v1/admin')) {
    const token = request.cookies.get('ensueno_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado: Token requerido' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Acceso denegado: Se requieren permisos de Administrador' }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Sesión expirada' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/admin/:path*'],
};
