'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlideData } from '@/infrastructure/repositories/HeroRepository';

const MASCOT_URL =
  'https://i.postimg.cc/25VxdkZn/Whats-App-Image-2026-07-24-at-10-04-09-AM-1-removebg-preview.png';

/** Los enlaces internos van por <Link>; anclas y externos, por <a>. */
function CtaLink({ href, label, variant }: { href: string; label: string; variant: 'azul' | 'blanco' }) {
  const className = `ens-btn ens-btn--${variant}`;
  if (!href || href.startsWith('#') || href.startsWith('http')) {
    return (
      <a href={href || '#'} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

/**
 * Hero de la portada en carrusel.
 *
 * Con una sola diapositiva se comporta igual que el hero fijo de antes: no
 * pinta controles ni monta temporizadores. Con varias hace fundido cruzado y
 * avanza solo cada `intervalMs`.
 *
 * Todas las diapositivas se quedan montadas y se cruzan con opacidad — así el
 * navegador no vuelve a decodificar el PNG en cada vuelta y la banda no da el
 * salto de altura que se vería al desmontarlas.
 */
export default function HeroSlider({
  slides,
  intervalMs = 6000,
}: {
  slides: HeroSlideData[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [pausado, setPausado] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const autoplay = total > 1 && intervalMs > 0;

  const irA = useCallback((i: number) => setActive(((i % total) + total) % total), [total]);
  const siguiente = useCallback(() => irA(active + 1), [active, irA]);
  const anterior = useCallback(() => irA(active - 1), [active, irA]);

  // Quien prefiere menos movimiento no debería tener el hero cambiando solo.
  const [menosMovimiento, setMenosMovimiento] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMenosMovimiento(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // En una pestaña de fondo el temporizador solo gastaría vueltas.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const corriendo = autoplay && !pausado && !menosMovimiento && visible;

  useEffect(() => {
    if (!corriendo) return;
    const t = setTimeout(siguiente, intervalMs);
    return () => clearTimeout(t);
  }, [corriendo, intervalMs, siguiente, active]);

  // Flechas del teclado cuando el carrusel tiene el foco.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (total < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      siguiente();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      anterior();
    }
  };

  if (total === 0) return null;

  return (
    <div
      ref={regionRef}
      className="relative"
      role={total > 1 ? 'region' : undefined}
      aria-roledescription={total > 1 ? 'carrusel' : undefined}
      aria-label={total > 1 ? 'Destacados de Ensueño' : undefined}
      tabIndex={total > 1 ? 0 : undefined}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="grid lg:grid-cols-[0.95fr_1.15fr] gap-8 lg:gap-6 items-end">
          {/* Cada columna es a su vez una rejilla de una celda: las
              diapositivas comparten la celda 1/1, así se apilan y la columna
              toma la altura de la más alta. Con posicionamiento absoluto la
              banda colapsaría; con `contents` se rompería el diseño de móvil,
              donde la rejilla exterior tiene una sola columna. */}

          {/* ---- Columna de texto ---- */}
          <div className="grid pb-8 sm:pb-16 lg:pb-24">
            {slides.map((slide, i) => {
              const esActiva = i === active;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!esActiva}
                  className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
                    esActiva ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                  }`}
                >
                  {slide.eyebrow && <p className="ens-eyebrow text-azul">{slide.eyebrow}</p>}

                  <h1 className="mt-4 font-display text-tinta leading-[1.05] text-[clamp(2.5rem,5.5vw,4.25rem)]">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-6 max-w-lg text-lg text-tinta-suave leading-relaxed">{slide.subtitle}</p>
                  )}

                  {(slide.primaryLabel || slide.secondaryLabel) && (
                    <div className="mt-9 flex flex-wrap gap-3">
                      {slide.primaryLabel && (
                        <CtaLink href={slide.primaryHref} label={slide.primaryLabel} variant="azul" />
                      )}
                      {slide.secondaryLabel && (
                        <CtaLink href={slide.secondaryHref} label={slide.secondaryLabel} variant="blanco" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ---- Columna de imagen ---- */}
          <div className="grid w-full">
            {slides.map((slide, i) => {
              const esActiva = i === active;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!esActiva}
                  className={`col-start-1 row-start-1 relative w-full transition-opacity duration-700 ease-out ${
                    esActiva ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* El PNG es apaisado y trae aire transparente a los lados,
                      por eso la caja se ensancha más allá de la columna: el
                      sobrante cae en zona transparente y la sección recorta.
                      La máscara funde el borde inferior contra la banda. */}
                  <div
                    className="relative z-10 aspect-[2528/1696] w-[114%] sm:w-[116%] lg:w-[124%]
                               [mask-image:linear-gradient(to_bottom,#000_78%,transparent_98%)]
                               [-webkit-mask-image:linear-gradient(to_bottom,#000_78%,transparent_98%)]"
                  >
                    {slide.image && (
                      <Image
                        src={slide.image}
                        alt={slide.imageAlt || ''}
                        fill
                        // Solo la primera es LCP; precargar las demás competiría
                        // con ella por el ancho de banda.
                        priority={i === 0}
                        loading={i === 0 ? undefined : 'lazy'}
                        sizes="(max-width: 1024px) 122vw, 70vw"
                        className="object-contain object-bottom"
                      />
                    )}
                  </div>

                  {slide.showMascot && (
                    <div
                      aria-hidden="true"
                      className="absolute top-0 right-2 sm:right-4 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 z-20"
                    >
                      <Image
                        src={MASCOT_URL}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 160px"
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Controles ---- */}
        {total > 1 && (
          <div className="relative z-30 -mt-2 sm:-mt-6 lg:-mt-16 pb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={anterior}
                aria-label="Diapositiva anterior"
                className="w-10 h-10 grid place-items-center rounded-full bg-white/90 border border-borde text-azul hover:bg-white hover:text-azul-hondo transition-colors shadow-sm ens-focus"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label="Diapositiva siguiente"
                className="w-10 h-10 grid place-items-center rounded-full bg-white/90 border border-borde text-azul hover:bg-white hover:text-azul-hondo transition-colors shadow-sm ens-focus"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Barritas en vez de puntos: la activa se rellena sola y deja ver
                cuánto falta para el siguiente cambio. */}
            <ol className="flex items-center gap-2">
              {slides.map((slide, i) => (
                <li key={slide.id}>
                  <button
                    type="button"
                    onClick={() => irA(i)}
                    aria-label={`Ir a: ${slide.title}`}
                    aria-current={i === active ? 'true' : undefined}
                    className={`group relative block h-2 rounded-full overflow-hidden transition-all duration-300 ens-focus ${
                      i === active ? 'w-10 bg-white/80' : 'w-2.5 bg-white/60 hover:bg-white/90'
                    }`}
                  >
                    {i === active && (
                      <span
                        key={`${active}-${corriendo}`}
                        className={`absolute inset-y-0 left-0 bg-azul rounded-full ${
                          corriendo ? 'animate-[ens-hero-progreso_linear_forwards]' : 'w-full'
                        }`}
                        style={corriendo ? { animationDuration: `${intervalMs}ms` } : undefined}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Lectores de pantalla: se anuncia el cambio sin depender del fundido. */}
      {total > 1 && (
        <p className="sr-only" aria-live="polite">
          Diapositiva {active + 1} de {total}: {slides[active]?.title}
        </p>
      )}
    </div>
  );
}
