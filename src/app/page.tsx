'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownCircle, ChevronDown, ShieldCheck, Sparkles, Heart, Gift, ArrowRight, Star, ShoppingBag, Check } from 'lucide-react';
import { Product, Tip } from '@/types';
import { apiService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const { addToCart } = useCart();

  const mascotUrl = 'https://i.postimg.cc/25VxdkZn/Whats-App-Image-2026-07-24-at-10-04-09-AM-1-removebg-preview.png';

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsData, tipsData] = await Promise.all([
          apiService.getProducts(),
          apiService.getTips(),
        ]);
        setProducts(prodsData);
        setTips(tipsData);
      } catch (e) {
        console.error('Error loading funnel data:', e);
      }
    }
    loadData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper handlers for special promos
  const handleAddPromo1 = () => {
    const panitos = products.find((p) => p.id === 'panitos-humedos');
    if (panitos) {
      addToCart(panitos, 'Manzanilla & Algodón', 'Paquete x80 telas', 3);
    }
  };

  const handleAddPromo2 = () => {
    const colonia = products.find((p) => p.id === 'colonia-ensueno');
    const panitos = products.find((p) => p.id === 'panitos-humedos');
    if (colonia) addToCart(colonia, 'Flores Silvestres & Lavanda', '250ml', 2);
    if (panitos) addToCart(panitos, 'Sin Fragancia', 'Paquete x80 telas', 1);
  };

  const handleAddPromo3 = () => {
    products.forEach((p) => {
      addToCart(p, p.fragrances[0], p.sizes[0], 1);
    });
  };

  return (
    <div className="space-y-20 pb-16 page-entry-anim">
      {/* 1. Funnel Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden">
        {/* Soft Tender Glow Orbs */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 sm:w-96 sm:h-96 bg-primary-container/30 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-1/4 -right-10 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-secondary-container/30 rounded-full blur-3xl -z-10 animate-pulse-subtle" />

        {/* Official Floating Mascot Image */}
        <div className="absolute top-16 right-4 sm:right-[10%] w-32 h-32 sm:w-48 sm:h-48 animate-float z-20 pointer-events-none">
          <Image
            src={mascotUrl}
            alt="Mascota Ensueño"
            fill
            priority
            className="object-contain drop-shadow-xl"
          />
        </div>

        <ScrollReveal animation="fade-up" duration={800}>
          <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
            <span className="inline-block px-5 py-2 bg-secondary-container/70 text-secondary font-headline font-extrabold text-xs tracking-wider uppercase rounded-full shadow-sm animate-pulse-subtle">
              ✨ MOMENTOS MÁGICOS
            </span>

            <h1 className="font-headline font-extrabold text-4xl sm:text-6xl lg:text-7xl text-on-surface leading-[1.15] tracking-tight">
              El cuidado más tierno <br className="hidden sm:block" /> para tu bebé ☁️
            </h1>

            <p className="font-body text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Fórmulas delicadas y aromas dulces que transforman cada día en un ritual de amor, suave descanso y protección.
            </p>

            <div className="pt-6">
              <a
                href="#productos"
                className="btn-ensueno-primary h-13 px-8 text-sm sm:text-base font-extrabold uppercase tracking-wider group"
              >
                <span>Descubre la ternura</span>
                <ArrowDownCircle className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 animate-bounce-slow text-primary/70">
          <span className="text-[11px] font-headline font-bold uppercase tracking-wider">Sigue explorando</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* 2. Selection of 3 Essential Products Section */}
      <section
        id="productos"
        className="relative z-20 bg-white/70 backdrop-blur-md rounded-t-[40px] sm:rounded-t-[64px] border-t border-surface-container-high/60 pt-20 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <ScrollReveal animation="fade-up">
            <div className="text-center space-y-3">
              <span className="bg-primary-container/80 text-primary font-headline font-extrabold text-xs px-4 py-1.5 rounded-full">
                CATÁLOGO ENSUEÑO
              </span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface">
                Tus tres esenciales
              </h2>
              <p className="text-on-surface-variant text-base sm:text-lg max-w-xl mx-auto">
                Lo que mamá y bebé necesitan para el cuidado diario.
              </p>
            </div>
          </ScrollReveal>

          {/* Grid of the 3 Products with Staggered ScrollReveal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {products.map((product, index) => (
              <ScrollReveal
                key={product.id}
                animation="pop-in"
                delay={index * 150}
                duration={700}
              >
                <div className="group bg-white rounded-[36px] overflow-hidden soft-glow-card border border-surface-container-high/80 flex flex-col justify-between hover:-translate-y-3 transition-all duration-500 h-full">
                  <div>
                    {/* Image Banner */}
                    <Link
                      href={`/productos/${product.id}`}
                      className="block relative aspect-[4/3] overflow-hidden bg-surface-container-low"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-sm animate-float">
                        <Image
                          src={mascotUrl}
                          alt="Mascota"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className="p-6 sm:p-8 text-center space-y-3">
                      <div className="flex justify-center text-tertiary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-tertiary" />
                        ))}
                      </div>

                      <Link href={`/productos/${product.id}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mt-1">
                          {product.subtitle}
                        </p>
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 sm:p-8 pt-0 space-y-2.5">
                    <Link
                      href={`/productos/${product.id}`}
                      className="btn-ensueno-secondary w-full h-11 text-xs font-extrabold uppercase tracking-wider"
                    >
                      Ver Detalles
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-ensueno-primary w-full h-11 text-xs font-extrabold uppercase tracking-wider"
                    >
                      + Agregar al Carrito
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Promociones Especiales & Combos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-3">
            <span className="bg-secondary-container text-secondary font-headline font-extrabold text-xs px-4 py-1.5 rounded-full inline-block animate-pulse-subtle">
              🎁 OFERTAS EXCLUSIVAS
            </span>
            <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface">
              Promociones y Combos de Sueño
            </h2>
            <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl mx-auto">
              Aprovecha nuestros paquetes especiales diseñados para que nunca te falte la ternura en casa.
            </p>
          </div>
        </ScrollReveal>

        {/* Promos Grid with Staggered Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Promo Card 1 */}
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="bg-white rounded-[36px] p-6 sm:p-8 soft-glow-card border-2 border-secondary-container/80 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-2 transition-all h-full">
              <div className="absolute -top-1 -right-1 bg-secondary text-white font-headline font-extrabold text-[11px] px-4 py-1.5 rounded-bl-2xl shadow-sm">
                OFERTA ESTRELLA ⭐
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/60 flex items-center justify-center text-secondary font-bold text-2xl">
                  3x2
                </div>

                <div>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                    Paga 2 y Lleva 3
                  </span>
                  <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                    Trío de Pañitos Húmedos
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Lleva 3 paquetes de Pañitos Húmedos Ensueño (x80 telas cada uno) y paga solo 2. ¡Un paquete va de regalo!
                  </p>
                </div>

                <div className="bg-surface-container-low p-3.5 rounded-2xl border space-y-1 text-xs">
                  <div className="flex items-center space-x-2 text-secondary font-bold">
                    <Check className="w-4 h-4" />
                    <span>Ahorras $18.900 COP</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-headline font-extrabold text-xl text-primary">$37.800</span>
                    <span className="text-outline line-through">$56.700</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleAddPromo1}
                  className="btn-ensueno-primary w-full h-12 text-xs font-extrabold uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Aprovechar Oferta 3x2</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Promo Card 2 */}
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="bg-white rounded-[36px] p-6 sm:p-8 soft-glow-card border-2 border-primary-container/80 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-2 transition-all h-full">
              <div className="absolute -top-1 -right-1 bg-primary text-white font-headline font-extrabold text-[11px] px-4 py-1.5 rounded-bl-2xl shadow-sm">
                REGALO GRATIS 🎁
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/60 flex items-center justify-center text-primary font-bold text-2xl">
                  2+1
                </div>

                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                    Combo Dueto Fragancia
                  </span>
                  <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                    2 Colonias + Pañitos GRATIS
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Compra 2 Colonias Ensueño de 250ml y te regalamos 1 paquete de Pañitos Húmedos Ensueño de extracto de algodón.
                  </p>
                </div>

                <div className="bg-surface-container-low p-3.5 rounded-2xl border space-y-1 text-xs">
                  <div className="flex items-center space-x-2 text-primary font-bold">
                    <Check className="w-4 h-4" />
                    <span>Pañitos Húmedos valorados en $18.900 GRATIS</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-headline font-extrabold text-xl text-primary">$57.000</span>
                    <span className="text-outline line-through">$75.900</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleAddPromo2}
                  className="btn-ensueno-sky w-full h-12 text-xs font-extrabold uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Llevar Combo + Pañitos Gratis</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Promo Card 3 */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="bg-white rounded-[36px] p-6 sm:p-8 soft-glow-card border-2 border-tertiary-container/80 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-2 transition-all h-full">
              <div className="absolute -top-1 -right-1 bg-tertiary text-white font-headline font-extrabold text-[11px] px-4 py-1.5 rounded-bl-2xl shadow-sm">
                25% DESCUENTO ✨
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-container/60 flex items-center justify-center text-tertiary font-bold text-2xl">
                  ☁️
                </div>

                <div>
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1">
                    Kit Cuidado Completo
                  </span>
                  <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                    Trío Esencial Ensueño
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Lleva los 3 productos indispensables (Pañitos + Colonia + Crema Corporal) en un empaque especial de regalo.
                  </p>
                </div>

                <div className="bg-surface-container-low p-3.5 rounded-2xl border space-y-1 text-xs">
                  <div className="flex items-center space-x-2 text-tertiary font-bold">
                    <Check className="w-4 h-4" />
                    <span>Ahorro del 25% vs compra individual</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-headline font-extrabold text-xl text-primary">$59.500</span>
                    <span className="text-outline line-through">$79.400</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleAddPromo3}
                  className="btn-ensueno-amber w-full h-12 text-xs font-extrabold uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar Kit Trío Completo</span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Trust Signals & Safety Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="scale-up">
          <div className="bg-gradient-to-r from-white via-primary-container/20 to-secondary-container/20 rounded-[40px] p-8 sm:p-14 border border-surface-container-high/80 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center soft-glow-card">
            <div className="space-y-6">
              <span className="bg-secondary-container text-secondary font-headline font-bold text-xs px-4 py-1.5 rounded-full">
                GARANTÍA DE TERNURA
              </span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface leading-tight">
                Compromiso con la seguridad 🛡️
              </h2>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                Cada producto Ensueño es formulado bajo rigurosos estándares dermatológicos pediátricos para asegurar que la piel de tu bebé esté siempre protegida, fresca y llena de suavidad.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-white/80 p-6 rounded-3xl border border-surface-container-high text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
                  <h4 className="font-headline font-bold text-base text-primary">Testeado Clínicamente</h4>
                  <p className="text-xs text-on-surface-variant">Aprobado por la Asociación Colombiana de Pediatría.</p>
                </div>

                <div className="bg-white/80 p-6 rounded-3xl border border-surface-container-high text-center space-y-2">
                  <Sparkles className="w-10 h-10 text-secondary mx-auto" />
                  <h4 className="font-headline font-bold text-base text-secondary">Ingredientes Naturales</h4>
                  <p className="text-xs text-on-surface-variant">Sin alcohol, sulfatos, ni colorantes agresivos.</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md h-80 sm:h-96 rounded-[40px] overflow-hidden soft-glow-card border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
                  alt="Cuidado amoroso para tu bebé"
                  fill
                  className="object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 sm:w-40 sm:h-40 animate-float z-20 pointer-events-none">
                  <Image
                    src={mascotUrl}
                    alt="Mascota Ensueño"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. Tips & Guides Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ScrollReveal animation="fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-extrabold text-2xl sm:text-4xl text-on-surface">
                Tips de Sueño & Cuidado
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Guías escritas por expertos en pediatría
              </p>
            </div>
            <Link
              href="/tips"
              className="text-primary font-headline font-bold text-sm hover:underline flex items-center space-x-1"
            >
              <span>Ver todos los tips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips.slice(0, 3).map((tip, idx) => (
            <ScrollReveal key={tip.id} animation="pop-in" delay={idx * 150}>
              <Link
                href="/tips"
                className="group bg-white/80 rounded-3xl p-6 soft-glow-card border border-surface-container-high space-y-3 flex flex-col justify-between hover:-translate-y-1 transition-all h-full"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    {tip.categoryLabel}
                  </span>
                  <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-3">
                    {tip.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-xs text-outline font-medium">
                  <span>{tip.author}</span>
                  <span>{tip.readTime}</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
