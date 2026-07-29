import { prisma } from '@/lib/prisma';

export class RemarketingRepository {
  /**
   * Guarda una respuesta de encuesta
   */
  async saveSurveyResponse(data: { userId?: string; customerEmail?: string; surveyType: string; answers: any; score?: number }) {
    return prisma.surveyResponse.create({
      data: {
        userId: data.userId,
        customerEmail: data.customerEmail,
        surveyType: data.surveyType,
        answers: data.answers,
        score: data.score,
      },
    });
  }

  /**
   * Obtiene respuestas de encuestas para el Admin
   */
  async getSurveyResponses(surveyType?: string) {
    return prisma.surveyResponse.findMany({
      where: surveyType ? { surveyType } : undefined,
      include: {
        user: {
          include: {
            motherProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene análisis de cohortes de clientes según la etapa del bebé
   */
  async getBabyCohorts() {
    try {
      const babies = await prisma.babyProfile.findMany({
        include: {
          mother: {
            include: {
              user: true,
            },
          },
        },
      });

      const cohorts = {
        embarazo: [] as typeof babies,
        recienNacido: [] as typeof babies, // 0 - 3 meses
        lactanteMenor: [] as typeof babies, // 3 - 6 meses
        lactanteMayor: [] as typeof babies, // 6 - 12 meses
        toddler: [] as typeof babies, // 12+ meses
      };

      const now = new Date();

      babies.forEach((baby) => {
        if (baby.expectedDueDate && baby.expectedDueDate > now) {
          cohorts.embarazo.push(baby);
        } else if (baby.birthDate) {
          const ageInMonths = (now.getTime() - new Date(baby.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
          if (ageInMonths < 3) cohorts.recienNacido.push(baby);
          else if (ageInMonths < 6) cohorts.lactanteMenor.push(baby);
          else if (ageInMonths < 12) cohorts.lactanteMayor.push(baby);
          else cohorts.toddler.push(baby);
        } else {
          cohorts.recienNacido.push(baby);
        }
      });

      return {
        totalBabies: babies.length,
        summary: {
          embarazo: cohorts.embarazo.length,
          recienNacido: cohorts.recienNacido.length,
          lactanteMenor: cohorts.lactanteMenor.length,
          lactanteMayor: cohorts.lactanteMayor.length,
          toddler: cohorts.toddler.length,
        },
        cohorts,
      };
    } catch (err) {
      console.warn('Prisma getBabyCohorts fallback warning:', err);
      return {
        totalBabies: 0,
        summary: { embarazo: 0, recienNacido: 0, lactanteMenor: 0, lactanteMayor: 0, toddler: 0 },
        cohorts: { embarazo: [], recienNacido: [], lactanteMenor: [], lactanteMayor: [], toddler: [] },
      };
    }
  }

  /**
   * Genera o busca recordatorios de recompra pendientes
   */
  async getPendingReminders() {
    return prisma.remarketingTrigger.findMany({
      where: { sentStatus: 'PENDING' },
      include: {
        mother: {
          include: {
            user: true,
          },
        },
        baby: true,
      },
      orderBy: { targetDate: 'asc' },
    });
  }
}

export const remarketingRepository = new RemarketingRepository();
