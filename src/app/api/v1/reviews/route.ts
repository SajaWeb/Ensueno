import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { getJwtSecretEncoded } from '@/lib/jwt';

// Helper to verify user from cookie
async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('ensueno_auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecretEncoded());
    return payload as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Get the user name (either from MotherProfile or fallback to a default)
    const motherProfile = await prisma.motherProfile.findUnique({ where: { userId: user.id } });
    const userName = motherProfile?.fullName || user.email.split('@')[0];

    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: { productId, userId: user.id },
    });

    let review;
    if (existing) {
      // Update existing
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: Number(rating), comment },
      });
    } else {
      // Create new
      review = await prisma.review.create({
        data: {
          productId,
          userId: user.id,
          userName,
          rating: Number(rating),
          comment,
        },
      });
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    // P2003: el productId no existe en la tabla Product. Pasa con los combos
    // ("combo-*"), que se sintetizan y no tienen fila propia.
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Este producto no admite reseñas.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: 'No pudimos guardar la reseña.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, rating, comment } = body;

    if (!id || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { rating: Number(rating), comment },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ONLY ADMIN CAN DELETE REVIEWS
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Solo los administradores pueden eliminar reseñas.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
