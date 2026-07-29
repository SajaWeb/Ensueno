import { NextResponse } from 'next/server';
import { remarketingRepository } from '@/infrastructure/repositories/RemarketingRepository';
import { resendService } from '@/infrastructure/services/ResendService';

export async function GET(req: Request) {
  try {
    const babyCohorts = await remarketingRepository.getBabyCohorts();
    const surveyResponses = await remarketingRepository.getSurveyResponses();
    const pendingReminders = await remarketingRepository.getPendingReminders();

    return NextResponse.json({
      success: true,
      data: {
        babyCohorts,
        surveyResponses,
        pendingReminders,
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
