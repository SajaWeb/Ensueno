import { prisma } from '@/lib/prisma';

/** Estados que puede tener el contacto de opinión. */
export const ESTADOS_FEEDBACK = ['PENDIENTE', 'CONTACTADA', 'SIN_RESPUESTA', 'NO_INTERESA'] as const;
/** Estados que puede tener el contacto de recompra. */
export const ESTADOS_RECOMPRA = ['PENDIENTE', 'CONTACTADA', 'VA_A_COMPRAR', 'NO_QUIERE'] as const;

/** Un pedido anulado o devuelto no se sigue: no hay a quién preguntarle. */
const ESTADOS_SEGUIBLES = ['confirmado', 'empacada', 'en_camino', 'entregada'];

const dias = (n: number) => n * 24 * 60 * 60 * 1000;

export class FollowUpRepository {
  async getConfig() {
    const config = await prisma.followUpConfig.findUnique({ where: { id: 'global' } });
    return config ?? { id: 'global', feedbackDelayDays: 5, repurchaseDelayDays: 30, updatedAt: new Date() };
  }

  async updateConfig(feedbackDelayDays: number, repurchaseDelayDays: number) {
    const limpio = (n: number, tope: number) => Math.min(Math.max(Math.round(n) || 0, 1), tope);
    const data = {
      feedbackDelayDays: limpio(feedbackDelayDays, 90),
      repurchaseDelayDays: limpio(repurchaseDelayDays, 365),
    };
    const config = await prisma.followUpConfig.upsert({
      where: { id: 'global' },
      update: data,
      create: { id: 'global', ...data },
    });

    // Los plazos nuevos aplican a lo que todavía no se ha contactado; lo ya
    // registrado no se toca, sería reescribir historia.
    await this.recalcularPendientes();
    return config;
  }

  /**
   * Crea la ficha de seguimiento de los pedidos que aún no la tienen y ajusta
   * las fechas de los que siguen pendientes.
   *
   * Se llama al abrir el módulo en vez de con un cron: el panel es el único
   * que consume esto, y así no hace falta un proceso aparte corriendo.
   */
  async recalcularPendientes() {
    const { feedbackDelayDays, repurchaseDelayDays } = await this.getConfig();

    const pedidos = await prisma.order.findMany({
      where: { status: { in: ESTADOS_SEGUIBLES } },
      select: { id: true, createdAt: true, followUp: { select: { id: true, feedbackStatus: true, repurchaseStatus: true } } },
    });

    const nuevos = pedidos.filter((o) => !o.followUp);
    if (nuevos.length) {
      await prisma.orderFollowUp.createMany({
        data: nuevos.map((o) => ({
          orderId: o.id,
          feedbackDueAt: new Date(o.createdAt.getTime() + dias(feedbackDelayDays)),
          repurchaseDueAt: new Date(o.createdAt.getTime() + dias(repurchaseDelayDays)),
        })),
        skipDuplicates: true,
      });
    }

    // Reajusta fechas de los que siguen sin contactar.
    const porRecalcular = pedidos.filter(
      (o) => o.followUp && (o.followUp.feedbackStatus === 'PENDIENTE' || o.followUp.repurchaseStatus === 'PENDIENTE')
    );
    await Promise.all(
      porRecalcular.map((o) =>
        prisma.orderFollowUp.update({
          where: { orderId: o.id },
          data: {
            ...(o.followUp!.feedbackStatus === 'PENDIENTE'
              ? { feedbackDueAt: new Date(o.createdAt.getTime() + dias(feedbackDelayDays)) }
              : {}),
            ...(o.followUp!.repurchaseStatus === 'PENDIENTE'
              ? { repurchaseDueAt: new Date(o.createdAt.getTime() + dias(repurchaseDelayDays)) }
              : {}),
          },
        })
      )
    );

    return nuevos.length;
  }

