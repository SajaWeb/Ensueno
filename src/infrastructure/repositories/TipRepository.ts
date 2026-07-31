import { prisma } from '@/lib/prisma';
import { MOCK_TIPS } from '@/data/mockData';
import { Tip } from '@/types';

/**
 * Mismo patrón que ProductRepository: se intenta Prisma y, si la tabla todavía
 * no existe o la BD no responde, se cae a memoria sembrada con MOCK_TIPS.
 *
 * Esto importa porque el modelo `Tip` es nuevo: hasta que se corra la migración
 * el panel sigue funcionando contra memoria y no se rompe nada.
 */
let memoryTips: Tip[] = [...MOCK_TIPS];

const CATEGORY_LABELS: Record<string, string> = {
  sueno: 'Sueño Infantil',
  piel: 'Piel Delicada',
  higiene: 'Higiene & Cuidados',
  rutinas: 'Rutinas Diarias',
};

/** Normaliza una fila (de Prisma o de memoria) al tipo `Tip` del front. */
function toTip(row: Record<string, unknown>): Tip {
  const category = String(row.category ?? 'sueno') as Tip['category'];
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    category,
    categoryLabel: String(row.categoryLabel || CATEGORY_LABELS[category] || ''),
    readTime: String(row.readTime ?? ''),
    date: String(row.date ?? ''),
    author: String(row.author ?? ''),
    authorRole: String(row.authorRole ?? ''),
    image: String(row.image ?? ''),
    videoUrl: (row.videoUrl as string) || null,
    summary: String(row.summary ?? ''),
    content: Array.isArray(row.content) ? (row.content as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    isPublished: row.isPublished !== false,
    sortOrder: Number(row.sortOrder ?? 0),
  };
}

export class TipRepository {
  async getTips(category?: string, query?: string, includeUnpublished = false): Promise<Tip[]> {
    let items: Tip[] | null = null;

    try {
      const rows = await prisma.tip.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
      // Si la tabla existe pero está vacía, se usa la semilla en memoria para
      // que el sitio no aparezca sin contenido.
      if (rows.length > 0) items = rows.map((r) => toTip(r as Record<string, unknown>));
    } catch (err) {
      console.warn('Prisma getTips fallback warning:', err);
    }

    if (!items) items = memoryTips.map((t) => toTip(t as unknown as Record<string, unknown>));

    if (!includeUnpublished) items = items.filter((t) => t.isPublished !== false);
    if (category && category !== 'todos') items = items.filter((t) => t.category === category);

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return items;
  }

  async getTipById(id: string): Promise<Tip | null> {
    try {
      const row = await prisma.tip.findUnique({ where: { id } });
      if (row) return toTip(row as Record<string, unknown>);
    } catch (err) {
      console.warn('Prisma getTipById fallback warning:', err);
    }
    return memoryTips.find((t) => t.id === id) ?? null;
  }

  async createTip(data: Partial<Tip>): Promise<Tip> {
    const category = (data.category || 'sueno') as Tip['category'];
    const payload = {
      title: data.title || 'Nuevo tip',
      subtitle: data.subtitle || '',
      category,
      categoryLabel: data.categoryLabel || CATEGORY_LABELS[category] || '',
      readTime: data.readTime || '3 min lectura',
      date:
        data.date ||
        new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      author: data.author || '',
      authorRole: data.authorRole || '',
      image: data.image || '',
      videoUrl: data.videoUrl || null,
      summary: data.summary || '',
      content: data.content || [],
      tags: data.tags || [],
      isPublished: data.isPublished !== false,
      sortOrder: data.sortOrder ?? 0,
    };

    try {
      const row = await prisma.tip.create({ data: payload });
      return toTip(row as Record<string, unknown>);
    } catch (err) {
      console.warn('Prisma createTip fallback warning:', err);
      const created = toTip({ ...payload, id: `tip-${Date.now()}` });
      memoryTips = [created, ...memoryTips];
      return created;
    }
  }

  async updateTip(id: string, data: Partial<Tip>): Promise<Tip | null> {
    const patch: Record<string, unknown> = {};
    const fields: (keyof Tip)[] = [
      'title', 'subtitle', 'category', 'categoryLabel', 'readTime', 'date',
      'author', 'authorRole', 'image', 'videoUrl', 'summary', 'content',
      'tags', 'isPublished', 'sortOrder',
    ];
    fields.forEach((f) => {
      if (data[f] !== undefined) patch[f] = data[f];
    });
    // Si cambia la categoría y no mandan etiqueta, se recalcula.
    if (data.category && !data.categoryLabel) {
      patch.categoryLabel = CATEGORY_LABELS[data.category] || '';
    }

    try {
      const row = await prisma.tip.update({ where: { id }, data: patch });
      return toTip(row as Record<string, unknown>);
    } catch (err) {
      console.warn('Prisma updateTip fallback warning:', err);
      const idx = memoryTips.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      const merged = toTip({ ...memoryTips[idx], ...patch, id } as Record<string, unknown>);
      memoryTips[idx] = merged;
      return merged;
    }
  }

  async deleteTip(id: string): Promise<boolean> {
    try {
      await prisma.tip.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('Prisma deleteTip fallback warning:', err);
      const before = memoryTips.length;
      memoryTips = memoryTips.filter((t) => t.id !== id);
      return memoryTips.length < before;
    }
  }
}

export const tipRepository = new TipRepository();
