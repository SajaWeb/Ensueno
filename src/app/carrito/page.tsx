'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  Truck,
  User,
  Lock,
  Mail,
  Sparkles,
  Baby,
  Star,
  CheckCircle2,
  X,
  Building2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';
import { COLOMBIA_LOCATION_DATA } from '@/data/colombiaData';

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currentUser, openAuthModal } = useUser();
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, discount, couponCode, applyCoupon } = useCart();
  const [inputCoupon, setInputCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Shipping & Location state from Colombia dataset
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState(COLOMBIA_LOCATION_DATA[0].cities[0]);
  const [address, setAddress] = useState('');
  const [addressTitle, setAddressTitle] = useState('Hogar');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryEstimate, setDeliveryEstimate] = useState('2-4 días hábiles');
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  const currentDepartment = COLOMBIA_LOCATION_DATA[selectedDeptIndex].name;
  const productCount = items.reduce((a, b) => a + b.quantity, 0);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setCustomerEmail(currentUser.email);
      if (currentUser.profile?.fullName) setCustomerName(currentUser.profile.fullName);
      if (currentUser.profile?.phone) setCustomerPhone(currentUser.profile.phone);

      if (Array.isArray(currentUser.savedAddresses) && currentUser.savedAddresses.length > 0) {
        setSavedAddresses(currentUser.savedAddresses);
        const defaultAddr = currentUser.savedAddresses.find((a: any) => a.isDefault) || currentUser.savedAddresses[0];
        applySavedAddress(defaultAddr);
      }
    }
  }, [currentUser]);

  const applySavedAddress = (addr: any) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setAddressTitle(addr.title || 'Hogar');
    setAddress(addr.address);

    const deptIdx = COLOMBIA_LOCATION_DATA.findIndex(
      (d) => d.name.toLowerCase() === (addr.department || '').toLowerCase()
    );
    if (deptIdx !== -1) {
      setSelectedDeptIndex(deptIdx);
      const matchedCity = COLOMBIA_LOCATION_DATA[deptIdx].cities.find(
        (c) => c.toLowerCase() === (addr.city || '').toLowerCase()
      );
      if (matchedCity) {
        setSelectedCity(matchedCity);
      }
    }
  };

  const handleSaveNewAddress = async () => {
    if (!currentUser) return;
    try {
      const res = await apiService.addSavedAddress({
        title: addressTitle || 'Hogar',
        department: currentDepartment,
        city: selectedCity,
        address,
        isDefault: savedAddresses.length === 0,
      });
      if (res.success) {
        showToast('Dirección de envío guardada en tu cuenta 🏠', 'success');
        const updatedAddrs = await apiService.getSavedAddresses();
        if (updatedAddrs.success) setSavedAddresses(updatedAddrs.data || []);
      }
    } catch (err) {
      console.warn('Error guardando dirección:', err);
    }
  };

  const handleDeleteSavedAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiService.deleteSavedAddress(id);
      if (res.success) {
        showToast('Dirección eliminada', 'info');
        setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
        if (selectedAddressId === id) setSelectedAddressId(null);
      }
    } catch (err) {
      showToast('Error al eliminar dirección', 'error');
    }
  };

  const calculateShippingRate = async () => {
    try {
      const res = await fetch('/api/v1/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: currentDepartment,
          city: selectedCity,
          subtotal,
          productCount,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setShippingCost(json.data.shippingCost);
        setDeliveryEstimate(json.data.deliveryEstimate || '2-4 días hábiles');
        setIsFreeShipping(json.data.isFree);
        setShippingDiscount(json.data.discountApplied || 0);
      }
    } catch (err) {
      console.warn('Error calculando envío:', err);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount + shippingCost);
  const loyaltyPointsEarned = Math.floor(finalTotal / 1000);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyCoupon = (code: string) => {
    if (!code) return;
    applyCoupon(code);
    showToast(`Cupón ${code} procesado`, 'info');
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    if (!currentUser) {
      // Exigir inicio de sesión / registro flotante universal
      openAuthModal('login');
      return;
    }
    processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);
    showToast('Generando orden de pago segura con MercadoPago...', 'info');

    try {
      // Only save address if user typed a new one (not selecting an existing saved address)
      if (currentUser && !selectedAddressId) {
        await handleSaveNewAddress();
      }

      // Map cart items to the flat shape expected by OrderRepository
      const mappedItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        selectedFragrance: item.selectedFragrance,
        selectedSize: item.selectedSize,
        unitPrice: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { order, mercadopago } = await apiService.createOrder({
        userId: currentUser?.id,
        items: mappedItems,
        subtotal,
        discount,
        couponCode,
        shippingCost,
        total: finalTotal,
        customerName: customerName || currentUser?.profile?.fullName || 'Cliente Ensueño',
        customerEmail: customerEmail || currentUser?.email || 'cliente@ensueno.com.co',
        customerPhone: customerPhone || currentUser?.profile?.phone,
        shippingAddress: `${address}, ${selectedCity}, ${currentDepartment}`,
        city: selectedCity,
        department: currentDepartment,
        deliveryEstimate,
      });

      clearCart();
      showToast('¡Pedido registrado! Redirigiendo a MercadoPago...', 'success');

      if (mercadopago && mercadopago.checkoutUrl) {
        window.location.href = mercadopago.checkoutUrl;
      } else {
        router.push(`/confirmacion/${order.orderNumber || order.id}`);
      }
    } catch (e: any) {
      console.error('Error during checkout:', e);
      showToast(e.message || 'Error al generar la orden de compra', 'error');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-pink-100 via-purple-100 to-sky-100 flex items-center justify-center text-4xl shadow-sm border border-pink-200/60 text-purple-600">
          🛒
        </div>
        <h2 className="font-extrabold text-3xl text-slate-800">Tu carrito de Ensueño está vacío</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Explora nuestros productos de cosmética pediátrica hipoalergénica y brinda el descanso perfecto a tu bebé.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:via-purple-500 hover:to-sky-500 text-white font-extrabold text-sm px-8 py-4 rounded-full shadow-md shadow-pink-200 transition-all border border-white/40 transform hover:scale-105"
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
      <div className="flex items-center justify-between border-b border-pink-100 pb-4">
        <div>
          <h1 className="font-extrabold text-3xl text-slate-800">Mi Carrito de Compras</h1>
          <p className="text-xs text-slate-500">{productCount} productos listos para el cuidado de tu bebé</p>
        </div>
        <button
          onClick={() => {
            clearCart();
            showToast('Carrito vaciado', 'info');
          }}
          className="text-xs font-bold text-pink-700 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 px-3.5 py-2 rounded-full border border-pink-200/70 transition-all flex items-center space-x-1.5 shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5 text-pink-600" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      {/* User Login Banner / Status */}
      {currentUser ? (
        <div className="bg-gradient-to-r from-pink-100/70 via-purple-100/70 to-sky-100/70 rounded-2xl p-4 border border-purple-200/60 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
              {currentUser.profile?.fullName ? currentUser.profile.fullName.charAt(0) : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-800">
                  ¡Sesión activa como {currentUser.profile?.fullName || currentUser.email}! 💖
                </span>
                <span className="bg-purple-200 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Mamá Verificada
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Tus datos de dirección están sincronizados para compras más ágiles.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full border border-amber-300/80 text-xs font-extrabold shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span>Puntos acumulados: {currentUser.loyaltyPoints || 0} pts</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 rounded-2xl p-4 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">
                ¡Inicia sesión o regístrate para finalizar tu compra! ✨
              </span>
              <span className="text-xs text-slate-600">
                Al crear tu usuario se guardarán tus direcciones de envío y acumularás <strong>Puntos Ensueño</strong> por cada compra.
              </span>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Iniciar Sesión / Registrarme
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-pink-200 transition-colors"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800 line-clamp-1">{item.product.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span>Aroma: <strong>{item.selectedFragrance}</strong></span>
                      <span>•</span>
                      <span>Talla: <strong>{item.selectedSize}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center space-x-2 bg-purple-50/60 rounded-full p-1 border border-purple-100">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-white text-purple-700 hover:bg-pink-100 flex items-center justify-center font-bold transition-colors border border-purple-200/60 shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-white text-purple-700 hover:bg-sky-100 flex items-center justify-center font-bold transition-colors border border-purple-200/60 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-base text-purple-700 block">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selector de Direcciones Guardadas si el usuario ya inició sesión */}
          {currentUser && savedAddresses.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" /> Tus Direcciones Guardadas ({savedAddresses.length})
                </h3>
                <span className="text-xs text-purple-600 font-semibold">Selección 1-Clic</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => applySavedAddress(addr)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-400 shadow-sm ring-2 ring-purple-300'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" /> {addr.title || 'Hogar'}
                          {addr.isDefault && (
                            <span className="text-[9px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
                              Principal
                            </span>
                          )}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSavedAddress(addr.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar dirección"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">{addr.address}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {addr.city}, {addr.department}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formulario Datos de Envío en Colombia con Selector Dinámico */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" /> Destino de Envío en Colombia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">1. Departamento</label>
                <select
                  value={selectedDeptIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedDeptIndex(idx);
                    setSelectedCity(COLOMBIA_LOCATION_DATA[idx].cities[0]);
                    setSelectedAddressId(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                >
                  {COLOMBIA_LOCATION_DATA.map((d, index) => (
                    <option key={d.name} value={index}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">2. Municipio / Ciudad</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedAddressId(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                >
                  {COLOMBIA_LOCATION_DATA[selectedDeptIndex].cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección Exacta de Entrega</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setSelectedAddressId(null);
                  }}
                  placeholder="Calle, Carrera, Apto / Casa, Barrio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-sky-50/50 rounded-3xl p-6 border border-pink-100 shadow-sm space-y-6">
          <h2 className="font-bold text-xl text-slate-800 border-b border-pink-200/60 pb-3">Resumen de Compra</h2>

          {/* Loyalty Points Earned Badge */}
          <div className="bg-amber-100/80 border border-amber-300/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <div className="text-xs text-amber-950">
              <span className="font-extrabold block text-amber-900">
                ¡Acumularás +{loyaltyPointsEarned} Puntos Ensueño! 🌟
              </span>
              <span>Canjeables por productos y descuentos exclusivos en tu perfil.</span>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">¿Tienes un Cupón?</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                placeholder="Ej: SUEÑO10"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-pink-200/80 uppercase font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => handleApplyCoupon(inputCoupon)}
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-all border border-white/50 active:scale-95 shrink-0"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 text-xs border-t border-b border-pink-200/60 py-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Productos</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-pink-700 font-semibold bg-pink-100/60 px-2 py-1 rounded-lg border border-pink-200/60">
                <span>Descuento Cupón</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            {shippingDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-1 rounded-lg border border-emerald-200/60">
                <span>Descuento Envío por Cantidad</span>
                <span>-{formatPrice(shippingDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 items-center">
              <span>Envío ({selectedCity})</span>
              <span>
                {isFreeShipping ? (
                  <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 uppercase font-extrabold text-[11px]">¡GRATIS!</strong>
                ) : (
                  <strong className="text-slate-800">{formatPrice(shippingCost)}</strong>
                )}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 italic">Tiempo estimado: {deliveryEstimate}</div>

            <div className="flex justify-between items-baseline pt-2 border-t border-pink-200/60 text-base font-extrabold text-slate-800">
              <span>Total a Pagar</span>
              <span className="text-2xl text-purple-700 font-extrabold">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckoutClick}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:via-purple-500 hover:to-sky-500 text-white font-extrabold text-base py-4 rounded-2xl shadow-md shadow-pink-200/60 hover:shadow-purple-300/80 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-white/50 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Generando Pago...' : 'Pagar con MercadoPago'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-medium text-center bg-white/60 py-2 rounded-xl border border-pink-100">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Pago seguro con MercadoPago · Encriptación SSL</span>
          </div>
        </div>
      </div>

    </div>
  );
}
