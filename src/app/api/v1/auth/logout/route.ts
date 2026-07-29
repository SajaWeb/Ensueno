import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' });
  response.cookies.set('ensueno_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
