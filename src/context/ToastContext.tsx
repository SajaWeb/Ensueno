'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Sparkles, X, Star, ShieldAlert } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    // Trigger smooth exit animation before unmounting
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const activeToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* REACT PORTAL TO DOCUMENT.BODY: GUARANTEES ULTRA-HIGH Z-INDEX ABOVE ALL TEXT & MODALS */}
      {mounted && activeToast && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
          {/* Backdrop Blur Layer */}
          <div
            onClick={() => removeToast(activeToast.id)}
            className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 ${
              activeToast.isExiting ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* SweetAlert-Style Professional Ensueño Modal Card */}
          <div
            className={`relative z-10 max-w-sm sm:max-w-md w-full rounded-3xl bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl border transition-all duration-300 transform text-center space-y-4 ${
              activeToast.isExiting
                ? 'scale-90 opacity-0 translate-y-4'
                : 'scale-100 opacity-100 translate-y-0 animate-fade-in'
            } ${
              activeToast.type === 'success'
                ? 'border-emerald-200 shadow-emerald-950/20'
                : activeToast.type === 'error'
                ? 'border-rose-200 shadow-rose-950/20'
                : 'border-purple-200 shadow-purple-950/20'
            }`}
          >
            {/* Close X Button */}
            <button
              onClick={() => removeToast(activeToast.id)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Personaje Estrella Ensueño Avatar Badge (Can be replaced with <img src="/estrellita-ensueno.png" />) */}
            <div className="relative inline-block mx-auto">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl p-1 shadow-lg border-2 border-white flex items-center justify-center mx-auto transition-transform ${
                  activeToast.type === 'success'
                    ? 'bg-gradient-to-tr from-emerald-100 via-teal-200 to-amber-200 text-emerald-600'
                    : activeToast.type === 'error'
                    ? 'bg-gradient-to-tr from-rose-100 via-pink-200 to-amber-200 text-rose-600 animate-bounce'
                    : 'bg-gradient-to-tr from-purple-100 via-pink-200 to-amber-200 text-purple-600'
                }`}
              >
                {/* Estrella personaje de Ensueño (Intercambiable por PNG) */}
                <Star className="w-9 h-9 sm:w-11 sm:h-11 fill-amber-400 text-amber-500 transform hover:scale-110 transition-transform" />
              </div>

              {/* Status Badge Over Star */}
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-100">
                {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {activeToast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {activeToast.type === 'info' && <Sparkles className="w-5 h-5 text-purple-600" />}
              </div>
            </div>

            {/* Alert Header Badge */}
            <div>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                  activeToast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeToast.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-purple-50 text-purple-800 border-purple-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {activeToast.type === 'error' ? 'Alerta de Cuidado Ensueño ⚠️' : 'Notificación Ensueño ✨'}
              </span>
            </div>

            {/* Alert Message Text */}
            <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed px-2">
              {activeToast.message}
            </p>

            {/* SweetAlert Style Action Button */}
            <div className="pt-2">
              <button
                onClick={() => removeToast(activeToast.id)}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-md cursor-pointer ${
                  activeToast.type === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-200'
                    : activeToast.type === 'error'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-200'
                    : 'btn-ensueno-primary'
                }`}
              >
                Entendido ✨
              </button>
            </div>
          </div>
        </div>,
        document.body
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
