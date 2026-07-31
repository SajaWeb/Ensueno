'use client';

import React from 'react';
import { Check, Truck, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);

/**
 * Confirmación de "agregado al carrito". Vive fuera del chrome pegajoso para no
 * quedar atrapada en su contexto de apilamiento z-40.
 *
 * En móvil añade el monto que falta para el envío gratis: allí no existe la
 * barra superior, así que este es el único recordatorio del umbral.
 */
export default function CartToast() {
  const { toastMessage, dismissToast, subtotal, freeShippingThreshold } = useCart();

  if (!toastMessage) return null;

  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 left-4 right-4 bottom-4 sm:left-auto sm:right-4 sm:bottom-auto sm:top-4 sm:w-80 animate-scale-in"
    >
      <div className="bg-white border border-borde rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <span
            aria-hidden="true"
            className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-azul text-white"
          >
            <Check className="w-4 h-4" />
          </span>

          <p className="flex-1 text-sm font-bold text-tinta leading-snug">{toastMessage}</p>

          <button
            type="button"
            onClick={dismissToast}
            aria-label="Cerrar aviso"
            className="shrink-0 w-7 h-7 grid place-items-center rounded-full text-tinta-suave hover:text-tinta hover:bg-cian transition-colors ens-focus"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Recordatorio del umbral: solo móvil, que es donde no hay barra. */}
        <p className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-celeste text-xs font-bold text-tinta border-t border-borde">
          <Truck className="w-4 h-4 text-azul shrink-0" aria-hidden="true" />
          {remaining === 0 ? (
            <span>Tu envío es gratis</span>
          ) : (
            <span>Te faltan {formatPrice(remaining)} para el envío gratis</span>
          )}
        </p>
      </div>
    </div>
  );
}
