import { prisma } from '@/lib/prisma';

export interface HeroSlideData {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  showMascot: boolean;
  isActive: boolean;
  sortOrder: number;
}

/**
 * El hero que la portada trae escrito de fábrica.
 *
 * Se usa mientras no haya ninguna diapositiva activa, para que la portada
 * nunca quede con un hueco: vaciar la tabla desde el panel no puede dejar la
 * home sin encabezado.
 */
export const HERO_POR_DEFECTO: HeroSlideData = {
  id: 'default',
  eyebrow: 'Cuidado pediátrico · Colombia',
  title: 'El cuidado más tierno para tu bebé',
  subtitle:
    'Tres esenciales sin alcohol, sin parabenos y probados dermatológicamente: pañitos, colonia y crema corporal.',
  image: '/hero-familia.png',
  imageAlt: 'Mamá y bebé con la Colonia Ensueño',
  primaryLabel: 'Ver productos',
  primaryHref: '#productos',
  secondaryLabel: 'Leer los tips',
  secondaryHref: '/tips',
  showMascot: true,
  isActive: true,
  sortOrder: 0,
};

const INTERVALO_POR_DEFECTO = 6000;

export class HeroRepository {
  /**
   * Diapositivas ordenadas. `includeAll` es para el panel, que también tiene
   * que ver las apagadas.
   */
  async getSlides(includeAll = false): Promise<HeroSlideData[]> {
    const slides = await prisma.heroSlide.findMany({
      where: includeAll ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return slides as HeroSlideData[];
  }

  /** Lo que consume la portada: nunca vacío. */
  async getSlidesForHome(): Promise<HeroSlideData[]> {
    const slides = await this.getSlides();
    return slides.length > 0 ? slides : [HERO_POR_DEFECTO];
  }

  async getConfig() {
    const config = await prisma.heroConfig.findUnique({ where: { id: 'global' } });
    return config ?? { id: 'global', intervalMs: INTERVALO_POR_DEFECTO, updatedAt: new Date() };
  }

  async updateConfig(intervalMs: number) {
    // Ni tan rápido que no se alcance a leer, ni tan lento que parezca fijo.
    // 0 se conserva tal cual: significa "no avanzar solo".
    const limpio = intervalMs <= 0 ? 0 : Math.min(Math.max(Math.round(intervalMs), 2000), 30000);

    return prisma.heroConfig.upsert({
      where: { id: 'global' },
      update: { intervalMs: limpio },
      create: { id: 'global', intervalMs: limpio },
    });
  }

  async createSlide(data: Partial<HeroSlideData>) {
    // Al final de la fila si no dicen otra cosa.
    const ultimo = await prisma.heroSlide.findFirst({ orderBy: { sortOrder: 'desc' } });

    return prisma.heroSlide.create({
      data: {
        eyebrow: data.eyebrow ?? '',
        title: data.title ?? '',
        subtitle: data.subtitle ?? '',
        image: data.image ?? '',
        imageAlt: data.imageAlt ?? '',
        primaryLabel: data.primaryLabel ?? '',
        primaryHref: data.primaryHref ?? '',
        secondaryLabel: data.secondaryLabel ?? '',
        secondaryHref: data.secondaryHref ?? '',
        showMascot: data.showMascot !== false,
        isActive: data.isActive !== false,
        sortOrder: data.sortOrder ?? (ultimo ? ultimo.sortOrder + 1 : 0),
      },
    });
  }

  async updateSlide(id: string, data: Partial<HeroSlideData>) {
    const existe = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existe) return null;

    const { id: _ignorado, ...campos } = data;
    return prisma.heroSlide.update({ where: { id }, data: campos });
  }

  async deleteSlide(id: string) {
    const existe = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existe) return false;

    await prisma.heroSlide.delete({ where: { id } });
    return true;
  }

  /**
   * Mueve una diapositiva un puesto arriba o abajo.
   *
   * Se intercambian los `sortOrder` de las dos filas involucradas en vez de
   * renumerar toda la lista: así dos ediciones simultáneas no se pisan.
   */
  async moveSlide(id: string, direction: 'up' | 'down') {
    const slides = await this.getSlides(true);
    const index = slides.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const vecino = direction === 'up' ? slides[index - 1] : slides[index + 1];
    if (!vecino) return false;

    const actual = slides[index];

    // Empatadas (todas en 0, por ejemplo) el intercambio no movería nada:
    // primero se renumera según el orden que ya se ve en pantalla.
    if (actual.sortOrder === vecino.sortOrder) {
      await prisma.$transaction(
        slides.map((s, i) => prisma.heroSlide.update({ where: { id: s.id }, data: { sortOrder: i } }))
      );
      const vecinoOrden = direction === 'up' ? index - 1 : index + 1;
      await prisma.$transaction([
        prisma.heroSlide.update({ where: { id: actual.id }, data: { sortOrder: vecinoOrden } }),
        prisma.heroSlide.update({ where: { id: vecino.id }, data: { sortOrder: index } }),
      ]);
      return true;
    }

    await prisma.$transaction([
      prisma.heroSlide.update({ where: { id: actual.id }, data: { sortOrder: vecino.sortOrder } }),
      prisma.heroSlide.update({ where: { id: vecino.id }, data: { sortOrder: actual.sortOrder } }),
    ]);

    return true;
  }
}

export const heroRepository = new HeroRepository();
