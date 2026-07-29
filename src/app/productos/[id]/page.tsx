'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ShoppingBag, Heart, ShieldCheck, Check, Plus, Minus, ArrowLeft, Droplets, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { apiService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFragrance, setSelectedFragrance] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ingredientes' | 'seguridad'>('descripcion');

  const { addToCart } = useCart();
  const { isSaved, toggleSavedItem } = useUser();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await apiService.getProductById(id || 'panitos-humedos');
        if (data) {
          setProduct(data);
          setSelectedFragrance(data.fragrances[0] || 'Manzanilla & Algodón');
          setSelectedSize(data.sizes[0] || 'Paquete x80 telas');
        }
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-headline font-medium text-on-surface-variant animate-pulse">
        Cargando producto de Ensueño... ☁️
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-headline font-bold text-2xl text-on-surface">Producto no encontrado</h2>
        <p className="text-on-surface-variant text-sm">El producto que buscas no existe o ha sido movido.</p>
        <Link href="/" className="inline-block bg-primary text-white font-headline font-bold text-xs px-6 py-3 rounded-full">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const saved = isSaved(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 page-entry-anim">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Image Gallery */}
        <ScrollReveal animation="fade-right">
          <div className="space-y-4">
            <div className="relative w-full h-[420px] sm:h-[500px] rounded-3xl overflow-hidden bg-white soft-glow-card border border-surface-container-high">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-secondary text-white font-headline font-bold text-xs px-4 py-1.5 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
              <button
                onClick={() => toggleSavedItem(product.id)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-secondary text-secondary' : 'text-outline'}`} />
              </button>
            </div>

            {/* Guarantee Badges */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
                <span className="font-semibold block text-on-surface">Sin Lágrimas</span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <Droplets className="w-5 h-5 text-secondary mx-auto" />
                <span className="font-semibold block text-on-surface">pH Neutro</span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <Sparkles className="w-5 h-5 text-tertiary mx-auto" />
                <span className="font-semibold block text-on-surface">Aprobado Pediatría</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Details & Configuration */}
        <ScrollReveal animation="fade-left" delay={150}>
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-tertiary mb-2">
                <div className="flex text-tertiary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-tertiary" />
                  ))}
                </div>
                <span>{product.rating} ({product.reviewsCount} reseñas verificadas)</span>
              </div>

              <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-2">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base text-on-surface-variant font-body leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-surface-container-high soft-glow-card">
              <span className="font-headline font-extrabold text-3xl text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-outline line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-xs font-bold text-secondary bg-secondary-container/60 px-3 py-1 rounded-full ml-auto">
                Envío Gratis desde $60.000
              </span>
            </div>

            {/* Fragrance Selector */}
            {product.fragrances.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Aroma / Fragancia: <span className="text-primary font-bold">{selectedFragrance}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.fragrances.map((frag) => (
                    <button
                      key={frag}
                      onClick={() => setSelectedFragrance(frag)}
                      className={`px-4 py-2.5 rounded-full font-headline font-semibold text-xs transition-all squishy-button flex items-center space-x-2 ${
                        selectedFragrance === frag
                          ? 'bg-primary text-white shadow-soft-glow'
                          : 'bg-white text-on-surface-variant border border-surface-container-high hover:bg-surface-container-low'
                      }`}
                    >
                      {selectedFragrance === frag && <Check className="w-3.5 h-3.5" />}
                      <span>{frag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Presentación: <span className="text-primary font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 rounded-full font-headline font-semibold text-xs transition-all squishy-button ${
                        selectedSize === sz
                          ? 'bg-secondary text-white shadow-soft-pink-glow'
                          : 'bg-white text-on-surface-variant border border-surface-container-high hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart Action */}
            <div className="space-y-4 pt-4 border-t border-surface-container-high">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white border border-surface-container-high rounded-full p-1.5 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-headline font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, selectedFragrance, selectedSize, quantity)}
                  className="btn-ensueno-primary flex-1 h-12 text-xs font-extrabold uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir al Carrito ({formatPrice(product.price * quantity)})</span>
                </button>
              </div>
            </div>

            {/* Specs Tabs */}
            <div className="pt-6 border-t border-surface-container-high space-y-4">
              <div className="flex space-x-4 border-b border-surface-container-high pb-2">
                <button
                  onClick={() => setActiveTab('descripcion')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'descripcion' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Beneficios
                </button>
                <button
                  onClick={() => setActiveTab('ingredientes')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'ingredientes' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  onClick={() => setActiveTab('seguridad')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'seguridad' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Garantía Pediátrica
                </button>
              </div>

              <div className="text-xs text-on-surface-variant leading-relaxed min-h-[100px]">
                {activeTab === 'descripcion' && (
                  <ul className="space-y-2">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'ingredientes' && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {product.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                )}

                {activeTab === 'seguridad' && (
                  <p className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high text-on-surface">
                    {product.safetyInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
