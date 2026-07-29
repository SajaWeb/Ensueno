import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/data/mockData';

export class ProductRepository {
  /**
   * Obtiene la lista de productos (de PostgreSQL o fallback a MOCK_PRODUCTS)
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
      });

      if (products.length > 0) {
        return products;
      }
    } catch (err) {
      console.warn('Prisma getProducts fallback warning:', err);
    }

    // Fallback a MOCK_PRODUCTS si la BD está vacía aún
    let items = MOCK_PRODUCTS;
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
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });
      if (product) return product;
    } catch (err) {
      console.warn('Prisma getProductById fallback warning:', err);
    }

    return MOCK_PRODUCTS.find((p) => p.id === idOrSlug) || null;
  }

  /**
   * Actualiza la URL de imagen o datos de un producto individual (Requerimiento de URLs de imágenes)
   */
  async updateProductImage(id: string, mainImage: string, additionalImages?: string[]) {
    return prisma.product.update({
      where: { id },
      data: {
        image: mainImage,
        ...(additionalImages ? { additionalImages } : {}),
      },
    });
  }

  /**
   * Obtiene promociones activas o todas si includeAll is true
   */
  async getPromotions(targetStage?: string, includeAll: boolean = false) {
    try {
      const where: any = includeAll ? {} : { isActive: true };
      if (targetStage) {
        where.targetBabyStage = targetStage;
      }
      return await prisma.promotion.findMany({
        where,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma getPromotions fallback warning:', err);
      return [];
    }
  }

  /**
   * Crea una nueva promoción o cupón de descuento
   */
  async createPromotion(data: {
    title: string;
    subtitle?: string;
    code?: string;
    discountPercent?: number;
    discountAmount?: number;
    imageUrl?: string;
    targetBabyStage?: string;
    productId?: string;
  }) {
    return prisma.promotion.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
      },
    });
  }

  /**
   * Elimina o desactiva una promoción
   */
  async deletePromotion(id: string) {
    return prisma.promotion.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
