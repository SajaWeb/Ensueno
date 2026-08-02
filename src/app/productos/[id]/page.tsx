'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag, ShieldCheck, Check, Plus, Minus, ArrowLeft, Droplets,
  Sparkles, UserCircle, Trash2, Edit, Star, Truck, Leaf,
} from 'lucide-react';
import { Product } from '@/types';
import { apiService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { variantPrice, hasVariantPricing } from '@/lib/pricing';
import ProductGallery, { toMedia, Media } from '@/components/features/ProductGallery';
import StarRating from '@/components/ui/StarRating';

interface Review {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { role: string };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

/* Sellos que se muestran si el producto no trae ninguno cargado desde el panel. */
const TRUST_FALLBACK = [
  { Icon: ShieldCheck, label: 'Sin lágrimas' },
  { Icon: Droplets, label: 'pH neutro' },
  { Icon: Sparkles, label: 'Aprobado pediatría' },
];

/**
 * Los sellos se escriben en el panel como texto libre en un solo campo
 * ("Sellos de Seguridad"), separados por viñetas o por puntos.
 */
function parseSeals(raw?: string): string[] {
  if (!raw) return [];
  const clean = (list: string[]) =>
    list.map((s) => s.trim().replace(/\.$/, '').trim()).filter(Boolean);

  const parts = clean(raw.split(/[•·|;]+/));
  // Si no usaron viñetas, el punto también vale como separador. Se exige texto
  // después del punto para no partir por el punto final de la frase.
  if (parts.length === 1 && /\.\s*\S/.test(raw)) {
    return clean(raw.split('.'));
  }
  return parts;
}

/** Ícono acorde a lo que diga el sello, que es texto libre. */
function sealIcon(label: string) {
  const t = label.toLowerCase();
  if (/ph|neutro|hidrat|humect|agua|lágrima|lagrima/.test(t)) return Droplets;
  if (/libre|sin |vegan|natural|origen/.test(t)) return Leaf;
  if (/pediatr|dermatol|aprobad|certific|testead|probad|hipoalerg|seguro/.test(t)) return ShieldCheck;
  return Sparkles;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFragrance, setSelectedFragrance] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ingredientes' | 'seguridad'>('descripcion');

  const { addToCart, freeShippingThreshold } = useCart();
  const { currentUser: user } = useUser();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const REVIEWS_PER_PAGE = 5;

  const loadReviews = async (productId: string) => {
    try {
      setLoadingReviews(true);
      const res = await apiService.reviews.getByProductId(productId);
      setReviews(res);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await apiService.getProductById(id || 'panitos-humedos');
        if (data) {
          setProduct(data);
          setSelectedFragrance(data.fragrances[0] || '');
          setSelectedSize(data.sizes[0] || '');
          loadReviews(data.id);
        }
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    setSubmittingReview(true);
    try {
      const res = editingReviewId
        ? await apiService.reviews.update(editingReviewId, reviewForm)
        : await apiService.reviews.create({
            productId: product.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          });

      // `apiService` no lanza en 4xx/5xx: devuelve { success: false }. Antes se
      // limpiaba el formulario igual y la reseña desaparecía sin explicación.
      if (!res?.success) {
        showToast(res?.error || 'No pudimos guardar tu reseña. Inténtalo de nuevo.', 'error');
        return;
      }

      showToast(editingReviewId ? 'Reseña actualizada' : '¡Gracias por tu reseña!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      setEditingReviewId(null);
      await loadReviews(product.id);
    } catch (err) {
      console.error('Error submitting review', err);
      showToast('No pudimos guardar tu reseña. Inténtalo de nuevo.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditClick = (r: Review) => {
    setEditingReviewId(r.id);
    setReviewForm({ rating: r.rating, comment: r.comment });
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta reseña?')) return;
    try {
      const res = await apiService.reviews.delete(reviewId);
      if (!res?.success) {
        showToast(res?.error || 'No pudimos eliminar la reseña.', 'error');
        return;
      }
      showToast('Reseña eliminada', 'success');
      if (product) await loadReviews(product.id);
    } catch (err) {
      console.error('Error deleting review', err);
      showToast('No pudimos eliminar la reseña.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="ens-band ens-band--cian">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-tinta-suave animate-pulse">
          Cargando producto…
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ens-band ens-band--cian">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="font-display text-3xl text-tinta">Producto no encontrado</h1>
          <p className="text-tinta-suave">Este producto no existe o cambió de dirección.</p>
          <Link href="/" className="ens-btn ens-btn--azul mt-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // El precio sigue a la presentación elegida; las que no tienen precio propio
  // se cobran al precio base del producto.
  const currentPrice = variantPrice(product, selectedSize);
  const priceVaries = hasVariantPricing(product);
  const hasPromo = Boolean(product.originalPrice && product.originalPrice > currentPrice);

  // La imagen principal más las adicionales del admin. Las URLs de video se
  // detectan solas, así que la misma tira sirve para fotos y videos.
  const media: Media[] = [
    { type: 'image' as const, url: product.image },
    ...(product.additionalImages ?? []).filter(Boolean).map(toMedia),
  ];

  // Los combos traen una sola opción de relleno en cada selector: mostrar un
  // chip único sin alternativa es ruido, así que se ocultan.
  const showFragrances = product.fragrances.length > 1;
  const showSizes = product.sizes.length > 1;
  const hasIngredients = product.ingredients.length > 0;

  // Los sellos salen del campo "Sellos de Seguridad" del panel. Antes eran una
  // constante fija y editarlos en el admin no cambiaba nada en esta página.
  const seals = parseSeals(product.safetyInfo);
  const trustSeals =
    seals.length > 0
      ? seals.map((label) => ({ Icon: sealIcon(label), label }))
      : TRUST_FALLBACK;

  // Un combo no es una fila de Product: su id ("combo-*") viola la clave
  // foránea de Review, así que la reseña jamás se guardaría. Mejor no ofrecerla.
  const allowsReviews = !product.id.startsWith('combo-') && product.category !== 'kits';

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : product.rating;
  const reviewCount = reviews.length > 0 ? reviews.length : product.reviewsCount;

  const filtered = starFilter === 'all' ? reviews : reviews.filter((r) => r.rating === starFilter);
  const totalPages = Math.ceil(filtered.length / REVIEWS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);

  const chip = (active: boolean) =>
    `px-4 h-11 rounded-full text-sm font-bold transition-colors ens-focus inline-flex items-center gap-2 ${
      active
        ? 'bg-azul text-white'
        : 'bg-white text-tinta border border-borde hover:border-azul'
    }`;

  return (
    <div className="page-entry-anim">
      {/* ================= Ficha ================= */}
      <section className="ens-band ens-band--cian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm text-tinta-suave mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-azul transition-colors ens-focus">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <span className="capitalize">{product.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-tinta font-bold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* --- Galería: principal arriba, miniaturas debajo --- */}
            <div className="space-y-4">
              <ProductGallery
                media={media}
                alt={product.name}
                badge={product.badge}
              />

              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trustSeals.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="bg-white border border-borde rounded-2xl p-3 text-center"
                  >
                    <Icon className="w-5 h-5 text-azul mx-auto" aria-hidden="true" />
                    <span className="block mt-1.5 text-xs font-bold text-tinta">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- Información y compra --- */}
            <div>
              <p className="ens-eyebrow text-azul capitalize">{product.category}</p>

              <h1 className="mt-3 font-display text-tinta leading-tight text-[clamp(1.875rem,4vw,2.75rem)]">
                {product.name}
              </h1>

              <p className="mt-3 text-lg text-tinta-suave leading-relaxed">{product.subtitle}</p>

              <div className="mt-5">
                {reviewCount > 0 ? (
                  <StarRating rating={avgRating} count={reviewCount} />
                ) : (
                  <p className="text-sm text-tinta-suave">
                    Sin reseñas todavía. Sé la primera en opinar.
                  </p>
                )}
              </div>

              {/* Precio */}
              <div className="mt-6 bg-white border border-borde rounded-2xl p-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-4xl text-azul">{formatPrice(currentPrice)}</span>
                  {hasPromo && (
                    <span className="text-base text-tinta-suave line-through">
                      {formatPrice(product.originalPrice!)}
                    </span>
                  )}
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-tinta-suave">
                  <Truck className="w-4 h-4 text-azul shrink-0" aria-hidden="true" />
                  Envío gratis desde {formatPrice(freeShippingThreshold)}
                </p>
              </div>

              {/* Opciones */}
              {showFragrances && (
                <fieldset className="mt-7">
                  <legend className="ens-eyebrow text-tinta-suave mb-3">Aroma</legend>
                  <div className="flex flex-wrap gap-3">
                    {product.fragrances.map((frag) => (
                      <button
                        key={frag}
                        type="button"
                        onClick={() => setSelectedFragrance(frag)}
                        aria-pressed={selectedFragrance === frag}
                        className={chip(selectedFragrance === frag)}
                      >
                        {selectedFragrance === frag && <Check className="w-4 h-4" aria-hidden="true" />}
                        {frag}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {showSizes && (
                <fieldset className="mt-6">
                  <legend className="ens-eyebrow text-tinta-suave mb-3">Presentación</legend>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        aria-pressed={selectedSize === sz}
                        className={chip(selectedSize === sz)}
                      >
                        {selectedSize === sz && <Check className="w-4 h-4" aria-hidden="true" />}
                        {sz}
                        {/* Si cada presentación cuesta distinto, el precio va en
                            el chip: elegir a ciegas y ver cambiar el total es peor. */}
                        {priceVaries && (
                          <span className="opacity-70 tabular-nums">
                            · {formatPrice(variantPrice(product, sz))}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Cantidad y compra. Queda por debajo de la tira de miniaturas. */}
              <div className="mt-8 pt-8 border-t border-borde">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-1 bg-white border border-borde rounded-full p-1.5 self-start">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Quitar una unidad"
                      className="w-9 h-9 grid place-items-center rounded-full text-tinta hover:bg-cian disabled:opacity-40 disabled:hover:bg-transparent transition-colors ens-focus"
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Añadir una unidad"
                      className="w-9 h-9 grid place-items-center rounded-full text-tinta hover:bg-cian transition-colors ens-focus"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product, selectedFragrance, selectedSize, quantity)}
                    className="ens-btn ens-btn--azul flex-1"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    Agregar al carrito · {formatPrice(currentPrice * quantity)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Detalle ================= */}
      <section className="ens-band ens-band--blanco">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-wrap gap-2 border-b border-borde">
            {([
              ['descripcion', 'Beneficios'],
              ...(hasIngredients ? [['ingredientes', 'Ingredientes'] as const] : []),
              ['seguridad', 'Garantía pediátrica'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                aria-current={activeTab === key}
                className={`px-5 py-3 -mb-px border-b-[3px] font-bold text-sm transition-colors ens-focus ${
                  activeTab === key
                    ? 'border-azul text-azul'
                    : 'border-transparent text-tinta-suave hover:text-tinta'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pt-8 text-tinta-suave leading-relaxed">
            {activeTab === 'descripcion' && (
              <>
                <p className="text-lg text-tinta mb-6">{product.description}</p>
                <ul className="space-y-3">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-azul shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {activeTab === 'ingredientes' && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {product.ingredients.map((ing, i) => (
                  <li key={i} className="bg-cian border border-borde rounded-2xl px-4 py-3 text-tinta">
                    {ing}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'seguridad' && (
              <div className="space-y-4">
                {product.pediatricGuarantee && (
                  <div className="bg-celeste border border-borde rounded-2xl p-5 flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-azul shrink-0" aria-hidden="true" />
                    <div>
                      <span className="ens-eyebrow text-azul block mb-1">Garantía certificada</span>
                      <p className="text-tinta">{product.pediatricGuarantee}</p>
                    </div>
                  </div>
                )}
                {seals.length > 0 && (
                  <div className="bg-cian border border-borde rounded-2xl p-5">
                    <span className="ens-eyebrow text-tinta-suave block mb-3">Sellos y registro</span>
                    <ul className="flex flex-wrap gap-2">
                      {seals.map((seal) => (
                        <li
                          key={seal}
                          className="inline-flex items-center gap-2 bg-white border border-borde rounded-full px-4 py-2 text-sm text-tinta"
                        >
                          <Check className="w-4 h-4 text-azul shrink-0" aria-hidden="true" />
                          {seal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= Reseñas ================= */}
      {allowsReviews && (
      <section className="ens-band ens-band--cian">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-8">
          <div>
            <p className="ens-eyebrow text-azul">Opiniones</p>
            <h2 className="mt-3 font-display text-tinta text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
              Lo que dicen otras familias
            </h2>
          </div>

          {/* Formulario */}
          {user ? (
            <div id="review-form" className="bg-white border border-borde rounded-2xl p-6">
              <h3 className="font-display text-xl text-tinta mb-5">
                {editingReviewId ? 'Modifica tu reseña' : 'Deja tu reseña'}
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <fieldset>
                  <legend className="ens-eyebrow text-tinta-suave mb-2">Calificación</legend>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        aria-label={`${star} de 5 estrellas`}
                        aria-pressed={reviewForm.rating === star}
                        className="p-1 rounded-full transition-transform hover:scale-110 ens-focus"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'fill-amarillo text-tertiary'
                              : 'fill-cian text-borde'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="review-comment" className="ens-eyebrow text-tinta-suave block mb-2">
                    Tu opinión
                  </label>
                  <textarea
                    id="review-comment"
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="¿Cómo le fue a tu bebé con este producto?"
                    className="w-full px-4 py-3 rounded-2xl border border-borde bg-cian text-tinta placeholder:text-tinta-suave focus:outline-none focus:border-azul focus:ring-2 focus:ring-celeste transition-shadow"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setReviewForm({ rating: 5, comment: '' });
                      }}
                      className="ens-btn ens-btn--linea"
                    >
                      Cancelar
                    </button>
                  )}
                  <button type="submit" disabled={submittingReview} className="ens-btn ens-btn--azul">
                    {submittingReview
                      ? 'Publicando…'
                      : editingReviewId
                        ? 'Actualizar reseña'
                        : 'Publicar reseña'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-borde rounded-2xl p-8 text-center">
              <UserCircle className="w-12 h-12 text-borde mx-auto mb-3" aria-hidden="true" />
              <p className="text-tinta-suave mb-5">Inicia sesión para dejar tu reseña.</p>
              <Link href="/perfil" className="ens-btn ens-btn--linea">
                Iniciar sesión
              </Link>
            </div>
          )}

          {/* Filtro por estrellas */}
          {reviews.length > 0 && (
            <div className="bg-white border border-borde rounded-2xl p-5">
              <p className="ens-eyebrow text-tinta-suave mb-3">Filtrar por calificación</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setStarFilter('all'); setCurrentPage(1); }}
                  aria-pressed={starFilter === 'all'}
                  className={chip(starFilter === 'all') + ' !h-10 !text-xs'}
                >
                  Todas ({reviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter((r) => r.rating === stars).length;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => { setStarFilter(stars); setCurrentPage(1); }}
                      aria-pressed={starFilter === stars}
                      className={chip(starFilter === stars) + ' !h-10 !text-xs'}
                    >
                      {stars}
                      <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista */}
          {loadingReviews ? (
            <p className="text-center py-10 text-tinta-suave animate-pulse">Cargando reseñas…</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-borde border-dashed rounded-2xl p-10 text-center">
              <Star className="w-10 h-10 text-borde mx-auto mb-3" aria-hidden="true" />
              <p className="font-bold text-tinta">Todavía no hay reseñas</p>
              <p className="text-sm text-tinta-suave mt-1">Sé la primera en contar tu experiencia.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="bg-white border border-borde rounded-2xl p-8 text-center text-tinta-suave">
              No hay reseñas de {starFilter} estrella{starFilter === 1 ? '' : 's'}.
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {paginated.map((r) => (
                  <li key={r.id} className="bg-white border border-borde rounded-2xl p-5 sm:p-6 relative group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-celeste text-azul font-bold"
                        >
                          {r.userName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-tinta">{r.userName}</p>
                          <p className="text-xs text-tinta-suave">
                            {new Date(r.createdAt).toLocaleDateString('es-CO', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0" role="img" aria-label={`${r.rating} de 5 estrellas`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < r.rating ? 'fill-amarillo text-tertiary' : 'fill-cian text-borde'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-tinta-suave leading-relaxed">{r.comment}</p>

                    {user && (user.id === r.userId || user.role === 'ADMIN') && (
                      <div className="absolute top-4 right-4 flex gap-1 sm:opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                        {user.id === r.userId && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(r)}
                            aria-label="Editar mi reseña"
                            className="w-9 h-9 grid place-items-center rounded-full bg-white border border-borde text-tinta-suave hover:text-azul hover:border-azul transition-colors ens-focus"
                          >
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        {user.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            aria-label="Eliminar reseña"
                            className="w-9 h-9 grid place-items-center rounded-full bg-white border border-borde text-tinta-suave hover:text-secondary hover:border-secondary transition-colors ens-focus"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="ens-btn ens-btn--linea !h-10 !text-xs disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-bold text-tinta-suave" aria-live="polite">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ens-btn ens-btn--linea !h-10 !text-xs disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
