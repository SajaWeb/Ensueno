'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import StarRating from '@/components/ui/StarRating';

const CATEGORY_LABEL: Record<Product['category'], string> = {
  sueno: 'Sueño',
  piel: 'Piel',
  higiene: 'Higiene',
  kits: 'Combo',
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductCard({
  product,
  sizes = '(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 33vw',
}: {
  product: Product;
  sizes?: string;
}) {
  const { addToCart } = useCart();
  const { isSaved, toggleSavedItem } = useUser();
  const saved = isSaved(product.id);
  const hasPromo = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="ens-card group h-full">
      {/* Pozo de imagen: el empaque sobre color plano, no recortado. */}
      <div className="ens-card__media">
        <Link href={`/productos/${product.id}`} className="block absolute inset-0 ens-focus">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={sizes}
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {product.badge && (
          <span className="absolute top-3 left-3 bg-secondary text-white text-[11px] font-bold px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleSavedItem(product.id)}
          aria-pressed={saved}
          aria-label={saved ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-white border border-borde hover:border-secondary transition-colors ens-focus"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              saved ? 'fill-secondary text-secondary' : 'text-tinta-suave'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <p className="ens-eyebrow text-tinta-suave">{CATEGORY_LABEL[product.category]}</p>

        <h3 className="mt-1.5 font-display text-xl leading-snug text-tinta">
          <Link href={`/productos/${product.id}`} className="hover:text-azul transition-colors">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm text-tinta-suave line-clamp-2">{product.subtitle}</p>

        <StarRating rating={product.rating} count={product.reviewsCount} className="mt-3" />

        {/* mt-auto empuja el par precio+botón al fondo, para que las tarjetas
            del slider queden alineadas aunque los subtítulos midan distinto. */}
        <div className="mt-auto pt-4 flex items-baseline gap-2">
          <span className="font-display text-2xl text-azul">{formatPrice(product.price)}</span>
          {hasPromo && (
            <span className="text-sm text-tinta-suave line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addToCart(product)}
          className="ens-btn ens-btn--azul w-full mt-4"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
