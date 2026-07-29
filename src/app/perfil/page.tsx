'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  Settings,
  Baby,
  Check,
  Save,
  Lock,
  Mail,
  Sparkles,
  LogOut,
  Phone,
  MapPin,
  Star,
  KeyRound,
  Building2,
  Calendar,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';
import { COLOMBIA_LOCATION_DATA } from '@/data/colombiaData';

export default function ProfilePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'preferencias'>('perfil');

  // Customer Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [babyNameState, setBabyNameState] = useState('');
  const [skinTypeState, setSkinTypeState] = useState('Sensible');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // User Profile Data state (real data from API)
  const [userData, setUserData] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Profile Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDeptIndex, setEditDeptIndex] = useState(0);
  const [editCity, setEditCity] = useState(COLOMBIA_LOCATION_DATA[0].cities[0]);
  const [editAddress, setEditAddress] = useState('');
  const [editBabyName, setEditBabyName] = useState('');
  const [editSkinCondition, setEditSkinCondition] = useState('Sensible');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const res = await apiService.getCurrentUser();
      if (res.success && res.authenticated && res.user) {
        setIsLoggedIn(true);
        setUserData(res.user);
        populateEditForm(res.user);
        fetchUserOrders();
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  const populateEditForm = (user: any) => {
    if (!user) return;
    setEditFullName(user.profile?.fullName || '');
    setEditPhone(user.profile?.phone || '');
    setEditAddress(user.profile?.address || '');
    setEditBabyName(user.profile?.babies?.[0]?.babyName || '');
    setEditSkinCondition(user.profile?.babies?.[0]?.skinCondition || 'Sensible');

    if (user.profile?.department) {
      const deptIdx = COLOMBIA_LOCATION_DATA.findIndex(
        (d) => d.name.toLowerCase() === user.profile.department.toLowerCase()
      );
      if (deptIdx !== -1) {
        setEditDeptIndex(deptIdx);
        if (user.profile?.city) {
          const matchedCity = COLOMBIA_LOCATION_DATA[deptIdx].cities.find(
            (c) => c.toLowerCase() === user.profile.city.toLowerCase()
          );
          if (matchedCity) setEditCity(matchedCity);
        }
      }
    }
  };

  const fetchUserOrders = async () => {
    try {
      const orders = await apiService.getUserOrders();
      setUserOrders(orders);
    } catch (err) {
      console.warn('Error cargando pedidos del usuario:', err);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await apiService.login(email, password);
      if (res.success) {
        showToast('¡Bienvenida a tu cuenta Ensueño! 💖', 'success');
        await loadUserSession();
      } else {
        setAuthError(res.error || 'Credenciales inválidas');
        showToast(res.error || 'Credenciales inválidas', 'error');
      }
    } catch (err) {
      setAuthError('Error al iniciar sesión');
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await apiService.register({
        email,
        password,
        fullName,
        phone,
        babyName: babyNameState,
        skinCondition: skinTypeState,
      });

      if (res.success) {
        showToast('¡Cuenta creada con éxito! Bienvenida a Ensueño ✨', 'success');
        await loadUserSession();
      } else {
        setAuthError(res.error || 'Error al registrar usuario');
        showToast(res.error || 'Error al registrar la cuenta', 'error');
      }
    } catch (err) {
      setAuthError('Error al registrar la cuenta');
      showToast('Error al crear tu cuenta', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    localStorage.removeItem('ensueno_customer_logged_in');
    setIsLoggedIn(false);
    setUserData(null);
    showToast('Sesión de usuario cerrada', 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentDeptName = COLOMBIA_LOCATION_DATA[editDeptIndex].name;

    try {
      const res = await apiService.updateUserProfile({
        fullName: editFullName,
        phone: editPhone,
        department: currentDeptName,
        city: editCity,
        address: editAddress,
        babyName: editBabyName,
        skinCondition: editSkinCondition,
      });

      if (res.success) {
        setSavedSuccess(true);
        showToast('¡Datos de perfil y envío actualizados correctamente! 💖', 'success');
        setTimeout(() => setSavedSuccess(false), 3000);
        await loadUserSession();
      } else {
        showToast(res.error || 'Error al actualizar perfil', 'error');
      }
    } catch (err) {
      showToast('Error conectando al servidor para guardar perfil', 'error');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await apiService.updateUserProfile({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        showToast('Contraseña actualizada correctamente 🔑', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.error || 'Error al cambiar la contraseña', 'error');
      }
    } catch (err) {
      showToast('Error al procesar el cambio de contraseña', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Si el cliente no ha iniciado sesión, mostrar el formulario estético de Login/Registro Ensueño
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-purple-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white">
              <Baby className="w-8 h-8 text-purple-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {authMode === 'login' ? '¡Hola, Mamá Ensueño! 💖' : 'Crear Tu Cuenta Ensueño ✨'}
            </h1>
            <p className="text-xs text-slate-500">
              {authMode === 'login'
                ? 'Ingresa para ver el seguimiento de tus compras y recomendaciones para tu bebé'
                : 'Registra tus datos y los de tu bebé para recibir atención personalizada y compras en 1-clic'}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <Link href="/recuperar-password" className="text-purple-600 font-semibold hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all text-xs border border-white/40"
              >
                {authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tu Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: María Alejandra Morales"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre del Bebé</label>
                <input
                  type="text"
                  required
                  value={babyNameState}
                  onChange={(e) => setBabyNameState(e.target.value)}
                  placeholder="Ej: Sofía"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña de la Cuenta</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all text-xs border border-white/40"
              >
                {authLoading ? 'Creando cuenta...' : 'Crear Mi Cuenta Ensueño'}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-slate-100">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-500">
                ¿No tienes cuenta aún?{' '}
                <button onClick={() => setAuthMode('register')} className="text-purple-600 font-bold hover:underline">
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={() => setAuthMode('login')} className="text-purple-600 font-bold hover:underline">
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Real User Data from API
  const motherName = userData?.profile?.fullName || userData?.email?.split('@')[0] || 'Mamá';
  const babyName = userData?.profile?.babies?.[0]?.babyName || 'Bebé';
  const skinCondition = userData?.profile?.babies?.[0]?.skinCondition || 'Sensible';
  const points = userData?.loyaltyPoints || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-r from-pink-100/70 via-purple-100/60 to-sky-100/70 rounded-3xl p-6 sm:p-8 border border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
            {motherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-800">{motherName}</h1>
              <span className="bg-purple-200 text-purple-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">
                MAMÁ ENSUEÑO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Bebé: <strong className="text-purple-700 font-extrabold">{babyName}</strong> • Piel:{' '}
              <strong className="text-pink-700 font-extrabold">{skinCondition}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl border border-amber-300/80 text-xs font-extrabold shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Puntos: {points} pts</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tabs Bar (Favoritos eliminado) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'perfil' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Perfil & Datos de Envío</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'pedidos' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferencias')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'preferencias' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferencias & Contraseña</span>
        </button>
      </div>

      {/* Tab 1: Perfil & Datos de Envío */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 max-w-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-xl text-slate-800">Tus Datos de Perfil y Envío</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sincronizados automáticamente con tus compras en el carrito.</p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Check className="w-4 h-4" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
                />
              </div>
            </div>

            {/* Dirección de Envío */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="font-bold text-sm text-purple-700 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-purple-600" /> Ubicación Habitual de Envío
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Departamento</label>
                  <select
                    value={editDeptIndex}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setEditDeptIndex(idx);
                      setEditCity(COLOMBIA_LOCATION_DATA[idx].cities[0]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                  >
                    {COLOMBIA_LOCATION_DATA.map((d, index) => (
                      <option key={d.name} value={index}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Municipio / Ciudad</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                  >
                    {COLOMBIA_LOCATION_DATA[editDeptIndex].cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Dirección Exacta</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Calle, Carrera, Apto / Casa, Barrio"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Datos Bebé */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="font-bold text-sm text-purple-700 flex items-center gap-1.5 uppercase tracking-wide">
                <Baby className="w-4 h-4 text-purple-600" /> Información del Bebé
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre del Bebé</label>
                  <input
                    type="text"
                    value={editBabyName}
                    onChange={(e) => setEditBabyName(e.target.value)}
                    placeholder="Ej: Sofía"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Condición de la Piel</label>
                  <select
                    value={editSkinCondition}
                    onChange={(e) => setEditSkinCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Sensible">Sensible</option>
                    <option value="Muy Sensible / Atópica">Muy Sensible / Atópica</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-full shadow-md transition-all border border-white/40 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Cambios</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Mis Pedidos */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-extrabold text-xl text-slate-800">Historial de Pedidos Especifico de tu Cuenta</h2>
            <span className="text-xs text-slate-500">{userOrders.length} orden(es) registrada(s)</span>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-purple-100 shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
                📦
              </div>
              <h3 className="font-bold text-slate-800 text-base">Aún no has realizado pedidos</h3>
              <p className="text-xs text-slate-500">
                Tus pedidos confirmados aparecerán aquí con su estado de envío en tiempo real y código de rastreo.
              </p>
              <Link
                href="/"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-800">Orden #{order.orderNumber}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase">
                          {order.status || 'Confirmado'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        Realizada el {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-purple-700 block">{formatPrice(order.total)}</span>
                      <span className="text-[11px] text-slate-500">Estimado: {order.deliveryEstimate || '2-4 días'}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{item.productName}</span>
                          <span className="text-slate-400">x{item.quantity}</span>
                          {item.selectedFragrance && <span className="text-purple-600 text-[11px]">({item.selectedFragrance})</span>}
                        </div>
                        <span className="font-bold text-slate-800">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" /> Entrega en: {order.shippingAddress}
                    </span>
                    <span className="font-bold text-emerald-600">Pago Aprobado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Preferencias & Cambio de Contraseña */}
      {activeTab === 'preferencias' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 max-w-2xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-600" /> Cambiar Contraseña de tu Cuenta
            </h2>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña Actual</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-purple-400 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all border border-white/40 cursor-pointer"
            >
              {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
