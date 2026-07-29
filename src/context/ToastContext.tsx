'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X, Star, Heart } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    // Trigger smooth exit animation before removing from DOM
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

    // Auto dismiss after 3.8 seconds with smooth exit animation
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* CENTER-SCREEN BACKDROP & TOAST NOTIFICATION CONTAINER */}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          {/* Full Screen Soft Backdrop Blur */}
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md transition-opacity duration-300 pointer-events-auto" />

          {/* Centered Toast List */}
          <div className="relative z-10 flex flex-col gap-4 max-w-sm sm:max-w-md w-full pointer-events-auto items-center">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`w-full p-5 sm:p-6 rounded-3xl shadow-2xl border backdrop-blur-2xl transition-all duration-300 transform ${
                  toast.isExiting
                    ? 'opacity-0 scale-90 translate-y-4'
                    : 'opacity-100 scale-100 translate-y-0 animate-fade-in'
                } ${
                  toast.type === 'success'
                    ? 'bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-emerald-900/95 border-emerald-400/50 text-emerald-50 shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : toast.type === 'error'
                    ? 'bg-gradient-to-br from-rose-950/95 via-slate-900/95 to-rose-900/95 border-rose-400/50 text-rose-50 shadow-rose-950/40 ring-1 ring-rose-400/30'
                    : 'bg-gradient-to-br from-purple-950/95 via-slate-900/95 to-purple-900/95 border-purple-400/50 text-purple-50 shadow-purple-950/40 ring-1 ring-purple-400/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* PERSONAJE ESTRELLA ENSUEÑO (Puedes reemplazar el icono Star por tu etiqueta <img src="/estrellita-ensueno.png" /> cuando lo desees) */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-300 via-yellow-200 to-pink-300 p-0.5 shadow-md border border-white/60 flex items-center justify-center animate-bounce">
                      <Star className="w-7 h-7 text-amber-600 fill-amber-400" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs">
                      {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {toast.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                    </span>
                  </div>

                  {/* Mensaje de Alerta */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Alerta de Cuidado Ensueño
                      </span>
                      <button
                        onClick={() => removeToast(toast.id)}
                        className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        title="Cerrar notificación"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                      {toast.message}
                    </p>
                  </div>
                </div>

                {/* Botón de Confirmación Rápida "Entendido" */}
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 shadow-2xs cursor-pointer"
                  >
                    Entendido ✨
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de ToastProvider');
  }
  return context;
}
