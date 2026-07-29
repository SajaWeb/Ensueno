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
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

const COUNTRY_DIAL_CODES = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia (+57)' },
  { code: '+1', flag: '🇺🇸', name: 'EE.UU. / Canadá (+1)' },
  { code: '+52', flag: '🇲🇽', name: 'México (+52)' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina (+54)' },
  { code: '+56', flag: '🇨🇱', name: 'Chile (+56)' },
  { code: '+51', flag: '🇵🇪', name: 'Perú (+51)' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador (+593)' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela (+58)' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá (+507)' },
  { code: '+34', flag: '🇪🇸', name: 'España (+34)' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil (+55)' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica (+506)' },
];

export default function UniversalAuthModal() {
  const { showToast } = useToast();
  const { isAuthModalOpen, authModalMode, closeAuthModal, setAuthModalMode, refreshUser } = useUser();

  // Wizard Step State for Registration (1 to 4)
  const [regStep, setRegStep] = useState<number>(1);

  // Registration Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+57');
  const [phone, setPhone] = useState('');
  const [babyName, setBabyName] = useState('');
  const [skinCondition, setSkinCondition] = useState('Sensible');
  const [acceptDataPolicy, setAcceptDataPolicy] = useState(false);

  // Show password states (supports hover & click toggle)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  const validateCurrentStep = (): boolean => {
    setErrorMsg(null);

    if (regStep === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Por favor ingresa un correo electrónico válido.');
        return false;
      }
      const cleanDigits = phone.replace(/\D/g, '');
      if (!cleanDigits) {
        setErrorMsg('Por favor ingresa tu número de celular / WhatsApp.');
        return false;
      }
      if (cleanDigits.length < 7 || cleanDigits.length > 14) {
        setErrorMsg('El número de celular debe tener entre 7 y 10 dígitos numéricos.');
        return false;
      }
      return true;
    }

    if (regStep === 2) {
      if (!docNumber.trim()) {
        setErrorMsg('Debes ingresar tu número de documento para la facturación electrónica.');
        return false;
      }
      return true;
    }

    if (regStep === 3) {
      if (!babyName.trim()) {
        setErrorMsg('Por favor ingresa el nombre de tu bebé.');
        return false;
      }
      return true;
    }

    if (regStep === 4) {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Verifícalas antes de continuar.');
        return false;
      }
      if (!acceptDataPolicy) {
        setErrorMsg('Debes aceptar la Política de Tratamiento de Datos Personales para registrarte.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateCurrentStep()) {
      setRegStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setRegStep((prev) => Math.max(1, prev - 1));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    const fullPhone = `${phoneCountryCode}${cleanPhoneDigits}`;

    try {
      const res = await apiService.register({
        email,
        password,
        fullName,
        docType,
        docNumber: docNumber.trim(),
        phone: fullPhone,
        babyName,
        skinCondition,
        acceptDataPolicy,
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
      <div className="bg-white/95 backdrop-blur-xl border border-purple-100 max-w-md w-full rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl space-y-5 relative my-6 transition-all duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <button
            onClick={closeAuthModal}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cerrar
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
              Ensueño Baby ✨
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
          <div className="space-y-6 animate-fade-in">
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
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
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
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  authModalMode === 'register'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Crear Mi Cuenta
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl font-semibold flex items-center gap-2 animate-shake">
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
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onMouseEnter={() => setShowLoginPassword(true)}
                      onMouseLeave={() => setShowLoginPassword(false)}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-purple-600 transition-colors p-0.5"
                      title="Mantén sobre el icono o haz clic para ver contraseña"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
                    </button>
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
              /* INTERACTIVE MULTI-STEP REGISTER WIZARD */
              <div className="space-y-4">
                {/* Step Indicator Header with Progress Bar */}
                <div className="space-y-2 bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-sky-50/70 p-3 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-purple-800">
                    <span className="flex items-center gap-1.5">
                      {regStep === 1 && <User className="w-3.5 h-3.5 text-purple-600" />}
                      {regStep === 2 && <FileText className="w-3.5 h-3.5 text-pink-600" />}
                      {regStep === 3 && <Baby className="w-3.5 h-3.5 text-sky-600" />}
                      {regStep === 4 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      Paso {regStep} de 4:{' '}
                      {regStep === 1 && 'Tus Datos Personales 🌸'}
                      {regStep === 2 && 'Facturación Electrónica 📄'}
                      {regStep === 3 && 'Perfil de tu Bebé 🍼'}
                      {regStep === 4 && 'Seguridad & Términos 🔒'}
                    </span>
                    <span className="text-purple-600 font-mono text-[10px]">{regStep * 25}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 transition-all duration-300 rounded-full"
                      style={{ width: `${regStep * 25}%` }}
                    />
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex justify-between pt-0.5 px-1">
                    {[1, 2, 3, 4].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => {
                          if (step < regStep) setRegStep(step);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          step === regStep
                            ? 'bg-purple-600 text-white ring-2 ring-purple-300 scale-110 shadow-xs'
                            : step < regStep
                            ? 'bg-purple-200 text-purple-800 cursor-pointer'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {step < regStep ? '✓' : step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ANIMATED SLIDE STEPS */}
                <div className="min-h-[220px]">
                  {/* STEP 1: Datos Personales & Contacto */}
                  {regStep === 1 && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Tu Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ej: María Alejandra Morales"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          WhatsApp (Celular) *
                        </label>
                        <div className="flex gap-1.5">
                          <select
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className="px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-100 focus:ring-2 focus:ring-purple-400 shrink-0 cursor-pointer"
                          >
                            {COUNTRY_DIAL_CODES.map((item) => (
                              <option key={item.code} value={item.code}>
                                {item.flag} {item.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="300 123 4567"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 font-mono bg-slate-50/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Facturación Electrónica */}
                  {regStep === 2 && (
                    <div className="space-y-3.5 animate-fade-in">
                      <div className="bg-pink-50/60 border border-pink-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <FileText className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-pink-900 leading-snug">
                          <strong className="block font-bold mb-0.5">Datos para Facturación Electrónica 🧾</strong>
                          Ingresa tu documento legal para generar tus facturas de compra. Por normatividad legal, este dato no se podrá modificar posteriormente.
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Tipo de Documento *
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-white"
                        >
                          <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                          <option value="CE">Cédula de Extranjería (C.E.)</option>
                          <option value="NIT">NIT / Empresa</option>
                          <option value="PASAPORTE">Pasaporte</option>
                          <option value="TI">Tarjeta de Identidad (T.I.)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Número de Documento *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            autoFocus
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value)}
                            placeholder="Ej: 1020304050"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 font-mono"
                          />
                          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Personalización para tu Bebé */}
                  {regStep === 3 && (
                    <div className="space-y-3.5 animate-fade-in">
                      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <Baby className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-sky-900 leading-snug">
                          <strong className="block font-bold mb-0.5">Personalización Ensueño Baby 🍼</strong>
                          Cuéntanos el nombre de tu bebé y el tipo de piel para sugerirte la rutina de baño e hidratación perfecta.
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Nombre de tu Bebé *
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={babyName}
                          onChange={(e) => setBabyName(e.target.value)}
                          placeholder="Ej: Sofía"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Condición o Tipo de Piel *
                        </label>
                        <select
                          value={skinCondition}
                          onChange={(e) => setSkinCondition(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400 bg-white"
                        >
                          <option value="Sensible">Sensible</option>
                          <option value="Atópica">Muy Sensible / Atópica</option>
                          <option value="Normal">Normal</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Seguridad & Confirmación */}
                  {regStep === 4 && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                          Crea tu Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-400"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <button
                            type="button"
                            onMouseEnter={() => setShowPassword(true)}
                            onMouseLeave={() => setShowPassword(false)}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-purple-600 transition-colors p-0.5"
                            title="Mantén sobre el icono o haz clic para ver contraseña"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600">
                            Confirmar Contraseña *
                          </label>
                          {confirmPassword && (
                            <span
                              className={`text-[10px] font-bold ${
                                password === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {password === confirmPassword ? '✓ Coinciden' : '✗ No coinciden'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-purple-400 ${
                              confirmPassword && password !== confirmPassword
                                ? 'border-rose-300 bg-rose-50/50'
                                : 'border-slate-200'
                            }`}
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <button
                            type="button"
                            onMouseEnter={() => setShowConfirmPassword(true)}
                            onMouseLeave={() => setShowConfirmPassword(false)}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-purple-600 transition-colors p-0.5"
                            title="Mantén sobre el icono o haz clic para ver contraseña"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="modalAcceptDataPolicy"
                          required
                          checked={acceptDataPolicy}
                          onChange={(e) => setAcceptDataPolicy(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer shrink-0"
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
                    </div>
                  )}
                </div>

                {/* SLIDE WIZARD CONTROLS (Anterior / Siguiente / Crear Cuenta) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {regStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 transition-all inline-flex items-center gap-1 shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>
                  )}

                  {regStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-ensueno-primary flex-1 h-12 text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Siguiente paso</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      disabled={loading || !acceptDataPolicy}
                      className="btn-ensueno-primary flex-1 h-12 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>{loading ? 'Creando cuenta...' : 'Crear Mi Cuenta ✨'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
