import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ensueno_jwt_secret_token_9912');

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ensueno_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch {
    return null;
  }
}

// GET all saved addresses for user
export async function GET() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const addresses = await prisma.savedAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: addresses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST create new address
export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { title, department, city, address, isDefault } = await req.json();

    if (!department || !city || !address) {
      return NextResponse.json({ success: false, error: 'Departamento, ciudad y dirección son obligatorios' }, { status: 400 });
    }

    if (isDefault) {
      // Unset previous default
      await prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.savedAddress.create({
      data: {
        userId,
        title: title || 'Hogar',
        department,
        city,
        address,
        isDefault: !!isDefault,
      },
    });

    // Also sync to MotherProfile default address if requested
    await prisma.motherProfile.updateMany({
      where: { userId },
      data: { department, city, address },
    });

    return NextResponse.json({ success: true, data: newAddress });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT edit saved address
export async function PUT(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id, title, department, city, address, isDefault } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de dirección requerido' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.savedAddress.update({
      where: { id },
      data: {
        title,
        department,
        city,
        address,
        isDefault,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE saved address
export async function DELETE(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de dirección requerido' }, { status: 400 });
    }

    await prisma.savedAddress.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Dirección eliminada' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
