'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedFragrance?: string, selectedSize?: string, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  shipping: number;
  customShippingCost: number | null;
  setCustomShippingCost: (cost: number | null) => void;
  total: number;
  cartCount: number;
  toastMessage: string | null;
  dismissToast: () => void;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customShippingCost, setCustomShippingCost] = useState<number | null>(null);
  const [shippingConfig, setShippingConfig] = useState<{ freeShippingThreshold: number; defaultRate: number }>({
    freeShippingThreshold: 60000,
    defaultRate: 12000,
  });

  // Fetch real shipping config from server on mount
  useEffect(() => {
    fetch('/api/v1/shipping/config')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.config) {
          setShippingConfig({
            freeShippingThreshold: json.config.freeShippingThreshold || 60000,
            defaultRate: json.config.defaultRate || 12000,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ensueno_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('ensueno_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = (
    product: Product,
    selectedFragrance?: string,
    selectedSize?: string,
    quantity = 1
  ) => {
    const fragrance = selectedFragrance || product.fragrances[0] || 'Estándar';
    const size = selectedSize || product.sizes[0] || 'Estándar';
    const cartItemId = `${product.id}-${fragrance}-${size}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedFragrance: fragrance,
          selectedSize: size,
          quantity,
        },
      ];
    });

    showToast(`¡${product.name} agregado al carrito! ✨`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountPercent(0);
    setCustomShippingCost(null);
    try {
      localStorage.removeItem('ensueno_cart');
    } catch {}
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SUEÑO10' || cleanCode === 'SUENO10') {
      setCouponCode('SUEÑO10');
      setDiscountPercent(0.1);
      showToast('¡Cupón SUEÑO10 aplicado con 10% de descuento! 🌟');
      return true;
    } else if (cleanCode === 'NUBE20') {
      setCouponCode('NUBE20');
      setDiscountPercent(0.2);
      showToast('¡Cupón NUBE20 aplicado con 20% de descuento! ☁️');
      return true;
    }
    showToast('Cupón no válido. Intenta con SUEÑO10');
    return false;
  };

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * discountPercent);

  // Dynamic shipping calculation based on server threshold & custom rates
  const shipping =
    items.length === 0
      ? 0
      : subtotal >= shippingConfig.freeShippingThreshold
      ? 0
      : customShippingCost !== null
      ? customShippingCost
      : shippingConfig.defaultRate;

  const total = Math.max(0, subtotal - discount + shipping);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discount,
        couponCode,
        applyCoupon,
        shipping,
        customShippingCost,
        setCustomShippingCost,
        total,
        cartCount,
        toastMessage,
        dismissToast: () => setToastMessage(null),
        freeShippingThreshold: shippingConfig.freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
