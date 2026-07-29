import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getJwtSecretEncoded } from '@/lib/jwt';

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ensueno_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecretEncoded());
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
        savedAddresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints || 0,
        fullName: user.motherProfile?.fullName || '',
        docType: user.motherProfile?.docType || 'CC',
        docNumber: user.motherProfile?.docNumber || '',
        phone: user.motherProfile?.phone || '',
        department: user.motherProfile?.department || '',
        city: user.motherProfile?.city || '',
        address: user.motherProfile?.address || '',
        babyName: user.motherProfile?.babies[0]?.babyName || '',
        skinCondition: user.motherProfile?.babies[0]?.skinCondition || 'Sensible',
        birthDate: user.motherProfile?.babies[0]?.birthDate || null,
        savedAddresses: user.savedAddresses || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      fullName,
      docType,
      docNumber,
      phone,
      department,
      city,
      address,
      babyName,
      skinCondition,
      currentPassword,
      newPassword,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { motherProfile: { include: { babies: true } } },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Process Password Change if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Ingresa tu contraseña actual' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'La contraseña actual no es correcta' }, { status: 400 });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });
    }

    // Upsert MotherProfile (docType and docNumber are immutable once set for electronic invoicing)
    let mother = user.motherProfile;
    const canSetDoc = !mother || !mother.docNumber;

    if (!mother) {
      mother = await prisma.motherProfile.create({
        data: {
          userId,
          fullName: fullName || user.email.split('@')[0],
          docType: docType || 'CC',
          docNumber: docNumber || null,
          phone: phone || null,
          department: department || null,
          city: city || null,
          address: address || null,
        },
        include: { babies: true },
      });
    } else {
      mother = await prisma.motherProfile.update({
        where: { id: mother.id },
        data: {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(canSetDoc && docType !== undefined ? { docType } : {}),
          ...(canSetDoc && docNumber !== undefined ? { docNumber } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(department !== undefined ? { department } : {}),
          ...(city !== undefined ? { city } : {}),
          ...(address !== undefined ? { address } : {}),
        },
        include: { babies: true },
      });
    }

    // Upsert BabyProfile
    if (babyName || skinCondition) {
      const existingBaby = mother.babies[0];
      if (existingBaby) {
        await prisma.babyProfile.update({
          where: { id: existingBaby.id },
          data: {
            ...(babyName ? { babyName } : {}),
            ...(skinCondition ? { skinCondition } : {}),
          },
        });
      } else {
        await prisma.babyProfile.create({
          data: {
            motherId: mother.id,
            babyName: babyName || 'Bebé',
            skinCondition: skinCondition || 'Sensible',
          },
        });
      }
    }

    // Also sync address to SavedAddress if default address doesn't exist
    if (department && city && address) {
      const existingAddr = await prisma.savedAddress.findFirst({
        where: { userId, department, city, address },
      });
      if (!existingAddr) {
        await prisma.savedAddress.create({
          data: {
            userId,
            title: 'Hogar',
            department,
            city,
            address,
            isDefault: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil y preferencias actualizadas correctamente',
    });
  } catch (error: any) {
    console.error('Error actualizando perfil:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}
