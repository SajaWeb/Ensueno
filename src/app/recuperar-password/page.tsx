'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Lock, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiService.requestPasswordReset(email);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Se ha enviado un enlace de recuperación a tu correo.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al procesar la solicitud' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiService.resetPassword(token!, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: '¡Contraseña restablecida con éxito! Redirigiendo a tu perfil...' });
        setTimeout(() => {
          router.push('/perfil');
        }, 2500);
      } else {
        setMessage({ type: 'error', text: res.error || 'Token inválido o expirado' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Ocurrió un error al cambiar la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {token ? 'Nueva Contraseña' : 'Recuperar Contraseña'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {token
              ? 'Ingresa tu nueva contraseña para acceder a tu cuenta de Ensueño'
              : 'Ingresa tu correo registrado para enviarte un enlace de recuperación seguro'}
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {token ? (
          <form onSubmit={handleConfirmReset} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 text-sm"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <Link href="/perfil" className="text-sm font-medium text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
