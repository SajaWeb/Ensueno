import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { remarketingRepository } from '@/infrastructure/repositories/RemarketingRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function GET(req: Request) {
  try {
    const babyCohorts = await remarketingRepository.getBabyCohorts();
    const surveyResponses = await remarketingRepository.getSurveyResponses();
    const pendingReminders = await remarketingRepository.getPendingReminders();

    // 1. Fetch ALL MotherProfiles directly from database with associated babies and user orders
    const motherProfiles = await prisma.motherProfile.findMany({
      include: {
        babies: true,
        user: {
          include: {
            orders: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                total: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch ALL Users from database to ensure no user is left out
    const allUsers = await prisma.user.findMany({
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to build unified customer list
    const customerMap = new Map<string, any>();

    // Add all MotherProfile entries (guarantees mothers in screenshot like Juliana Carvajal Torres appear)
    motherProfiles.forEach((mp) => {
      const key = mp.userId || mp.id;
      customerMap.set(key, {
        id: mp.id,
        userId: mp.userId,
        email: mp.user?.email || 'Sin correo',
        fullName: mp.fullName,
        phone: mp.phone,
        city: mp.city,
        department: mp.department,
        address: mp.address,
        loyaltyPoints: mp.user?.loyaltyPoints || 0,
        createdAt: mp.createdAt,
        profile: {
          fullName: mp.fullName,
          phone: mp.phone,
          city: mp.city,
          department: mp.department,
          address: mp.address,
          babies: mp.babies || [],
        },
        motherProfile: {
          fullName: mp.fullName,
          phone: mp.phone,
          city: mp.city,
          department: mp.department,
          address: mp.address,
          babies: mp.babies || [],
        },
        babies: mp.babies || [],
        orders: mp.user?.orders || [],
      });
    });

    // Add any Users that might not have a MotherProfile record yet
    allUsers.forEach((u) => {
      if (!customerMap.has(u.id)) {
        customerMap.set(u.id, {
          id: u.id,
          userId: u.id,
          email: u.email,
          fullName: u.motherProfile?.fullName || u.email.split('@')[0],
          phone: u.motherProfile?.phone || 'Sin teléfono',
          city: u.motherProfile?.city || 'No especificada',
          department: u.motherProfile?.department || '',
          address: u.motherProfile?.address || '',
          loyaltyPoints: u.loyaltyPoints || 0,
          createdAt: u.createdAt,
          profile: u.motherProfile
            ? {
                fullName: u.motherProfile.fullName,
                phone: u.motherProfile.phone,
                city: u.motherProfile.city,
                department: u.motherProfile.department,
                address: u.motherProfile.address,
                babies: u.motherProfile.babies || [],
              }
            : null,
          motherProfile: u.motherProfile,
          babies: u.motherProfile?.babies || [],
          orders: u.orders || [],
        });
      }
    });

    const customers = Array.from(customerMap.values());

    return NextResponse.json({
      success: true,
      data: {
        babyCohorts,
        surveyResponses,
        pendingReminders,
        customers,
      },
    });
  } catch (err: any) {
    console.error('Error en GET /api/v1/admin/remarketing:', err);
    return NextResponse.json({ success: false, error: 'Error al obtener datos de remarketing' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, motherEmail, motherName, babyName, productTitle } = await req.json();

    if (action === 'send_reminder') {
      if (!motherEmail || !motherName || !babyName) {
        return NextResponse.json({ success: false, error: 'Datos de la mamá y bebé requeridos' }, { status: 400 });
      }

      const result = await resendService.sendRemarketingReminder(
        motherEmail,
        motherName,
        babyName,
        productTitle || 'Cremas & Pañitos Húmedos Ensueño'
      );

      return NextResponse.json({
        success: true,
        message: `Recordatorio de remarketing enviado a ${motherEmail}`,
        result,
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (err: any) {
    console.error('Error en POST /api/v1/admin/remarketing:', err);
    return NextResponse.json({ success: false, error: 'Error al enviar recordatorio de remarketing' }, { status: 500 });
  }
}
