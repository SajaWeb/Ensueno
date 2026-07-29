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
  X,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { apiService } from '@/services/api';
import { COLOMBIA_LOCATION_DATA } from '@/data/colombiaData';

export default function ProfilePage() {
  const { showToast } = useToast();
  const { currentUser, openAuthModal, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'preferencias'>('perfil');

  // Customer Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Email verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    if (currentUser) {
      setIsLoggedIn(true);
      setUserData(currentUser);
      populateEditForm(currentUser);
      fetchUserOrders();
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [currentUser]);

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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCodeInput) return;

    setIsVerifyingCode(true);
    setVerifyMessage(null);
    try {
      const res = await apiService.verifyEmail(userData?.email || '', verificationCodeInput);
      if (res.success) {
        showToast('¡Correo electrónico verificado con éxito! 💖', 'success');
        setVerifyMessage({ type: 'success', text: '¡Correo verificado exitosamente!' });
        await refreshUser();
        setTimeout(() => {
          setShowVerifyModal(false);
          setVerifyMessage(null);
        }, 1500);
      } else {
        setVerifyMessage({ type: 'error', text: res.error || 'Código de confirmación incorrecto' });
      }
    } catch (err: any) {
      setVerifyMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      const res = await apiService.resendVerificationCode(userData?.email || '');
      if (res.success) {
        showToast(res.message || 'Nuevo código enviado', 'success');
        setVerifyMessage({ type: 'success', text: 'Se ha enviado un nuevo código a tu correo.' });
      } else {
        showToast(res.error || 'Error al reenviar código', 'error');
      }
    } catch (err) {
      showToast('Error al solicitar nuevo código', 'error');
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

  // Si el cliente no ha iniciado sesión, mostrar tarjeta de invitación con botón al modal universal
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-purple-100 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white">
            <Baby className="w-8 h-8 text-purple-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">¡Bienvenida a Ensueño Baby! 💖</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Inicia sesión o crea tu cuenta para ver tus datos, consultar el historial de tus compras y acumular Puntos Ensueño.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            Iniciar Sesión / Registrarme
          </button>
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
      {/* Verification Banner if unverified */}
      {userData && userData.emailVerified === false && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-900">Confirma tu Correo Electrónico</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Hemos enviado un código de confirmación de 6 dígitos a <strong className="font-mono font-bold">{userData.email}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-all shrink-0 uppercase tracking-wider cursor-pointer"
          >
            Ingresar Código (6 Dígitos)
          </button>
        </div>
      )}

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
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            order.status === 'orden_generada'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : order.status === 'confirmado'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : order.status === 'empacada'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : order.status === 'en_camino'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : order.status === 'sin_poder_entregarse'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : order.status === 'entregada'
                              ? 'bg-teal-100 text-teal-800 border-teal-300'
                              : order.status === 'devolucion'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {order.status === 'orden_generada'
                            ? 'Orden Generada (Pendiente Pago)'
                            : order.status === 'confirmado'
                            ? 'Pago Aprobado'
                            : order.status === 'empacada'
                            ? 'Empacada'
                            : order.status === 'en_camino'
                            ? 'En Camino'
                            : order.status === 'sin_poder_entregarse'
                            ? 'Sin Poder Entregarse'
                            : order.status === 'entregada'
                            ? 'Entregada'
                            : order.status === 'devolucion'
                            ? 'Devolución'
                            : 'Anulada'}
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
                    <span className="font-bold text-purple-700 font-mono text-[11px]">
                      Estado Pago MP: {order.paymentStatus === 'approved' ? 'Aprobado ✅' : 'Pendiente ⏳'}
                    </span>
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

      {/* Modal de Confirmación de Correo (Código 6 Dígitos) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 max-w-md w-full rounded-3xl p-6 text-slate-800 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg text-slate-800">Confirmación de Correo</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {verifyMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  verifyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {verifyMessage.text}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-xs text-slate-500">
                Ingresa el código de 6 dígitos enviado por Resend a tu correo electrónico:
              </p>

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
                disabled={isVerifyingCode}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingCode ? 'Verificando...' : 'Confirmar Código'}
              </button>

              <button
                type="button"
                onClick={handleResendVerificationCode}
                className="w-full text-slate-500 hover:text-purple-700 text-xs font-bold text-center block pt-1 cursor-pointer"
              >
                ¿No recibiste el código? Reenviar correo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
