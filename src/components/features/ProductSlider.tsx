'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/features/ProductCard';

/**
 * Carrusel con scroll-snap nativo. Sin dependencias: el desplazamiento lo hace
 * el navegador, así que táctil, rueda y teclado funcionan de entrada.
 * A partir de `lg` el flex se convierte en grid y el snap queda inerte —
 * un solo árbol de DOM, sin marcado duplicado.
 */
export default function ProductSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // El índice activo sale de qué tarjeta se ve MÁS, no de scrollLeft /
  // clientWidth: la tarjeta no mide lo mismo que el contenedor (asoma la
  // siguiente) y esa cuenta se desfasa.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Se guarda la proporción visible de cada tarjeta y se toma el máximo.
    // Quedarse con la última entrada del callback daría el índice equivocado:
    // en cada scroll intersecan varias a la vez.
    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));

        let bestIdx = 0;
        let bestRatio = -1;
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestIdx = i;
          }
        });
        setActive(bestIdx);
      },
      // Varios umbrales: hacen falta lecturas intermedias para comparar.
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [products.length]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const item = itemRefs.current[index];
    if (!track || !item) return;

    // `behavior: 'smooth'` en JS ignora el scroll-behavior de la CSS, así que
    // hay que respetar "reducir movimiento" a mano.
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.scrollTo({
      left: item.offsetLeft - track.offsetLeft,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Home') {
      e.preventDefault();
      scrollToIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToIndex(products.length - 1);
    }
  };

  const atStart = active === 0;
  const atEnd = active === products.length - 1;

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label="Nuestros productos"
      className="relative"
    >
      <ul
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        // tabIndex es necesario: solo Firefox hace focusables los contenedores
        // con overflow por su cuenta.
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 -mx-4 scroll-px-4 pb-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:mx-0 lg:px-0
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azul"
      >
        {products.map((product, i) => (
          <li
            key={product.id}
            ref={(el) => {
              // React 19 trata un valor devuelto como función de limpieza:
              // las llaves son obligatorias aquí.
              itemRefs.current[i] = el;
            }}
            className="snap-start shrink-0 basis-[82%] sm:basis-[46%] lg:basis-auto lg:shrink"
          >
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {/* Controles: solo tienen sentido mientras hay desplazamiento. */}
      <div className="flex items-center justify-center gap-4 mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          disabled={atStart}
          aria-label="Producto anterior"
          className="w-11 h-11 grid place-items-center rounded-full bg-azul text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity ens-focus"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <p aria-live="polite" aria-atomic="true" className="text-sm font-bold text-tinta-suave tabular-nums">
          {active + 1} de {products.length}
        </p>

        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          disabled={atEnd}
          aria-label="Producto siguiente"
          className="w-11 h-11 grid place-items-center rounded-full bg-azul text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity ens-focus"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
