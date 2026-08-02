import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/data/mockData';
import { Product, Promotion } from '@/types';
import { parseSizePrices } from '@/lib/pricing';

// Global in-memory cache for dynamic updates when db is not seeded
let memoryProducts: Product[] = [...MOCK_PRODUCTS];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Trío de Pañitos Húmedos',
    subtitle: 'Lleva 3 paquetes de Pañitos Húmedos Ensueño (x80 telas cada uno) y paga solo 2. ¡Un paquete va de regalo!',
    tagline: 'Paga 2 y Lleva 3',
    badge: 'OFERTA ESTRELLA ⭐',
    badgeColor: 'secondary',
    price: 37800,
    originalPrice: 56700,
    savingText: 'Ahorras $18.900 COP',
    imageUrl: 'https://i.postimg.cc/dV03DDbN/Whats-App-Image-2026-07-24-at-10-08-29-AM-(3).jpg',
    videoUrl: '',
    isActive: true,
    productId: 'panitos-humedos',
    sortOrder: 1,
  },
  {
    id: 'promo-2',
    title: '2 Colonias + Pañitos GRATIS',
    subtitle: 'Compra 2 Colonias Ensueño de 250ml y te regalamos 1 paquete de Pañitos Húmedos Ensueño de extracto de algodón.',
    tagline: 'Combo Dueto Fragancia',
    badge: 'REGALO GRATIS 🎁',
    badgeColor: 'primary',
    price: 57000,
    originalPrice: 75900,
    savingText: 'Pañitos Húmedos valorados en $18.900 GRATIS',
    imageUrl: 'https://i.postimg.cc/wjBM33Ch/Whats-App-Image-2026-07-24-at-10-05-27-AM.jpg',
    videoUrl: '',
    isActive: true,
    productId: 'colonia-ensueno',
    sortOrder: 2,
  },
  {
    id: 'promo-3',
    title: 'Trío Esencial Ensueño',
    subtitle: 'Lleva los 3 productos indispensables (Pañitos + Colonia + Mantequilla Corporal) en un empaque especial de regalo.',
    tagline: 'Kit Cuidado Completo',
    badge: '25% DESCUENTO ✨',
    badgeColor: 'amber',
    price: 59500,
    originalPrice: 79400,
    savingText: 'Ahorro del 25% vs compra individual',
    imageUrl: 'https://i.postimg.cc/QdMCVV2n/Whats-App-Image-2026-07-24-at-10-11-38-AM.jpg',
    videoUrl: '',
    isActive: true,
    productId: 'mantequilla-corporal-ensueno',
    sortOrder: 3,
  },
];

let memoryPromotions: Promotion[] = [...INITIAL_PROMOTIONS];

export class ProductRepository {
  /**
   * Obtiene la lista de productos (de PostgreSQL o fallback a memoryProducts)
   */
  async getProducts(category?: string, query?: string) {
    try {
      const where: any = {};
      if (category && category !== 'todos') {
        where.category = category;
      }
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        include: {
          reviews: {
            select: { rating: true },
          },
        },
      });

