import { NextResponse } from 'next/server';
import { INITIAL_USER_PROFILE } from '@/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_USER_PROFILE,
  });
}

export async function PUT(request: Request) {
  try {
    const updatedProfile = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: updatedProfile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}
