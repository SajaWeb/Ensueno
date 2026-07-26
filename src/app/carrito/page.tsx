'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiService } from '@/services/api';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, discount, couponCode, applyCoupon, shipping, total } = useCart();
  const [inputCoupon, setInputCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const freeShippingThreshold = 60000;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      const order = await apiService.createOrder({
        items,
        subtotal,
        discount,
        couponCode,
        shipping,
        total,
        customerName: 'María Alejandra Morales',
        customerEmail: 'maria.alejandra@example.com',
        address: 'Calle 127 # 14-45, Apto 502, Bogotá',
      });

      clearCart();
      router.push(`/confirmacion/${order.id}`);
    } catch (e) {
      console.error('Error during checkout:', e);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary-container/40 flex items-center justify-center text-4xl shadow-soft-glow">
          🛒
        </div>
        <h2 className="font-headline font-extrabold text-3xl text-on-surface">
          Tu carrito de Ensueño está vacío
        </h2>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          Explora nuestros productos de cosmética pediátrica hipoalergénica y brinda el descanso perfecto a tu bebé.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-primary text-white font-headline font-bold text-sm px-8 py-4 rounded-full squishy-button shadow-soft-glow"
        >
          <span>Ver Productos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">
            Mi Carrito de Compras
          </h1>
          <p className="text-xs text-on-surface-variant">
            {items.reduce((a, b) => a + b.quantity, 0)} productos listos para el cuidado de tu bebé
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-outline hover:text-error transition-colors flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-surface-container-high soft-glow-card space-y-2">
        <div className="flex justify-between text-xs font-headline font-bold text-on-surface">
          <span>
            {remainingForFreeShipping > 0
              ? `¡Agrega ${formatPrice(remainingForFreeShipping)} más para ENVÍO GRATIS! 🚚`
              : '¡Felicidades! Tienes ENVÍO GRATIS asegurado 🎉'}
          </span>
          <span>{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 soft-glow-card border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 border">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface line-clamp-1">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-on-surface-variant mt-0.5">
                    <span>Aroma: <strong>{item.selectedFragrance}</strong></span>
                    <span>•</span>
                    <span>Talla: <strong>{item.selectedSize}</strong></span>
                  </div>
                  <span className="font-headline font-extrabold text-sm text-primary mt-1 block sm:hidden">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high">
                <div className="flex items-center space-x-2 bg-surface-container-low rounded-full p-1 border">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-on-surface hover:bg-surface-container"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-headline font-bold text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-on-surface hover:bg-surface-container"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="font-headline font-extrabold text-base text-primary block">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <span className="text-[10px] text-outline">
                    ({formatPrice(item.product.price)} c/u)
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-outline hover:text-error transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Order Summary */}
        <div className="bg-white rounded-2xl p-6 soft-glow-card border border-surface-container-high space-y-6">
          <h2 className="font-headline font-bold text-xl text-on-surface border-b pb-3">
            Resumen del Pedido
          </h2>

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <label className="block text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider">
              ¿Tienes un Cupón?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                placeholder="Ej: SUEÑO10"
                className="w-full px-4 py-2.5 rounded-full text-xs bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary uppercase"
              />
              <button
                onClick={() => applyCoupon(inputCoupon)}
                className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-primary-container hover:text-primary transition-colors squishy-button"
              >
                Aplicar
              </button>
            </div>
            {couponCode && (
              <div className="flex items-center space-x-1.5 text-xs text-secondary font-semibold">
                <Tag className="w-3.5 h-3.5" />
                <span>Cupón {couponCode} aplicado</span>
              </div>
            )}
          </div>

          {/* Price Breakdown List */}
          <div className="space-y-3 text-xs border-t border-b border-surface-container-high py-4">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-semibold text-on-surface">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-secondary font-semibold">
                <span>Descuento Cupón</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-on-surface-variant">
              <span>Costo de Envío</span>
              <span>{shipping === 0 ? <strong className="text-primary uppercase">Gratis</strong> : formatPrice(shipping)}</span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t text-base font-headline font-extrabold text-on-surface">
              <span>Total a Pagar</span>
              <span className="text-2xl text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-3 bg-primary text-white hover:bg-primary-container hover:text-primary font-headline font-bold text-base py-4 rounded-full transition-all squishy-button shadow-soft-glow disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Procesando Pago...' : 'Finalizar Compra'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-outline font-medium text-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Pago 100% seguro con Encriptación SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
