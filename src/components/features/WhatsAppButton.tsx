'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Botón flotante de WhatsApp para resolver dudas antes de comprar.
 *
 * El número vive en NEXT_PUBLIC_WHATSAPP_NUMBER, así no queda escrito en el
 * repositorio ni en su historial, y cada entorno puede apuntar al suyo.
 *
 * Ojo: `NEXT_PUBLIC_*` se incrusta en el bundle del navegador en tiempo de
 * compilación. No es un secreto y no puede serlo — el enlace `wa.me` tiene que
 * llevar el número visible para que el botón funcione.
 */
const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const NUMBER = RAW_NUMBER.replace(/\D/g, '');

// Mensaje precargado: le dice a quien atiende de dónde viene la persona, para
// que no tenga que preguntarlo.
const MESSAGE =
  'Hola, vengo de la página web de Ensueño y necesito más información sobre los productos.';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Sin número configurado no se monta: mejor eso que un enlace que lleve a una
  // conversación vacía. Fuera del panel, además: ahí no hay clientas.
  if (!NUMBER || pathname?.startsWith('/admin')) return null;

  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      /*
        `bottom-24` en móvil deja libre la franja inferior, donde el aviso de
        "agregado al carrito" ocupa todo el ancho.
      */
      className="group fixed right-4 bottom-24 sm:right-5 sm:bottom-5 z-[60] flex items-center gap-3 ens-focus"
    >
      <span className="hidden sm:block bg-white border border-borde text-tinta text-sm font-bold px-4 py-2 rounded-full opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none">
        ¿Tienes dudas? Escríbenos
      </span>

      <span className="w-14 h-14 grid place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        {/* Glifo oficial de WhatsApp: lucide no trae marcas de terceros. */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </span>
    </a>
  );
}
