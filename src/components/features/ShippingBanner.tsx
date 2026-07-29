'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ShippingBanner() {
  const { subtotal } = useCart();
  const [threshold, setThreshold] = useState(60000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/v1/shipping/config');
      const json = await res.json();
      if (json.success && json.data?.freeShippingThreshold) {
        setThreshold(json.data.freeShippingThreshold);
      }
    } catch (err) {
      console.warn('Error obteniendo umbral de envío gratis:', err);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - subtotal);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  if (loading) return null;

  return (
    <div className="bg-gradient-to-r from-pink-100/90 via-purple-100/90 to-sky-100/90 text-slate-800 px-4 py-2.5 border-b border-pink-200/80 shadow-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-semibold">
        <div className="flex items-center gap-2">
          {remaining === 0 ? (
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold bg-emerald-100/90 px-3.5 py-1 rounded-full border border-emerald-300/80 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>¡Felicidades! Tienes ENVÍO GRATIS asegurado a toda Colombia 🚚🎉</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-xs border border-pink-200">
                <Truck className="w-4 h-4 text-purple-600 animate-pulse" />
              </div>
              <span className="text-slate-700 font-medium">
                ¡Agrega{' '}
                <strong className="inline-block bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-lg border border-amber-300/80 shadow-xs">
                  {formatCurrency(remaining)}
                </strong>{' '}
                más para obtener{' '}
                <strong className="inline-block bg-pink-200/80 text-pink-800 font-extrabold px-2 py-0.5 rounded-lg border border-pink-300/80 shadow-xs">
                  ENVÍO GRATIS
                </strong>! 🚚
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 w-full sm:w-64">
          <div className="w-full bg-white/90 rounded-full h-3 overflow-hidden border border-purple-200/80 shadow-inner p-0.5">
            <div
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-purple-800 font-extrabold shrink-0 bg-white/90 px-2 py-0.5 rounded-full border border-purple-200 shadow-xs">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
