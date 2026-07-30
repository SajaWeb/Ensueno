'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isSaved, toggleSavedItem } = useUser();
  const saved = isSaved(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-2xl p-4 soft-glow-card flex flex-col justify-between relative overflow-hidden transition-all">
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleSavedItem(product.id);
        }}
        className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
        aria-label="Guardar en favoritos"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            saved ? 'fill-secondary text-secondary' : 'text-outline hover:text-secondary'
          }`}
        />
      </button>

      <div>
        {/* Product Image Container */}
        <Link href={`/productos/${product.id}`} className="block relative w-full h-56 rounded-xl overflow-hidden mb-4 bg-surface-container-low">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.badge && (
            <div className="absolute top-3 left-3 bg-secondary text-white text-[11px] font-headline font-bold px-3 py-1 rounded-full shadow-sm">
              {product.badge}
            </div>
          )}
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-1.5">
          <div className="flex text-tertiary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating) ? 'fill-tertiary text-tertiary' : 'text-surface-container-high'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-on-surface ml-1">{product.rating}</span>
          <span className="text-xs text-outline">({product.reviewsCount})</span>
        </div>

        {/* Product Info */}
        <Link href={`/productos/${product.id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 mb-3">
            {product.subtitle}
          </p>
        </Link>
      </div>

      {/* Price & Action */}
      <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
        <div>
          <span className="font-headline font-extrabold text-xl text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-outline line-through block -mt-1">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product)}
          className="flex items-center space-x-2 bg-primary text-white hover:bg-primary-container hover:text-primary font-headline font-bold text-xs px-4 py-2.5 rounded-full transition-all squishy-button shadow-soft-glow"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>
    </div>
  );
}
