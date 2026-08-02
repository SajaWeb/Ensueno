import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, noAutorizado } from '@/lib/adminAuth';
import { remarketingRepository } from '@/infrastructure/repositories/RemarketingRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return noAutorizado();
    }

    const babyCohorts = await remarketingRepository.getBabyCohorts();
    const surveyResponses = await remarketingRepository.getSurveyResponses();
    const pendingReminders = await remarketingRepository.getPendingReminders();

    // Consulta optimizada única: Obtiene EXCLUSIVAMENTE usuarios con rol CUSTOMER y sus perfiles asociados
    const customerUsers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
        motherProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            city: true,
            department: true,
            address: true,
            hasBaby: true,
            babies: {
              select: {
                id: true,
                babyName: true,
                birthDate: true,
                expectedDueDate: true,
                skinCondition: true,
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mapeo limpio y directo para el módulo CRM
    const customers = customerUsers.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
      fullName: user.motherProfile?.fullName || user.email.split('@')[0],
      phone: user.motherProfile?.phone || 'Sin teléfono',
      city: user.motherProfile?.city || 'No especificada',
      department: user.motherProfile?.department || '',
      address: user.motherProfile?.address || '',
      profile: user.motherProfile,
      motherProfile: user.motherProfile,
      babies: user.motherProfile?.babies || [],
      orders: user.orders || [],
    }));

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
    const admin = await requireAdmin();
    if (!admin) {
      return noAutorizado();
    }

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
