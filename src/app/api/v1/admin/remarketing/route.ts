import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { remarketingRepository } from '@/infrastructure/repositories/RemarketingRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function GET(req: Request) {
  try {
    const babyCohorts = await remarketingRepository.getBabyCohorts();
    const surveyResponses = await remarketingRepository.getSurveyResponses();
    const pendingReminders = await remarketingRepository.getPendingReminders();

    // Query all non-admin users registered in the system with their profile and orders
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
      },
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

    // Also fetch all MotherProfile records as fallback in case any mother profile exists directly
    const motherProfiles = await prisma.motherProfile.findMany({
      include: {
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
        babies: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Consolidate into unified customer list
    const customerMap = new Map<string, any>();

    users.forEach((u) => {
      customerMap.set(u.id, {
        id: u.id,
        email: u.email,
        role: u.role,
        loyaltyPoints: u.loyaltyPoints,
        createdAt: u.createdAt,
        profile: u.motherProfile
          ? {
              fullName: u.motherProfile.fullName,
              phone: u.motherProfile.phone,
              city: u.motherProfile.city,
              department: u.motherProfile.department,
              address: u.motherProfile.address,
              babies: u.motherProfile.babies,
            }
          : null,
        motherProfile: u.motherProfile,
        orders: u.orders,
      });
    });

    motherProfiles.forEach((mp) => {
      const key = mp.userId || mp.id;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          email: mp.user?.email || 'Sin correo',
          role: mp.user?.role || 'CUSTOMER',
          loyaltyPoints: mp.user?.loyaltyPoints || 0,
          createdAt: mp.createdAt,
          profile: {
            fullName: mp.fullName,
            phone: mp.phone,
            city: mp.city,
            department: mp.department,
            address: mp.address,
            babies: mp.babies,
          },
          motherProfile: {
            fullName: mp.fullName,
            phone: mp.phone,
            city: mp.city,
            department: mp.department,
            address: mp.address,
            babies: mp.babies,
          },
          orders: mp.user?.orders || [],
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
