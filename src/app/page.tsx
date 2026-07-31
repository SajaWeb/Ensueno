import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { Product, Promotion, Tip } from '@/types';
import { productRepository } from '@/infrastructure/repositories/ProductRepository';
import { MOCK_TIPS } from '@/data/mockData';
import ProductSlider from '@/components/features/ProductSlider';
import NubeDivider from '@/components/ui/NubeDivider';

const MASCOT_URL =
  'https://i.postimg.cc/25VxdkZn/Whats-App-Image-2026-07-24-at-10-04-09-AM-1-removebg-preview.png';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

/**
 * El repositorio devuelve filas de Prisma donde `category` es `string`, no el
 * union de `Product`. Al pasar la home a Server Component eso deja de estar
 * oculto tras el tipado de `apiService`, así que se estrecha aquí.
 */
const CATEGORIES = ['sueno', 'piel', 'higiene', 'kits'] as const;

function toProduct(row: unknown): Product {
  const p = row as Product;
  const category = (CATEGORIES as readonly string[]).includes(p.category)
    ? p.category
    : 'higiene';
  return { ...p, category };
}

export default async function HomePage() {
  // Server Component: los productos van en el HTML de SSR. Antes se traían en
  // un useEffect, así que el HTML llegaba sin un solo producto.
  const [allProducts, promotions] = await Promise.all([
    productRepository.getProducts(),
    productRepository.getPromotions(undefined, true),
  ]);

  const catalog = allProducts.map(toProduct);
  const featured = catalog.filter((p) => p.isFeatured !== false);
  const products = featured.length > 0 ? featured : catalog;
  const activePromos = (promotions as Promotion[]).filter((p) => p.isActive !== false);
  const tips: Tip[] = MOCK_TIPS.slice(0, 3);

  return (
    <div className="page-entry-anim">
      {/* ================= Hero ================= */}
      <section className="ens-band ens-band--celeste overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-6 items-end">
            <div className="pb-8 sm:pb-16 lg:pb-24">
              <p className="ens-eyebrow text-azul">Cuidado pediátrico · Colombia</p>

              <h1 className="mt-4 font-display text-tinta leading-[1.05] text-[clamp(2.5rem,5.5vw,4.25rem)]">
                El cuidado más tierno para tu bebé
              </h1>

              <p className="mt-6 max-w-lg text-lg text-tinta-suave leading-relaxed">
                Tres esenciales sin alcohol, sin parabenos y probados
                dermatológicamente: pañitos, colonia y crema corporal.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#productos" className="ens-btn ens-btn--azul">
                  Ver productos
                </a>
                <Link href="/tips" className="ens-btn ens-btn--blanco">
                  Leer los tips
                </Link>
              </div>
            </div>

            {/* Foto real a sangre contra la banda, con la estrellita detrás
                para que ambas se lean sin competir. */}
            <div className="relative justify-self-center lg:justify-self-end w-full max-w-md lg:max-w-none">
              {/* A la derecha: por la izquierda chocaba con el borde recto
                  de la foto. */}
              <div
                aria-hidden="true"
                className="absolute -top-2 right-0 sm:-right-2 w-24 h-24 sm:w-36 sm:h-36 z-20"
              >
                <Image
                  src={MASCOT_URL}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 96px, 144px"
                  className="object-contain"
                />
              </div>

              <div className="relative z-10 aspect-[842/1130] w-full max-w-[24rem] sm:max-w-[30rem] mx-auto lg:mx-0 lg:ml-auto">
                <Image
                  src="/hero-familia.png"
                  alt="Mamá y bebé con la Colonia Ensueño"
                  fill
                  priority
                  sizes="(max-width: 640px) 22rem, 26rem"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Firma: la nube toma el color de la banda de abajo. */}
        <NubeDivider className="text-white -mb-px relative z-20" />
      </section>

      {/* ================= Productos ================= */}
      <section id="productos" className="ens-band ens-band--blanco scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="ens-eyebrow text-azul">Catálogo</p>
            <h2 className="mt-3 font-display text-tinta text-[clamp(1.875rem,4vw,3rem)] leading-tight">
              Tus tres esenciales
            </h2>
            <p className="mt-4 text-lg text-tinta-suave">
              Lo que mamá y bebé usan todos los días.
            </p>
          </div>

          <div className="mt-10">
            <ProductSlider products={products} />
          </div>
        </div>

        <NubeDivider className="text-cian -mb-px" />
      </section>

      {/* ================= Promociones ================= */}
      {activePromos.length > 0 && (
        <section className="ens-band ens-band--cian">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="ens-eyebrow text-secondary">Ofertas</p>
              <h2 className="mt-3 font-display text-tinta text-[clamp(1.875rem,4vw,3rem)] leading-tight">
                Combos que rinden más
              </h2>
              <p className="mt-4 text-lg text-tinta-suave">
                Paquetes armados para que no se te acabe lo esencial.
              </p>
            </div>

            <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {activePromos.map((promo) => (
                <li key={promo.id}>
                  <article className="ens-card group h-full">
                    {promo.imageUrl && (
                      <div className="ens-card__media">
                        <Image
                          src={promo.imageUrl}
                          alt={promo.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {promo.badge && (
                          <span className="absolute top-3 left-3 bg-secondary text-white text-[11px] font-bold px-3 py-1 rounded-full">
                            {promo.badge}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col flex-1 p-5">
                      {promo.tagline && (
                        <p className="ens-eyebrow text-tinta-suave">{promo.tagline}</p>
                      )}

                      <h3 className="mt-1.5 font-display text-xl leading-snug text-tinta">
                        {promo.title}
                      </h3>

                      {promo.subtitle && (
                        <p className="mt-1.5 text-sm text-tinta-suave line-clamp-3">
                          {promo.subtitle}
                        </p>
                      )}

                      {promo.savingText && (
                        <p className="mt-4 flex items-start gap-2 text-sm font-bold text-secondary">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{promo.savingText}</span>
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex items-baseline gap-2">
                        {promo.price != null && (
                          <span className="font-display text-2xl text-azul">
                            {formatPrice(promo.price)}
                          </span>
                        )}
                        {promo.originalPrice != null && (
                          <span className="text-sm text-tinta-suave line-through">
                            {formatPrice(promo.originalPrice)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/productos/combo-${promo.id}`}
                        className="ens-btn ens-btn--azul w-full mt-4"
                      >
                        Ver la oferta
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ================= Confianza ================= */}
      <section className="ens-band ens-band--lavanda">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="ens-eyebrow text-azul">Seguridad</p>
              <h2 className="mt-3 font-display text-tinta text-[clamp(1.875rem,4vw,3rem)] leading-tight">
                Formulado para piel que apenas empieza
              </h2>
              <p className="mt-4 text-lg text-tinta-suave leading-relaxed">
                Cada producto Ensueño se formula bajo estándares dermatológicos
                pediátricos, para que la piel de tu bebé quede protegida y suave.
              </p>

              <ul className="mt-8 grid sm:grid-cols-2 gap-4">
                <li className="bg-white border border-borde rounded-2xl p-5">
                  <ShieldCheck className="w-8 h-8 text-azul" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg text-tinta">
                    Probado clínicamente
                  </h3>
                  <p className="mt-1 text-sm text-tinta-suave">
                    Avalado por la Asociación Colombiana de Pediatría.
                  </p>
                </li>
                <li className="bg-white border border-borde rounded-2xl p-5">
                  <Sparkles className="w-8 h-8 text-secondary" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg text-tinta">
                    Ingredientes naturales
                  </h3>
                  <p className="mt-1 text-sm text-tinta-suave">
                    Sin alcohol, sulfatos ni colorantes agresivos.
                  </p>
                </li>
              </ul>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-borde">
              <Image
                src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
                alt="Madre cargando a su bebé"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Tips ================= */}
      <section className="ens-band ens-band--blanco">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ens-eyebrow text-azul">Guías</p>
              <h2 className="mt-3 font-display text-tinta text-[clamp(1.875rem,4vw,3rem)] leading-tight">
                Tips de sueño y cuidado
              </h2>
            </div>
            <Link
              href="/tips"
              className="inline-flex items-center gap-1.5 font-bold text-azul hover:text-tinta transition-colors ens-focus"
            >
              Ver todos los tips
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {tips.map((tip) => (
              <li key={tip.id}>
                <Link href="/tips" className="ens-card h-full p-5 ens-focus">
                  <p className="ens-eyebrow text-secondary">{tip.categoryLabel}</p>
                  <h3 className="mt-2 font-display text-lg leading-snug text-tinta line-clamp-2">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-sm text-tinta-suave line-clamp-3">{tip.summary}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-tinta-suave border-t border-borde">
                    <span className="pt-4">{tip.author}</span>
                    <span className="pt-4">{tip.readTime}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
