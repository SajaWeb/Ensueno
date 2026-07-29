import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getJwtSecretEncoded } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ensueno_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecretEncoded());
    const userId = payload.id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
        savedAddresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints || 0,
        profile: user.motherProfile,
        savedAddresses: user.savedAddresses || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, authenticated: false, error: err.message }, { status: 401 });
  }
}
