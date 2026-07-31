'use client';

import { useCart } from '@/context/CartContext';
import { Truck, Check } from 'lucide-react';

/**
 * Barra utilitaria sólida, siempre presente en la parte superior del chrome.
 *
 * Altura fija `h-10` y una sola fila que nunca envuelve: las dos ramas (umbral
 * alcanzado / pendiente) tienen que ocupar exactamente la misma caja, porque
 * este elemento es el primero del stack pegajoso y cualquier cambio de alto
 * desplaza la página entera. Tampoco devuelve `null`: el umbral viene del
 * contexto, así que el primer render del servidor y el del cliente coinciden.
 */
export default function ShippingBanner() {
  const { subtotal, freeShippingThreshold } = useCart();

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const achieved = remaining === 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="h-10 bg-azul-hondo text-white">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs font-bold truncate">
          {achieved ? (
            <>
              <Check className="w-4 h-4 shrink-0 text-celeste" aria-hidden="true" />
              <span className="truncate">Tu envío es gratis a toda Colombia</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4 shrink-0 text-celeste" aria-hidden="true" />
              <span className="truncate">
                Te faltan <span className="text-celeste">{formatCurrency(remaining)}</span> para
                el envío gratis
              </span>
            </>
          )}
        </p>

        {/* La barra de progreso solo aparece cuando hay algo que medir. */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 w-40">
          <div
            className="h-1.5 flex-1 rounded-full bg-white/25 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso hacia el envío gratis"
          >
            <div
              className="h-full bg-celeste transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums w-9 text-right">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
