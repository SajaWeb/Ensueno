import { prisma } from '@/lib/prisma';

export class ShippingRepository {
  /**
   * Obtiene o inicializa la configuración global de envíos (Monto envío gratis, tarifa por defecto, descuentos)
   */
  async getShippingConfig() {
    try {
      let config = await prisma.shippingConfig.findUnique({
        where: { id: 'global' },
      });

      if (!config) {
        config = await prisma.shippingConfig.create({
          data: {
            id: 'global',
            freeShippingThreshold: 60000,
            defaultRate: 12000,
            qtyDiscountThreshold: 3,
            qtyDiscountAmount: 3000,
          },
        });
      }

      return config;
    } catch (err) {
      console.warn('Prisma getShippingConfig fallback:', err);
      return {
        id: 'global',
        freeShippingThreshold: 60000,
        defaultRate: 12000,
        qtyDiscountThreshold: 3,
        qtyDiscountAmount: 3000,
      };
    }
  }

  /**
   * Actualiza la configuración global de envíos desde el panel Admin
   */
  async updateShippingConfig(data: {
    freeShippingThreshold?: number;
    defaultRate?: number;
    qtyDiscountThreshold?: number;
    qtyDiscountAmount?: number;
  }) {
    return prisma.shippingConfig.upsert({
      where: { id: 'global' },
      update: data,
      create: {
        id: 'global',
        freeShippingThreshold: data.freeShippingThreshold || 60000,
        defaultRate: data.defaultRate || 12000,
        qtyDiscountThreshold: data.qtyDiscountThreshold || 3,
        qtyDiscountAmount: data.qtyDiscountAmount || 3000,
      },
    });
  }

  /**
   * Obtiene la lista de tarifas por departamento y municipio.
   * Si la tabla está vacía, la puebla automáticamente con datos principales de Colombia.
   */
  async getShippingRates() {
    try {
      let rates = await prisma.shippingRate.findMany({
        orderBy: [{ department: 'asc' }, { city: 'asc' }],
      });

      if (rates.length === 0) {
        const defaultRates = [
          { department: 'Cundinamarca', city: 'Bogotá D.C.', cost: 7000, estimatedDays: '1-2 días hábiles' },
          { department: 'Cundinamarca', city: 'Chía', cost: 7000, estimatedDays: '1-2 días hábiles' },
          { department: 'Cundinamarca', city: 'Soacha', cost: 7000, estimatedDays: '1-2 días hábiles' },
          { department: 'Antioquia', city: 'Medellín', cost: 9000, estimatedDays: '2 días hábiles' },
          { department: 'Antioquia', city: 'Envigado', cost: 9000, estimatedDays: '2 días hábiles' },
          { department: 'Antioquia', city: 'Itagüí', cost: 9000, estimatedDays: '2 días hábiles' },
          { department: 'Valle del Cauca', city: 'Cali', cost: 10000, estimatedDays: '2-3 días hábiles' },
          { department: 'Valle del Cauca', city: 'Palmira', cost: 10000, estimatedDays: '2-3 días hábiles' },
          { department: 'Atlántico', city: 'Barranquilla', cost: 11000, estimatedDays: '2-3 días hábiles' },
          { department: 'Santander', city: 'Bucaramanga', cost: 10500, estimatedDays: '2-3 días hábiles' },
          { department: 'Bolívar', city: 'Cartagena', cost: 11500, estimatedDays: '2-3 días hábiles' },
          { department: 'Risaralda', city: 'Pereira', cost: 9500, estimatedDays: '2 días hábiles' },
          { department: 'Caldas', city: 'Manizales', cost: 9500, estimatedDays: '2 días hábiles' },
          { department: 'Quindío', city: 'Armenia', cost: 9500, estimatedDays: '2 días hábiles' },
        ];

        for (const item of defaultRates) {
          await prisma.shippingRate.create({ data: item });
        }

        rates = await prisma.shippingRate.findMany({
          orderBy: [{ department: 'asc' }, { city: 'asc' }],
        });
      }

      return rates;
    } catch (err) {
      console.error('Prisma getShippingRates error:', err);
      return [];
    }
  }

  /**
   * Agrega o actualiza la tarifa para un departamento / municipio específico
   */
  async upsertShippingRate(data: { department: string; city: string; cost: number; estimatedDays?: string }) {
    const deptClean = data.department.trim();
    const cityClean = data.city.trim();

    const existing = await prisma.shippingRate.findFirst({
      where: {
        department: deptClean,
        city: cityClean,
      },
    });

    if (existing) {
      return prisma.shippingRate.update({
        where: { id: existing.id },
        data: {
          cost: data.cost,
          estimatedDays: data.estimatedDays || '2-3 días hábiles',
        },
      });
    } else {
      return prisma.shippingRate.create({
        data: {
          department: deptClean,
          city: cityClean,
          cost: data.cost,
          estimatedDays: data.estimatedDays || '2-3 días hábiles',
        },
      });
    }
  }

  /**
   * Agrega o actualiza tarifas de forma masiva para todo un departamento
   */
  async upsertDepartmentRates(data: { department: string; cities: string[]; cost: number; estimatedDays?: string }) {
    const results = [];
    for (const city of data.cities) {
      const rate = await this.upsertShippingRate({
        department: data.department,
        city,
        cost: data.cost,
        estimatedDays: data.estimatedDays,
      });
      results.push(rate);
    }
    return results;
  }

  /**
   * Calcula el costo de envío exacto considerando:
   * 1. Umbral de envío gratuito (freeShippingThreshold)
   * 2. Tarifa específica por Departamento/Ciudad
   * 3. Descuento por cantidad de productos comprados
   */
  async calculateShipping(department?: string, city?: string, cartSubtotal = 0, productCount = 1) {
    const config = await this.getShippingConfig();

    if (cartSubtotal >= config.freeShippingThreshold) {
      return {
        shippingCost: 0,
        isFree: true,
        deliveryEstimate: '2-4 días hábiles',
        discountApplied: 0,
      };
    }

    let baseRate = config.defaultRate;
    let deliveryEstimate = '2-4 días hábiles';

    if (department && city) {
      try {
        const deptTrim = department.trim();
        const cityTrim = city.trim();

        const rate = await prisma.shippingRate.findFirst({
          where: {
            department: deptTrim,
            city: cityTrim,
          },
        });

        if (rate) {
          baseRate = rate.cost;
          deliveryEstimate = rate.estimatedDays;
        } else if (department.toLowerCase().includes('cundinamarca') || city.toLowerCase().includes('bogota')) {
          baseRate = 7000;
          deliveryEstimate = '1-2 días hábiles';
        } else if (department.toLowerCase().includes('antioquia') || city.toLowerCase().includes('medellin')) {
          baseRate = 9000;
          deliveryEstimate = '2 días hábiles';
        }
      } catch (err) {
        console.warn('Error calculando tarifa por ciudad:', err);
      }
    }

    let discountApplied = 0;
    if (productCount >= config.qtyDiscountThreshold) {
      discountApplied = config.qtyDiscountAmount;
    }

    const finalShippingCost = Math.max(0, baseRate - discountApplied);

    return {
      shippingCost: finalShippingCost,
      isFree: false,
      deliveryEstimate,
      discountApplied,
      baseRate,
      config,
    };
  }
}

export const shippingRepository = new ShippingRepository();
