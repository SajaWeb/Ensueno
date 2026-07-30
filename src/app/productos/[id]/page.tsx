'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ShoppingBag, Heart, ShieldCheck, Check, Plus, Minus, ArrowLeft, Droplets, Sparkles, UserCircle, Trash2, Edit } from 'lucide-react';
import { Product } from '@/types';
import { apiService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import ScrollReveal from '@/components/ui/ScrollReveal';

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

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFragrance, setSelectedFragrance] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ingredientes' | 'seguridad'>('descripcion');

  const { addToCart } = useCart();
  const { isSaved, toggleSavedItem, currentUser: user } = useUser();

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
          setSelectedFragrance(data.fragrances[0] || 'Manzanilla & Algodón');
          setSelectedSize(data.sizes[0] || 'Paquete x80 telas');
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
      if (editingReviewId) {
        await apiService.reviews.update(editingReviewId, reviewForm);
      } else {
        await apiService.reviews.create({
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
      }
      setReviewForm({ rating: 5, comment: '' });
      setEditingReviewId(null);
      await loadReviews(product.id);
    } catch (err) {
      console.error('Error submitting review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditClick = (r: Review) => {
    setEditingReviewId(r.id);
    setReviewForm({ rating: r.rating, comment: r.comment });
    const el = document.getElementById('review-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) return;
    try {
      await apiService.reviews.delete(reviewId);
      if (product) await loadReviews(product.id);
    } catch (err) {
      console.error('Error deleting review', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-headline font-medium text-on-surface-variant animate-pulse">
        Cargando producto de Ensueño... ☁️
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-headline font-bold text-2xl text-on-surface">Producto no encontrado</h2>
        <p className="text-on-surface-variant text-sm">El producto que buscas no existe o ha sido movido.</p>
        <Link href="/" className="inline-block bg-primary text-white font-headline font-bold text-xs px-6 py-3 rounded-full">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const saved = isSaved(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 page-entry-anim">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Image Gallery */}
        <ScrollReveal animation="fade-right">
          <div className="space-y-4">
            <div className="relative w-full h-[420px] sm:h-[500px] rounded-3xl overflow-hidden bg-white soft-glow-card border border-surface-container-high">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-secondary text-white font-headline font-bold text-xs px-4 py-1.5 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
              <button
                onClick={() => toggleSavedItem(product.id)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-secondary text-secondary' : 'text-outline'}`} />
              </button>
            </div>

            {/* Guarantee Badges */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
                <span className="font-semibold block text-on-surface">Sin Lágrimas</span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <Droplets className="w-5 h-5 text-secondary mx-auto" />
                <span className="font-semibold block text-on-surface">pH Neutro</span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-surface-container-high space-y-1 soft-glow-card">
                <Sparkles className="w-5 h-5 text-tertiary mx-auto" />
                <span className="font-semibold block text-on-surface">Aprobado Pediatría</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Details & Configuration */}
        <ScrollReveal animation="fade-left" delay={150}>
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-tertiary mb-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const avg = reviews.length > 0
                      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
                      : (product.reviewsCount > 0 ? product.rating : 0);
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(avg)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <span>
                  {reviews.length > 0 ? (
                    <>
                      {(reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'reseña verificada' : 'reseñas verificadas'})
                    </>
                  ) : product.reviewsCount > 0 ? (
                    <>
                      {product.rating.toFixed(1)} ({product.reviewsCount} {product.reviewsCount === 1 ? 'reseña verificada' : 'reseñas verificadas'})
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">Sin reseñas aún • ¡Sé el primero en opinar!</span>
                  )}
                </span>
              </div>

              <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-2">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base text-on-surface-variant font-body leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-surface-container-high soft-glow-card">
              <span className="font-headline font-extrabold text-3xl text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-outline line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-xs font-bold text-secondary bg-secondary-container/60 px-3 py-1 rounded-full ml-auto">
                Envío Gratis desde $60.000
              </span>
            </div>

            {/* Fragrance Selector */}
            {product.fragrances.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Aroma / Fragancia: <span className="text-primary font-bold">{selectedFragrance}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.fragrances.map((frag) => (
                    <button
                      key={frag}
                      onClick={() => setSelectedFragrance(frag)}
                      className={`px-4 py-2.5 rounded-full font-headline font-semibold text-xs transition-all squishy-button flex items-center space-x-2 ${
                        selectedFragrance === frag
                          ? 'bg-primary text-white shadow-soft-glow'
                          : 'bg-white text-on-surface-variant border border-surface-container-high hover:bg-surface-container-low'
                      }`}
                    >
                      {selectedFragrance === frag && <Check className="w-3.5 h-3.5" />}
                      <span>{frag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Presentación: <span className="text-primary font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 rounded-full font-headline font-semibold text-xs transition-all squishy-button ${
                        selectedSize === sz
                          ? 'bg-secondary text-white shadow-soft-pink-glow'
                          : 'bg-white text-on-surface-variant border border-surface-container-high hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart Action */}
            <div className="space-y-4 pt-4 border-t border-surface-container-high">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white border border-surface-container-high rounded-full p-1.5 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-headline font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, selectedFragrance, selectedSize, quantity)}
                  className="btn-ensueno-primary flex-1 h-12 text-xs font-extrabold uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir al Carrito ({formatPrice(product.price * quantity)})</span>
                </button>
              </div>
            </div>

            {/* Specs Tabs */}
            <div className="pt-6 border-t border-surface-container-high space-y-4">
              <div className="flex space-x-4 border-b border-surface-container-high pb-2">
                <button
                  onClick={() => setActiveTab('descripcion')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'descripcion' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Beneficios
                </button>
                <button
                  onClick={() => setActiveTab('ingredientes')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'ingredientes' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  onClick={() => setActiveTab('seguridad')}
                  className={`font-headline font-bold text-xs pb-2 transition-colors ${
                    activeTab === 'seguridad' ? 'text-primary border-b-2 border-primary' : 'text-outline'
                  }`}
                >
                  Garantía Pediátrica
                </button>
              </div>

              <div className="text-xs text-on-surface-variant leading-relaxed min-h-[100px]">
                {activeTab === 'descripcion' && (
                  <ul className="space-y-2">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'ingredientes' && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {product.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                )}

                {activeTab === 'seguridad' && (
                  <div className="space-y-3">
                    {product.pediatricGuarantee && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-purple-900 font-bold flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-[11px] font-black uppercase text-purple-700">Garantía Pediátrica Certificada</span>
                          <span>{product.pediatricGuarantee}</span>
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
                      <span className="block text-[11px] font-black uppercase text-slate-500 mb-1">Sellos & Registro de Seguridad</span>
                      <p>{product.safetyInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* REVIEWS SECTION */}
      <div className="pt-16 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
            Calificaciones y Reseñas
          </h2>
          <p className="text-sm text-on-surface-variant">
            Descubre lo que otras familias opinan sobre {product.name}.
          </p>
        </div>

        {/* Review Form (Only for logged in users) */}
        {user ? (
          <div id="review-form" className="bg-white p-6 rounded-3xl border border-surface-container-high soft-glow-card">
            <h3 className="font-headline font-bold text-lg mb-4 text-primary">
              {editingReviewId ? 'Modificar tu reseña' : 'Dejar una reseña'}
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Calificación
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Tu Opinión
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="¿Qué te pareció este producto? Comparte tu experiencia..."
                  className="w-full px-4 py-3 rounded-2xl border border-surface-container-high bg-surface-container-low text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div className="flex justify-end gap-3">
                {editingReviewId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(null);
                      setReviewForm({ rating: 5, comment: '' });
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-ensueno-primary px-8 py-2.5 text-xs font-extrabold uppercase tracking-wider"
                >
                  {submittingReview ? 'Enviando...' : editingReviewId ? 'Actualizar Reseña' : 'Publicar Reseña'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-surface-container-low p-6 rounded-3xl text-center border border-surface-container-high">
            <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant font-medium">
              Inicia sesión o regístrate para dejar una reseña sobre este producto.
            </p>
            <Link href="/perfil" className="inline-block mt-4 btn-ensueno-secondary px-6 py-2 text-xs font-extrabold uppercase">
              Iniciar Sesión
            </Link>
          </div>
        )}

        {/* Reviews Filters & Breakdown Summary */}
        {reviews.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-surface-container-high soft-glow-card space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Filtrar Reseñas por Calificación</h4>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setStarFilter('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  starFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({reviews.length})
              </button>

              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                return (
                  <button
                    key={stars}
                    onClick={() => { setStarFilter(stars); setCurrentPage(1); }}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      starFilter === stars
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="text-center py-8 text-sm text-on-surface-variant animate-pulse">
              Cargando reseñas...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-surface-container-high border-dashed">
              <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Aún no hay reseñas para este producto.</p>
              <p className="text-xs text-slate-400 mt-1">¡Sé el primero en compartir tu experiencia!</p>
            </div>
          ) : (
            <>
              {(() => {
                const filtered = starFilter === 'all' ? reviews : reviews.filter((r) => r.rating === starFilter);
                const totalPages = Math.ceil(filtered.length / REVIEWS_PER_PAGE) || 1;
                const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
                const paginated = filtered.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
                      No hay reseñas con la calificación de {starFilter} estrella(s).
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {paginated.map((r) => (
                        <div key={r.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-surface-container-high shadow-sm hover:shadow-md transition-shadow relative group">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {r.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-on-surface">{r.userName}</p>
                                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                                  {new Date(r.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {r.comment}
                          </p>
                          
                          {/* Edit/Delete Actions */}
                          {user && (user.id === r.userId || user.role === 'ADMIN') && (
                            <div className="absolute top-4 right-4 sm:opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-slate-100">
                              {user.id === r.userId && (
                                <button
                                  onClick={() => handleEditClick(r)}
                                  className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white rounded-full"
                                  title="Editar mi reseña"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {user.role === 'ADMIN' && (
                                <button
                                  onClick={() => handleDeleteReview(r.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-full"
                                  title="Eliminar reseña (Admin)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
                        >
                          ← Anterior
                        </button>
                        <span className="text-xs font-bold text-slate-600">
                          Página {currentPage} de {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