  /** Todo lo que el módulo necesita pintar, en una sola consulta. */
  async getBandeja() {
    await this.recalcularPendientes();

    const filas = await prisma.orderFollowUp.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            city: true,
            department: true,
            total: true,
            status: true,
            createdAt: true,
            items: { select: { productName: true, quantity: true, selectedSize: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ahora = new Date();
    const mapear = (f: (typeof filas)[number]) => ({
      id: f.id,
      orderNumber: f.order.orderNumber,
      cliente: f.order.customerName,
      email: f.order.customerEmail,
      telefono: f.order.customerPhone,
      ciudad: [f.order.city, f.order.department].filter(Boolean).join(', '),
      total: f.order.total,
      estadoPedido: f.order.status,
      compradoEl: f.order.createdAt,
      productos: f.order.items.map((i) => `${i.quantity}× ${i.productName}${i.selectedSize ? ` (${i.selectedSize})` : ''}`),
      feedbackStatus: f.feedbackStatus,
      feedbackChannel: f.feedbackChannel,
      productRating: f.productRating,
      processRating: f.processRating,
      feedbackComment: f.feedbackComment,
      feedbackDueAt: f.feedbackDueAt,
      feedbackAt: f.feedbackAt,
      repurchaseStatus: f.repurchaseStatus,
      repurchaseNotes: f.repurchaseNotes,
      repurchaseDueAt: f.repurchaseDueAt,
      repurchaseAt: f.repurchaseAt,
      handledBy: f.handledBy,
    });

    const todas = filas.map(mapear);
    const vencida = (d: Date | null) => Boolean(d && d <= ahora);

    return {
      // Lo que toca llamar hoy, que es con lo que arranca el equipo.
      opinionPendiente: todas
        .filter((f) => f.feedbackStatus === 'PENDIENTE' && vencida(f.feedbackDueAt))
        .sort((a, b) => +new Date(a.feedbackDueAt!) - +new Date(b.feedbackDueAt!)),
      recompraPendiente: todas
        .filter((f) => f.repurchaseStatus === 'PENDIENTE' && vencida(f.repurchaseDueAt))
        .sort((a, b) => +new Date(a.repurchaseDueAt!) - +new Date(b.repurchaseDueAt!)),
      // Lo que ya se registró, para consultar y para medir satisfacción.
      registradas: todas.filter((f) => f.feedbackStatus !== 'PENDIENTE' || f.repurchaseStatus !== 'PENDIENTE'),
      todas,
      resumen: this.resumir(todas),
    };
  }

  private resumir(todas: Array<Record<string, any>>) {
    const conNota = todas.filter((f) => typeof f.productRating === 'number');
    const promedio = (campo: string) => {
      const vals = todas.map((f) => f[campo]).filter((n): n is number => typeof n === 'number');
      return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    };
    return {
      opinionesRecogidas: conNota.length,
      notaProducto: promedio('productRating'),
      notaProceso: promedio('processRating'),
      vanAComprar: todas.filter((f) => f.repurchaseStatus === 'VA_A_COMPRAR').length,
    };
  }

  /** Registra el resultado de un contacto. `tipo` decide qué bloque se toca. */
  async registrarContacto(
    id: string,
    tipo: 'feedback' | 'recompra',
    datos: {
      status?: string;
      channel?: string;
      productRating?: number | null;
      processRating?: number | null;
      comment?: string;
      notes?: string;
    },
    handledBy?: string
  ) {
    const existe = await prisma.orderFollowUp.findUnique({ where: { id } });
    if (!existe) return null;

    const limpiarNota = (n: number | null | undefined) =>
      typeof n === 'number' && n >= 1 && n <= 5 ? Math.round(n) : null;

    const data =
      tipo === 'feedback'
        ? {
            feedbackStatus: (ESTADOS_FEEDBACK as readonly string[]).includes(datos.status || '')
              ? datos.status!
              : 'CONTACTADA',
            feedbackChannel: datos.channel || null,
            productRating: limpiarNota(datos.productRating),
            processRating: limpiarNota(datos.processRating),
            feedbackComment: datos.comment?.trim() || null,
            feedbackAt: new Date(),
            handledBy: handledBy || existe.handledBy,
          }
        : {
            repurchaseStatus: (ESTADOS_RECOMPRA as readonly string[]).includes(datos.status || '')
              ? datos.status!
              : 'CONTACTADA',
            repurchaseNotes: datos.notes?.trim() || null,
            repurchaseAt: new Date(),
            handledBy: handledBy || existe.handledBy,
          };

    return prisma.orderFollowUp.update({ where: { id }, data });
  }

  /** Devuelve el contacto a pendiente, por si se registró por equivocación. */
  async reabrir(id: string, tipo: 'feedback' | 'recompra') {
    const existe = await prisma.orderFollowUp.findUnique({ where: { id } });
    if (!existe) return null;

    return prisma.orderFollowUp.update({
      where: { id },
      data:
        tipo === 'feedback'
          ? { feedbackStatus: 'PENDIENTE', feedbackAt: null }
          : { repurchaseStatus: 'PENDIENTE', repurchaseAt: null },
    });
  }
}

export const followUpRepository = new FollowUpRepository();
