import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const MASCOT_URL =
  'https://i.postimg.cc/25VxdkZn/Whats-App-Image-2026-07-24-at-10-04-09-AM-1-removebg-preview.png';

export const metadata = {
  title: 'Página no encontrada | Ensueño',
};

const ATAJOS = [
  { href: '/#productos', label: 'Ver los productos' },
  { href: '/tips', label: 'Tips de sueño y cuidado' },
  { href: '/carrito', label: 'Mi carrito' },
];

export default function NotFound() {
  return (
    <div className="ens-band ens-band--cian min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto">
          <Image
            src={MASCOT_URL}
            alt=""
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-contain"
          />
        </div>

        <p className="ens-eyebrow text-azul mt-6">Error 404</p>

        <h1 className="mt-3 font-display text-tinta leading-tight text-[clamp(2rem,5vw,3.25rem)]">
          Esta página se fue a dormir
        </h1>

        <p className="mt-4 text-lg text-tinta-suave leading-relaxed">
          El enlace que abriste no existe o cambió de dirección. Te dejamos por dónde seguir.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="ens-btn ens-btn--azul">
            Volver al inicio
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {ATAJOS.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="inline-flex items-center h-11 px-5 rounded-full bg-white border border-borde text-sm font-bold text-tinta hover:border-azul hover:text-azul transition-colors ens-focus"
              >
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
