import { prisma } from '@/lib/prisma';

/**
 * Métricas de venta del panel.
 *
 * Solo cuentan los pedidos que llegaron a pagarse: un pedido en
 * `orden_generada` es una intención de compra, no una venta, y mezclarlos
 * inflaba las cifras. `anulada` y `devolucion` tampoco suman.
 */
const ESTADOS_VENDIDOS = ['confirmado', 'empacada', 'en_camino', 'entregada'];

export interface RangoMetricas {
  /** Días hacia atrás. 0 o ausente = todo el histórico. */
  dias?: number;
}

const desde = (dias?: number) =>
  dias && dias > 0 ? { createdAt: { gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000) } } : {};

export class AnalyticsRepository {
  async getMetrics({ dias }: RangoMetricas = {}) {
    const where = { status: { in: ESTADOS_VENDIDOS }, ...desde(dias) };

    const pedidos = await prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        city: true,
        department: true,
        customerEmail: true,
        customerName: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            subtotal: true,
            selectedSize: true,
            selectedFragrance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Un pedido sin pagar sigue siendo útil como referencia: dice cuántas
    // compras se quedan a medio camino.
    const sinPagar = await prisma.order.count({
      where: { status: 'orden_generada', ...desde(dias) },
    });

    const ingresos = pedidos.reduce((s, o) => s + o.total, 0);
    const unidades = pedidos.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

    /** Agrupa por una clave y acumula unidades e ingresos. */
    const acumular = <T>(
      filas: T[],
      clave: (x: T) => string | null | undefined,
      unidadesDe: (x: T) => number,
      ingresoDe: (x: T) => number
    ) => {
      const mapa = new Map<string, { nombre: string; unidades: number; ingresos: number; pedidos: number }>();
      for (const fila of filas) {
        const k = (clave(fila) || '').trim();
        if (!k) continue;
        const actual = mapa.get(k) || { nombre: k, unidades: 0, ingresos: 0, pedidos: 0 };
        actual.unidades += unidadesDe(fila);
        actual.ingresos += ingresoDe(fila);
        actual.pedidos += 1;
        mapa.set(k, actual);
      }
      return [...mapa.values()].sort((a, b) => b.unidades - a.unidades);
    };

    const lineas = pedidos.flatMap((o) => o.items);

    // Se agrupa por productId y no por el nombre: `OrderItem.productName` es el
    // nombre que tenía el producto el día de la compra, así que al renombrarlo
    // (Crema → Mantequilla) el ranking lo partía en dos productos distintos.
    const nombresActuales = new Map(
      (await prisma.product.findMany({ select: { id: true, name: true } })).map((p) => [p.id, p.name])
    );

    const productos = acumular(
      lineas,
      (i) => i.productId,
      (i) => i.quantity,
      (i) => i.subtotal
    ).map((p) => ({
      ...p,
      // Si el producto ya no existe en el catálogo, se conserva el nombre
      // histórico de la línea para no mostrar un id crudo.
      nombre: nombresActuales.get(p.nombre) || lineas.find((i) => i.productId === p.nombre)?.productName || p.nombre,
    }));

    const presentaciones = acumular(
      lineas.filter((i) => i.selectedSize),
      (i) => i.selectedSize,
      (i) => i.quantity,
      (i) => i.subtotal
    );

    const fragancias = acumular(
      lineas.filter((i) => i.selectedFragrance),
      (i) => i.selectedFragrance,
      (i) => i.quantity,
      (i) => i.subtotal
    );

    // Por ciudad y departamento cuentan pedidos, no unidades: la pregunta es
    // a dónde hay que despachar, no cuántos frascos van en cada caja.
    const ciudades = acumular(
      pedidos,
      (o) => (o.city ? `${o.city}${o.department ? `, ${o.department}` : ''}` : null),
      () => 1,
      (o) => o.total
    );

    const departamentos = acumular(
      pedidos,
      (o) => o.department,
      () => 1,
      (o) => o.total
    );

    // Clientas que más han comprado, por plata gastada.
    const clientas = acumular(
      pedidos,
      (o) => o.customerEmail,
      () => 1,
      (o) => o.total
    )
      .map((c) => ({
        ...c,
        nombre: pedidos.find((o) => o.customerEmail === c.nombre)?.customerName || c.nombre,
        email: c.nombre,
      }))
      .sort((a, b) => b.ingresos - a.ingresos);

    // Últimos 12 meses, incluidos los vacíos: una serie con huecos se lee mal.
    const meses: Array<{ mes: string; etiqueta: string; ingresos: number; pedidos: number }> = [];
    const hoy = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      meses.push({
        mes,
        etiqueta: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
        ingresos: 0,
        pedidos: 0,
      });
    }
    for (const o of pedidos) {
      const mes = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const fila = meses.find((m) => m.mes === mes);
      if (fila) {
        fila.ingresos += o.total;
        fila.pedidos += 1;
      }
    }

    return {
      resumen: {
        ingresos,
        pedidos: pedidos.length,
        unidades,
        ticketPromedio: pedidos.length ? Math.round(ingresos / pedidos.length) : 0,
        sinPagar,
        clientasUnicas: new Set(pedidos.map((o) => o.customerEmail)).size,
      },
      productos: productos.slice(0, 10),
      presentaciones: presentaciones.slice(0, 8),
      fragancias: fragancias.slice(0, 8),
      ciudades: ciudades.slice(0, 10),
      departamentos: departamentos.slice(0, 10),
      clientas: clientas.slice(0, 10),
      meses,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
