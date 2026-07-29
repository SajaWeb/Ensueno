'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Baby,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

export default function UniversalAuthModal() {
  const { showToast } = useToast();
  const { isAuthModalOpen, authModalMode, closeAuthModal, setAuthModalMode, refreshUser } = useUser();

  // Registration Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [babyName, setBabyName] = useState('');
  const [skinCondition, setSkinCondition] = useState('Sensible');
  const [acceptDataPolicy, setAcceptDataPolicy] = useState(false);

  // Status & Error States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 6-digit Verification Step State
  const [isVerifyingStep, setIsVerifyingStep] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await apiService.login(email, password);
      if (res.success) {
        showToast('¡Bienvenida de nuevo a Ensueño Baby! 💖', 'success');
        await refreshUser();
        closeAuthModal();
      } else {
        setErrorMsg(res.error || 'Correo o contraseña incorrectos');
        showToast(res.error || 'Error al iniciar sesión', 'error');
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión al iniciar sesión');
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!acceptDataPolicy) {
      setErrorMsg('Debes aceptar la Política de Tratamiento de Datos Personales para registrarte.');
      showToast('Debes aceptar la Política de Tratamiento de Datos Personales', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.register({
        email,
        password,
        fullName,
        phone,
        babyName,
        skinCondition,
      });

      if (res.success) {
        showToast('¡Cuenta creada! Se envió un código de 6 dígitos a tu correo ✨', 'success');
        await refreshUser();
        setIsVerifyingStep(true);
      } else {
        setErrorMsg(res.error || 'Error al crear la cuenta');
        showToast(res.error || 'Error al registrar la cuenta', 'error');
      }
    } catch (err: any) {
      setErrorMsg('Error al conectar con el servidor');
      showToast('Error al registrar la cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCodeInput) return;

    setVerifyingCode(true);
    setVerifyMessage(null);

    try {
      const res = await apiService.verifyEmail(email, verificationCodeInput);
      if (res.success) {
        showToast('¡Correo electrónico verificado exitosamente! 💖', 'success');
        setVerifyMessage({ type: 'success', text: '¡Correo verificado con éxito!' });
        await refreshUser();
        setTimeout(() => {
          setIsVerifyingStep(false);
          closeAuthModal();
        }, 1500);
      } else {
        setVerifyMessage({ type: 'error', text: res.error || 'Código incorrecto' });
      }
    } catch (err) {
      setVerifyMessage({ type: 'error', text: 'Error al verificar el código.' });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const res = await apiService.resendVerificationCode(email);
      if (res.success) {
        showToast(res.message || 'Nuevo código enviado', 'success');
        setVerifyMessage({ type: 'success', text: 'Se ha enviado un nuevo código a tu correo.' });
      } else {
        showToast(res.error || 'Error al reenviar código', 'error');
      }
    } catch {
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl border border-purple-100 max-w-md w-full rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl space-y-6 relative my-8">
        {/* Header Bar with Back / Exit option */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            onClick={closeAuthModal}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver atrás
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
              Ensueño Baby
            </span>
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6-Digit Code Verification Screen */}
        {isVerifyingStep ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-purple-200">
                <ShieldCheck className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800">Verifica tu Correo Electrónico</h2>
              <p className="text-xs text-slate-500">
                Ingresa el código de 6 dígitos enviado por Resend a <strong className="font-mono">{email}</strong>:
              </p>
            </div>

            {verifyMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  verifyMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {verifyMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{verifyMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value)}
                  placeholder="Ej: 482915"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 text-slate-800 font-mono text-center tracking-widest text-xl font-black focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50/50"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={verifyingCode}
                className="btn-ensueno-primary w-full h-12 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
              >
                {verifyingCode ? 'Verificando...' : 'Confirmar Código'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                className="w-full text-slate-500 hover:text-purple-700 text-xs font-bold text-center block pt-1 cursor-pointer"
              >
                ¿No recibiste el código? Reenviar correo
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  authModalMode === 'login'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  authModalMode === 'register'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Crear Mi Cuenta
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {authModalMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase text-slate-600">Contraseña</label>
                    <Link
                      href="/recuperar-password"
                      onClick={closeAuthModal}
                      className="text-[11px] font-bold text-purple-600 hover:underline"
                    >
                      ¿Olvidaste tu clave?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ensueno-primary w-full h-12 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: María Alejandra Morales"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">Correo</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                      Nombre Bebé
                    </label>
                    <input
                      type="text"
                      required
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Ej: Sofía"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                      Tipo de Piel
                    </label>
                    <select
                      value={skinCondition}
                      onChange={(e) => setSkinCondition(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      <option value="Sensible">Sensible</option>
                      <option value="Atópica">Atópica</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modalAcceptDataPolicy"
                    required
                    checked={acceptDataPolicy}
                    onChange={(e) => setAcceptDataPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="modalAcceptDataPolicy" className="text-[10px] text-slate-600 leading-tight select-none">
                    Acepto la{' '}
                    <Link
                      href="/politica-tratamiento-datos"
                      target="_blank"
                      className="text-purple-600 font-bold underline hover:text-purple-800"
                    >
                      Política de Tratamiento de Datos Personales
                    </Link>{' '}
                    y Términos de Ensueño Baby.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ensueno-primary w-full h-12 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta Ensueño'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
