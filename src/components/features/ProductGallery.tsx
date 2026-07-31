'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export type Media = { type: 'image' | 'video'; url: string; poster?: string };

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;
const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i;

/** Clasifica una URL suelta del admin como imagen o video. */
export function toMedia(url: string): Media {
  const clean = url.trim();
  if (VIDEO_EXT.test(clean) || YOUTUBE.test(clean)) return { type: 'video', url: clean };
  return { type: 'image', url: clean };
}

function youtubeEmbed(url: string): string | null {
  const m = url.match(YOUTUBE);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function ProductGallery({
  media,
  alt,
  badge,
}: {
  media: Media[];
  alt: string;
  badge?: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLDivElement>(null);

  const current = media[index] ?? media[0];
  const isVideo = current?.type === 'video';

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0) return media.length - 1;
        if (next >= media.length) return 0;
        return next;
      });
      setZoom(false);
    },
    [media.length]
  );

  // Teclado: flechas para cambiar de medio, Escape para cerrar la ampliación.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    // Bloquear el scroll de fondo mientras la ampliación está abierta.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, go]);

  // El zoom sigue al cursor moviendo el origen de la transformación: no
  // reflowea nada y respeta `object-contain`.
  const handleMove = (e: React.MouseEvent) => {
    const el = frameRef.current;
    if (!el || !zoom) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* ---------- Medio principal ---------- */}
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setZoom(false)}
        className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-celeste border border-borde"
      >
        {isVideo ? (
          youtubeEmbed(current.url) ? (
            <iframe
              src={youtubeEmbed(current.url)!}
              title={alt}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={current.url}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-tinta"
            />
          )
        ) : (
          <>
            <Image
              src={current.url}
              alt={alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6 transition-transform duration-200"
              style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}
            />

            {/* Toda la superficie amplía. En móvil el hover no existe, así que
                el clic abre la vista ampliada directamente. */}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              onMouseEnter={() => setZoom(true)}
              aria-label={`Ampliar imagen de ${alt}`}
              className="absolute inset-0 cursor-zoom-in ens-focus"
            />

            <span className="absolute bottom-3 right-3 pointer-events-none flex items-center gap-1.5 bg-white border border-borde text-tinta text-[11px] font-bold px-3 py-1.5 rounded-full">
              <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              Ampliar
            </span>
          </>
        )}

        {badge && (
          <span className="absolute top-4 left-4 bg-secondary text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}

      </div>

      {/* ---------- Miniaturas ---------- */}
      {media.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {media.map((m, i) => (
            <li key={`${m.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
                aria-label={`Ver ${m.type === 'video' ? 'video' : 'imagen'} ${i + 1} de ${media.length}`}
                aria-current={i === index}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ens-focus ${
                  i === index ? 'border-azul' : 'border-borde hover:border-celeste'
                }`}
              >
                {m.type === 'video' ? (
                  <span className="absolute inset-0 grid place-items-center bg-tinta">
                    <Play className="w-6 h-6 text-white fill-white" aria-hidden="true" />
                  </span>
                ) : (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1.5 bg-cian"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ---------- Vista ampliada ----------
          Va por portal a <body>: dentro del árbol de la página quedaba atrapada
          bajo el header, porque cualquier ancestro con z-index o transform crea
          un contexto de apilamiento del que un z-index alto no puede escapar. */}
      {lightbox && !isVideo && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${alt}`}
          className="fixed inset-0 z-[100] bg-tinta/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          {/*
            <img> normal en vez de next/image con `fill`: con `fill` el
            contenedor manda y la imagen se salía de la ventana. Aquí las
            propias restricciones de la imagen la limitan al viewport, sin
            depender del alto del padre. No es LCP: solo aparece al ampliar.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[85vh] w-auto h-auto object-contain rounded-2xl"
          />

          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar imagen ampliada"
            className="absolute top-4 right-4 w-11 h-11 grid place-items-center rounded-full bg-white text-tinta hover:bg-celeste transition-colors ens-focus"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {media.filter((m) => m.type === 'image').length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white text-tinta hover:bg-celeste transition-colors ens-focus"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Imagen siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white text-tinta hover:bg-celeste transition-colors ens-focus"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
