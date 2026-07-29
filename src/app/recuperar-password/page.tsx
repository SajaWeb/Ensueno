'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Lock, Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get('token') || searchParams.get('code') || '';

  const [step, setStep] = useState<1 | 2>(tokenParam ? 2 : 1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (tokenParam) {
      setCode(tokenParam);
      setStep(2);
    }
  }, [tokenParam]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiService.requestPasswordReset(email);
      if (res.success) {
        setMessage({
          type: 'success',
          text: res.message || 'Se ha enviado un código de 6 dígitos a tu correo.',
        });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al procesar la solicitud' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Ocurrió un error inesperado al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Completa todos los campos requeridos.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiService.resetPassword(code, newPassword, email);
      if (res.success) {
        setMessage({
          type: 'success',
          text: '¡Contraseña restablecida con éxito! Redirigiendo al perfil...',
        });
        setTimeout(() => {
          router.push('/perfil');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Código de seguridad inválido o expirado' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Ocurrió un error al restablecer la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-sky-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-purple-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200 shadow-2xs">
            {step === 1 ? <Mail className="w-8 h-8 text-purple-600" /> : <ShieldCheck className="w-8 h-8 text-purple-600" />}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {step === 1 ? 'Recuperar Contraseña' : 'Confirmar Código y Nueva Clave'}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {step === 1
              ? 'Ingresa tu correo registrado para enviarte un código de seguridad de 6 dígitos mediante Resend'
              : 'Ingresa el código de 6 dígitos enviado a tu correo e ingresa tu nueva clave'}
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
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

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 text-xs font-semibold"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ensueno-primary w-full shadow-md shadow-purple-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Enviando Código...' : 'Enviar Código de Seguridad'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-5">
            {email && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-800 text-center font-bold">
                Código enviado a: <span className="font-mono">{email}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Código de Confirmación (6 Dígitos)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={32}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej: 482915"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 font-mono text-center tracking-widest text-lg font-black bg-purple-50/50"
                />
                <KeyRound className="w-4 h-4 text-purple-500 absolute left-4 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 text-xs font-semibold"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu clave"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 text-xs font-semibold"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ensueno-primary w-full shadow-md shadow-purple-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-slate-500 hover:text-purple-700 text-xs font-bold text-center block pt-1"
            >
              ← Volver a ingresar correo
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <Link href="/perfil" className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
