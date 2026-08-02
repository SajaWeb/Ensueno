import { CartItem, Product } from '@/types';

/**
 * Precio de una presentación concreta.
 *
 * `price` es el precio base del producto y sigue siendo la fuente de verdad:
 * `sizePrices` solo lo sobreescribe para las presentaciones que traen un valor
 * propio. Así un producto sin precios por variante se comporta igual que antes.
 */
export function variantPrice(product: Product, size?: string | null): number {
  const map = product.sizePrices;
  if (map && size) {
    const value = map[size];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return product.price;
}

/**
 * Precio unitario de una línea del carrito.
 *
 * Los carritos guardados en localStorage antes de que existiera `unitPrice` no
 * lo traen; para esos se recalcula desde la presentación, y si tampoco hay,
 * queda el precio base. Sin este puente un carrito viejo costaría NaN.
 */
export function itemUnitPrice(item: CartItem): number {
  if (typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice)) {
    return item.unitPrice;
  }
  return variantPrice(item.product, item.selectedSize);
}

/** Precio más bajo del producto, para el "desde $X" de los listados. */
export function minPrice(product: Product): number {
  const prices = (product.sizes ?? []).map((s) => variantPrice(product, s));
  return prices.length > 0 ? Math.min(...prices, product.price) : product.price;
}

/** true si las presentaciones no cuestan todas lo mismo. */
export function hasVariantPricing(product: Product): boolean {
  const prices = (product.sizes ?? []).map((s) => variantPrice(product, s));
  return prices.length > 1 && new Set(prices).size > 1;
}

/**
 * Normaliza lo que se escribe en el panel ("150ml:28500, 250ml" o un array ya
 * hecho) a la pareja que guarda Prisma. Una presentación sin `:precio` queda
 * fuera del mapa y por lo tanto se cobra al precio base.
 */
export function parseSizePrices(raw: unknown): {
  sizes: string[];
  sizePrices: Record<string, number> | null;
} {
  const entries: string[] = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
      ? raw.split(',')
      : [];

  const sizes: string[] = [];
  const sizePrices: Record<string, number> = {};

  for (const entry of entries) {
    const [namePart, pricePart] = String(entry).split(':');
    const name = (namePart ?? '').trim();
    if (!name) continue;

    sizes.push(name);

    // Se aceptan "39900", "39.900" y "$39.900": los separadores de miles son
    // costumbre en es-CO y escribirlos no debería romper el precio.
    const price = Number(String(pricePart ?? '').replace(/[^\d]/g, ''));
    if (Number.isFinite(price) && price > 0) {
      sizePrices[name] = price;
    }
  }

  return {
    sizes,
    sizePrices: Object.keys(sizePrices).length > 0 ? sizePrices : null,
  };
}

/** Vuelve al formato editable del panel: "150ml:28500, 250ml:39900". */
export function formatSizePrices(
  sizes: string[] | undefined,
  sizePrices: Record<string, number> | null | undefined
): string {
  return (sizes ?? [])
    .map((s) => (sizePrices?.[s] ? `${s}:${sizePrices[s]}` : s))
    .join(', ');
}