      if (products.length > 0) {
        return products.map((p) => {
          const reviewsCount = p.reviews.length;
          const avgRating =
            reviewsCount > 0
              ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
              : 5.0;
          const { reviews, ...rest } = p;
          return {
            ...rest,
            rating: avgRating,
            reviewsCount,
          };
        });
      }
    } catch (err) {
      console.warn('Prisma getProducts fallback warning:', err);
    }

    // Fallback a memoryProducts
    let items = memoryProducts;
    if (category && category !== 'todos') {
      items = items.filter((p) => p.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return items;
  }

  /**
   * Obtiene un producto por ID o Slug
   */
  async getProductById(idOrSlug: string) {
    // Handle Combos/Promotions seamlessly
    if (idOrSlug.startsWith('combo-') || idOrSlug.startsWith('promo-')) {
      const realPromoId = idOrSlug.replace('combo-', '');
      let promo = null;
      try {
        promo = await prisma.promotion.findUnique({ where: { id: realPromoId } }) || await prisma.promotion.findUnique({ where: { id: idOrSlug } });
      } catch(e) {}
      
      if (!promo) {
        promo = memoryPromotions.find(p => p.id === realPromoId || p.id === idOrSlug) || null;
      }

      if (promo) {
        let promoReviews: { rating: number }[] = [];
        try {
          promoReviews = await prisma.review.findMany({
            where: { productId: `combo-${promo.id}` },
            select: { rating: true },
          });
        } catch (e) {}

        const reviewsCount = promoReviews.length;
        const avgRating =
          reviewsCount > 0
            ? Number((promoReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
            : 5.0;

        return {
          id: `combo-${promo.id}`,
          slug: `combo-${promo.id}`,
          name: promo.title,
          subtitle: promo.tagline || promo.subtitle || 'Combo Especial de Promoción',
          category: 'kits',
          price: promo.price || 0,
          originalPrice: promo.originalPrice || null,
          rating: avgRating,
          reviewsCount,
          image: promo.imageUrl || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
          badge: promo.badge || 'COMBO',
          fragrances: ['Combo Especial'],
          sizes: ['Pack Completo'],
          description: promo.subtitle || promo.description || '',
          benefits: promo.savingText ? [promo.savingText] : ['Ahorro Especial'],
          ingredients: [],
          safetyInfo: 'Dermatológicamente testeado • Hipoalergénico',
          inStock: true,
        };
      }
    }

    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          reviews: { select: { rating: true } },
        },
      });
      if (product) {
        const reviewsCount = product.reviews.length;
        const avgRating =
          reviewsCount > 0
            ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
            : 5.0;
        const { reviews, ...rest } = product;
        return { ...rest, rating: avgRating, reviewsCount };
      }
    } catch (err) {
      console.warn('Prisma getProductById fallback warning:', err);
    }

    return memoryProducts.find((p) => p.id === idOrSlug || (p as any).slug === idOrSlug) || null;
  }

  /**
   * Crea un nuevo producto completo
   */
  async createProduct(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productData = {
      name: data.name,
      subtitle: data.subtitle || '',
      category: data.category || 'sueno',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      image: data.image,
      additionalImages: data.additionalImages || [],
      badge: data.badge || null,
      fragrances: Array.isArray(data.fragrances) ? data.fragrances : typeof data.fragrances === 'string' ? data.fragrances.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      // Las presentaciones pueden venir como "150ml:28500, 250ml:39900": el
      // precio por variante viaja en el mismo campo y se separa aquí.
      ...(() => {
        const { sizes, sizePrices } = parseSizePrices(data.sizes);
        return { sizes, sizePrices: data.sizePrices ?? sizePrices };
      })(),
      description: data.description || '',
      benefits: Array.isArray(data.benefits) ? data.benefits : typeof data.benefits === 'string' ? data.benefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : typeof data.ingredients === 'string' ? data.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      safetyInfo: data.safetyInfo || 'Dermatológicamente testeado',
      pediatricGuarantee: data.pediatricGuarantee || 'Vegano, libre de crueldad animal, sin parabenos, sin colorantes, sin sulfatos',
      inStock: data.inStock !== false,
      isFeatured: data.isFeatured !== false,
      slug,
    };

    try {
      const newProd = await prisma.product.create({
        data: productData,
      });
      return newProd;
    } catch (err) {
      console.warn('Prisma createProduct fallback warning:', err);
      const newMockItem: any = {
        id: data.id || `prod-${Date.now()}`,
        ...productData,
        rating: 5.0,
        reviewsCount: 1,
      };
      memoryProducts.unshift(newMockItem);
      return newMockItem;
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.additionalImages !== undefined) updateData.additionalImages = data.additionalImages;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.safetyInfo !== undefined) updateData.safetyInfo = data.safetyInfo;
    if (data.pediatricGuarantee !== undefined) updateData.pediatricGuarantee = data.pediatricGuarantee;
    if (data.inStock !== undefined) updateData.inStock = Boolean(data.inStock);
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);

    if (data.fragrances !== undefined) {
      updateData.fragrances = Array.isArray(data.fragrances) ? data.fragrances : typeof data.fragrances === 'string' ? data.fragrances.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    }
    if (data.sizes !== undefined) {
      const { sizes, sizePrices } = parseSizePrices(data.sizes);
      updateData.sizes = sizes;
      // `sizePrices` explícito gana; si no, se deriva de lo escrito en sizes.
      // Se asigna siempre para que borrar un precio en el panel lo borre de verdad.
      updateData.sizePrices = data.sizePrices !== undefined ? data.sizePrices : sizePrices;
    } else if (data.sizePrices !== undefined) {
      updateData.sizePrices = data.sizePrices;
    }
    if (data.benefits !== undefined) {
      updateData.benefits = Array.isArray(data.benefits) ? data.benefits : typeof data.benefits === 'string' ? data.benefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    }
    if (data.ingredients !== undefined) {
      updateData.ingredients = Array.isArray(data.ingredients) ? data.ingredients : typeof data.ingredients === 'string' ? data.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    }

    try {
      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      return updated;
    } catch (err) {
      console.warn('Prisma updateProduct fallback warning:', err);
      const index = memoryProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        memoryProducts[index] = { ...memoryProducts[index], ...updateData };
        return memoryProducts[index];
      }
      throw new Error('Producto no encontrado');
    }
  }

  /**
   * Actualiza únicamente la imagen
   */
  async updateProductImage(id: string, mainImage: string, additionalImages?: string[]) {
    return this.updateProduct(id, { image: mainImage, ...(additionalImages ? { additionalImages } : {}) });
  }

  /**
   * Elimina un producto por ID
   */
  async deleteProduct(id: string) {
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (err) {
      console.warn('Prisma deleteProduct fallback warning:', err);
      memoryProducts = memoryProducts.filter((p) => p.id !== id);
      return true;
    }
  }

  /**
   * Obtiene promociones activas
   */
  async getPromotions(targetStage?: string, includeAll: boolean = false) {
    try {
      const where: any = includeAll ? {} : { isActive: true };
      if (targetStage) {
        where.targetBabyStage = targetStage;
      }
      const promos = await prisma.promotion.findMany({
        where,
        include: { product: true },
        orderBy: { sortOrder: 'asc' },
      });

      if (promos.length > 0) return promos;
    } catch (err) {
      console.warn('Prisma getPromotions fallback warning:', err);
    }

    let items = memoryPromotions;
    if (!includeAll) {
      items = items.filter((p) => p.isActive);
    }
    return items;
  }

  /**
   * Crea una nueva promoción / combo
   */
  async createPromotion(data: any) {
    const promoData = {
      title: data.title,
      subtitle: data.subtitle || null,
      code: data.code || null,
      badge: data.badge || 'OFERTA ESPECIAL ✨',
      badgeColor: data.badgeColor || 'secondary',
      tagline: data.tagline || '',
      description: data.description || '',
      savingText: data.savingText || '',
      price: data.price ? Number(data.price) : null,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
      videoUrl: data.videoUrl || null,
      targetBabyStage: data.targetBabyStage || null,
      productId: data.productId || null,
      isActive: data.isActive !== false,
      sortOrder: data.sortOrder ? Number(data.sortOrder) : 0,
    };

    try {
      return await prisma.promotion.create({
        data: promoData,
      });
    } catch (err) {
      console.warn('Prisma createPromotion fallback warning:', err);
      const newPromo: Promotion = {
        id: data.id || `promo-${Date.now()}`,
        ...promoData,
      };
      memoryPromotions.unshift(newPromo);
      return newPromo;
    }
  }

  /**
   * Actualiza una promoción / combo existente
   */
  async updatePromotion(id: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.badgeColor !== undefined) updateData.badgeColor = data.badgeColor;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.savingText !== undefined) updateData.savingText = data.savingText;
    if (data.price !== undefined) updateData.price = data.price ? Number(data.price) : null;
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.targetBabyStage !== undefined) updateData.targetBabyStage = data.targetBabyStage;
    if (data.productId !== undefined) updateData.productId = data.productId;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

    try {
      return await prisma.promotion.update({
        where: { id },
        data: updateData,
      });
    } catch (err) {
      console.warn('Prisma updatePromotion fallback warning:', err);
      const idx = memoryPromotions.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memoryPromotions[idx] = { ...memoryPromotions[idx], ...updateData };
        return memoryPromotions[idx];
      }
      throw new Error('Promoción no encontrada');
    }
  }

  /**
   * Elimina una promoción por ID
   */
  async deletePromotion(id: string) {
    try {
      await prisma.promotion.delete({
        where: { id },
      });
      return true;
    } catch (err) {
      console.warn('Prisma deletePromotion fallback warning:', err);
      memoryPromotions = memoryPromotions.filter((p) => p.id !== id);
      return true;
    }
  }
}

export const productRepository = new ProductRepository();
