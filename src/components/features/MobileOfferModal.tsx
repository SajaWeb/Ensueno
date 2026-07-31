'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const SESSION_KEY = 'ensueno_oferta_vista';
const MASCOT_URL =
  'https://i.postimg.cc/25VxdkZn/Whats-App-Image-2026-07-24-at-10-04-09-AM-1-removebg-preview.png';

/**
 * Solo móvil. Sustituye a la barra de envío gratis, que en pantallas pequeñas
 * robaba altura del chrome pegajoso en todas las páginas.
 *
 * Aparece una vez por sesión: repetirlo en cada navegación sería una molestia,
 * no un recordatorio.
 */
export default function MobileOfferModal() {
  const { freeShippingThreshold, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // `matchMedia` en vez de una clase CSS: así el modal ni siquiera se monta
    // en escritorio y no hay foco atrapado en un diálogo invisible.
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setOpen(false);
  };

  if (!open || typeof document === 'undefined') return null;

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(v);

  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="oferta-titulo"
      className="sm:hidden fixed inset-0 z-[90] bg-tinta/70 flex items-end justify-center p-4 animate-fade-in"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-[24px] border border-borde overflow-hidden animate-scale-in"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white border border-borde text-tinta-suave hover:text-tinta transition-colors ens-focus"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="bg-celeste px-6 pt-7 pb-6 text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <Image src={MASCOT_URL} alt="" fill sizes="80px" className="object-contain" />
          </div>

          <p className="ens-eyebrow text-azul">Envío gratis</p>

          <h2 id="oferta-titulo" className="mt-2 font-display text-2xl leading-tight text-tinta">
            {remaining === 0
              ? 'Tu envío ya es gratis'
              : `Llega a ${formatPrice(freeShippingThreshold)} y no pagas envío`}
          </h2>
        </div>

        <div className="px-6 py-5">
          <p className="flex items-start gap-2.5 text-sm text-tinta-suave">
            <Truck className="w-5 h-5 text-azul shrink-0 mt-0.5" aria-hidden="true" />
            {remaining === 0 ? (
              <span>Ya superaste el monto. Tu pedido viaja sin costo a toda Colombia.</span>
            ) : (
              <span>
                Te faltan <strong className="text-tinta">{formatPrice(remaining)}</strong> para
                que enviemos tu pedido gratis a toda Colombia.
              </span>
            )}
          </p>

          <button type="button" onClick={dismiss} className="ens-btn ens-btn--azul w-full mt-5">
            Ver productos
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
