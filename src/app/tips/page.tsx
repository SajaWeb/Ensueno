'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Search, Clock, User, X, ArrowRight } from 'lucide-react';
import { Tip } from '@/types';
import { apiService } from '@/services/api';

/** Acepta cualquier forma de link de YouTube y devuelve la URL de incrustado. */
function youtubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'sueno', label: 'Sueño' },
  { id: 'piel', label: 'Piel' },
  { id: 'higiene', label: 'Higiene' },
];

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTip, setActiveTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function loadTips() {
      setLoading(true);
      try {
        const data = await apiService.getTips(selectedCategory, searchQuery);
        setTips(data);
      } catch (e) {
        console.error('Error fetching tips:', e);
      } finally {
        setLoading(false);
      }
    }
    loadTips();
  }, [selectedCategory, searchQuery]);

  // Bloquear el scroll de fondo y cerrar con Escape mientras se lee un tip.
  useEffect(() => {
    if (!activeTip) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTip(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [activeTip]);

  return (
    <div className="page-entry-anim">
      {/* ================= Encabezado ================= */}
      <section className="ens-band ens-band--celeste">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <p className="ens-eyebrow text-azul">Guías pediátricas</p>

          <h1 className="mt-3 font-display text-tinta leading-tight text-[clamp(2rem,5vw,3.5rem)]">
            Tips de sueño y cuidado
          </h1>

          <p className="mt-5 text-lg text-tinta-suave leading-relaxed">
            Rutinas de sueño, baño e hidratación, explicadas por dermatólogos y pediatras.
          </p>

          <div className="mt-8 relative max-w-md mx-auto">
            <label htmlFor="buscar-tips" className="sr-only">
              Buscar tips
            </label>
            <Search
              className="w-5 h-5 text-tinta-suave absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="buscar-tips"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar: masaje, llanto, baño…"
              className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-borde text-tinta placeholder:text-tinta-suave focus:outline-none focus:border-azul focus:ring-2 focus:ring-celeste transition-shadow"
            />
          </div>
        </div>

        <div className="ens-nubes text-white -mb-px" aria-hidden="true">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" focusable="false">
            <path
              fill="currentColor"
              d="M0 60V38c40 0 40-24 80-24s40 24 80 24 40-28 80-28 40 28 80 28 40-22 80-22 40 22 80 22 40-26 80-26 40 26 80 26 40-24 80-24 40 24 80 24 40-28 80-28 40 28 80 28 40-20 80-20 40 20 80 20 40-26 80-26v48Z"
            />
          </svg>
        </div>
      </section>

      {/* ================= Listado ================= */}
      <section className="ens-band ens-band--blanco">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-5 h-11 rounded-full text-sm font-bold transition-colors ens-focus ${
                  selectedCategory === cat.id
                    ? 'bg-azul text-white'
                    : 'bg-white text-tinta border border-borde hover:border-azul'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="py-16 text-center text-tinta-suave animate-pulse">Cargando tips…</p>
          ) : tips.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-tinta">No encontramos nada</p>
              <p className="mt-2 text-tinta-suave">
                Prueba con otra palabra o cambia de categoría.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {tips.map((tip) => (
                <li key={tip.id}>
                  {/*
                    La tarjeta entera es el disparador. Es un <button> real para
                    que funcione con teclado: antes era un <div> con onClick.
                  */}
                  <button
                    type="button"
                    onClick={() => setActiveTip(tip)}
                    className="ens-card group h-full w-full text-left ens-focus"
                  >
                    {/*
                      `contain` y no `cover`: las fotos de los tips vienen en
                      orientaciones mezcladas y las verticales se recortaban por
                      arriba y por abajo. El fondo celeste hace de marco.
                    */}
                    <div className="relative aspect-[4/3] bg-celeste overflow-hidden">
                      <Image
                        src={tip.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-white border border-borde text-tinta text-[11px] font-bold px-3 py-1 rounded-full">
                        {tip.categoryLabel}
                      </span>
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <p className="flex items-center gap-2 text-xs text-tinta-suave">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {tip.readTime}
                        <span aria-hidden="true">·</span>
                        {tip.date}
                      </p>

                      <h2 className="mt-2 font-display text-xl leading-snug text-tinta line-clamp-2 group-hover:text-azul transition-colors">
                        {tip.title}
                      </h2>

                      <p className="mt-2 text-sm text-tinta-suave line-clamp-3">{tip.summary}</p>

                      <span className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-bold text-azul">
                        Leer la guía
                        <ArrowRight
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================= Lector ================= */}
      {activeTip && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-titulo"
          /*
            El scroll vive en ESTE contenedor, no en el panel. Antes el panel
            centrado con `items-center` + `max-h` recortaba el principio del
            artículo cuando era más alto que la ventana: con flex centrado no
            se puede hacer scroll hacia arriba del área desbordada.
          */
          className="fixed inset-0 z-[95] bg-tinta/70 overflow-y-auto animate-fade-in"
          onClick={() => setActiveTip(null)}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
            <article
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-[24px] border border-borde overflow-hidden animate-scale-in"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setActiveTip(null)}
                aria-label="Cerrar artículo"
                className="absolute top-4 right-4 z-10 w-10 h-10 grid place-items-center rounded-full bg-white border border-borde text-tinta-suave hover:text-tinta transition-colors ens-focus"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Si el tip tiene video de YouTube manda el video; si no, la foto. */}
              {youtubeEmbed(activeTip.videoUrl) ? (
                <div className="relative aspect-video bg-tinta">
                  <iframe
                    src={youtubeEmbed(activeTip.videoUrl)!}
                    title={activeTip.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* Mismo criterio que la tarjeta: la foto completa, sin recorte. */
                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-celeste">
                  <Image
                    src={activeTip.image}
                    alt=""
                    fill
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="object-contain"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8">
                <p className="ens-eyebrow text-azul">{activeTip.categoryLabel}</p>

                <h2
                  id="tip-titulo"
                  className="mt-3 font-display text-tinta leading-tight text-[clamp(1.5rem,3vw,2rem)]"
                >
                  {activeTip.title}
                </h2>

                <div className="mt-4 pb-5 border-b border-borde flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tinta-suave">
                  <span className="flex items-center gap-1.5 font-bold text-tinta">
                    <User className="w-4 h-4 text-azul" aria-hidden="true" />
                    {activeTip.author}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTip.authorRole}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTip.readTime}</span>
                </div>

                {/* Texto corrido: antes cada párrafo iba en su propia caja con
                    borde, lo que rompía la lectura. */}
                <div className="mt-6 space-y-4 text-tinta-suave leading-relaxed">
                  {activeTip.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {activeTip.tags?.length > 0 && (
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {activeTip.tags.map((tag) => (
                      <li
                        key={tag}
                        className="bg-cian border border-borde text-tinta-suave text-xs font-bold px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTip(null)}
                  className="ens-btn ens-btn--azul w-full mt-8"
                >
                  Cerrar
                </button>
              </div>
            </article>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
