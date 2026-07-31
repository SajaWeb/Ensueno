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
  const [activeTab, setActiveTab] = useState<'perfil' | 'direcciones' | 'pedidos' | 'preferencias'>('perfil');

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

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [newAddrTitle, setNewAddrTitle] = useState('Hogar');
  const [newAddrDeptIdx, setNewAddrDeptIdx] = useState(0);
  const [newAddrCity, setNewAddrCity] = useState(COLOMBIA_LOCATION_DATA[0].cities[0]);
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Profile Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editDocType, setEditDocType] = useState('CC');
  const [editDocNumber, setEditDocNumber] = useState('');
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
      fetchSavedAddresses();
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [currentUser]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await apiService.getSavedAddresses();
      if (res.success && Array.isArray(res.data)) {
        setSavedAddresses(res.data);
      }
    } catch (err) {
      console.warn('Error cargando direcciones:', err);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine.trim()) {
      showToast('Ingresa la dirección exacta de entrega', 'error');
      return;
    }
    const deptName = COLOMBIA_LOCATION_DATA[newAddrDeptIdx].name;
    try {
      const res = await apiService.addSavedAddress({
        title: newAddrTitle || 'Hogar',
        department: deptName,
        city: newAddrCity,
        address: newAddrLine.trim(),
        isDefault: newAddrIsDefault || savedAddresses.length === 0,
      });
      if (res.success) {
        showToast('¡Dirección de envío guardada! 🏠', 'success');
        setNewAddrLine('');
        setIsAddingAddress(false);
        await fetchSavedAddresses();
        await refreshUser();
      } else {
        showToast(res.error || 'Error al guardar dirección', 'error');
      }
    } catch {
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  const handleSetDefaultAddress = async (addr: any) => {
    try {
      const res = await apiService.updateSavedAddress({
        id: addr.id,
        title: addr.title,
        department: addr.department,
        city: addr.city,
        address: addr.address,
        isDefault: true,
      });
      if (res.success) {
        showToast(`Dirección "${addr.title}" fijada como predeterminada ⭐`, 'success');
        await fetchSavedAddresses();
        await refreshUser();
      }
    } catch {
      showToast('Error al fijar dirección predeterminada', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await apiService.deleteSavedAddress(id);
      if (res.success) {
        showToast('Dirección eliminada correctamente', 'info');
        await fetchSavedAddresses();
        await refreshUser();
      }
    } catch {
      showToast('Error al eliminar dirección', 'error');
    }
  };

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
        docType: editDocType,
        docNumber: editDocNumber,
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
      <main className="ens-band ens-band--cian min-h-[60vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-[24px] p-8 border border-borde text-center">
          <div className="w-16 h-16 bg-celeste rounded-2xl grid place-items-center mx-auto">
            <Baby className="w-8 h-8 text-azul" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-2xl leading-tight text-tinta">
            Tu cuenta Ensueño
          </h1>
          <p className="mt-3 text-tinta-suave leading-relaxed">
            Inicia sesión para ver tus datos, el historial de pedidos y tus puntos.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="ens-btn ens-btn--azul w-full mt-6"
          >
            Iniciar sesión
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
    <div className="ens-band ens-band--cian page-entry-anim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Verificación de correo pendiente */}
      {userData && userData.emailVerified === false && (
        <div className="bg-amarillo border border-borde rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-tinta shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg text-tinta">Confirma tu correo</h2>
              <p className="text-sm text-tinta-suave mt-0.5">
                Enviamos un código de 6 dígitos a <strong className="text-tinta">{userData.email}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowVerifyModal(true)}
            className="ens-btn ens-btn--azul h-11 text-xs shrink-0"
          >
            Ingresar código
          </button>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white border border-borde rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 grid place-items-center rounded-full bg-azul text-white font-display text-3xl"
          >
            {motherName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="ens-eyebrow text-azul">Mi cuenta</p>
            <h1 className="mt-1 font-display text-tinta text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
              {motherName}
            </h1>
            <p className="mt-1 text-sm text-tinta-suave">
              Bebé <strong className="text-tinta">{babyName}</strong> · Piel{' '}
              <strong className="text-tinta">{skinCondition}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-amarillo text-tinta text-sm font-bold">
            <Star className="w-4 h-4 fill-current" aria-hidden="true" />
            {points} puntos
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full border border-borde bg-white text-tinta-suave text-sm font-bold hover:text-secondary hover:border-secondary transition-colors ens-focus"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-borde pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'perfil' ? 'bg-azul text-white shadow-md' : 'bg-white text-tinta-suave border border-borde hover:bg-cian'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Perfil & Datos Personales</span>
        </button>

        <button
          onClick={() => setActiveTab('direcciones')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'direcciones' ? 'bg-azul text-white shadow-md' : 'bg-white text-tinta-suave border border-borde hover:bg-cian'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Direcciones de Envío ({savedAddresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'pedidos' ? 'bg-azul text-white shadow-md' : 'bg-white text-tinta-suave border border-borde hover:bg-cian'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferencias')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'preferencias' ? 'bg-azul text-white shadow-md' : 'bg-white text-tinta-suave border border-borde hover:bg-cian'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferencias & Contraseña</span>
        </button>
      </div>

      {/* Tab 1: Perfil & Datos de Envío */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borde max-w-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-borde pb-3">
            <div>
              <h2 className="font-extrabold text-xl text-tinta">Tus Datos Personales</h2>
              <p className="text-xs text-tinta-suave mt-0.5">Información general de tu cuenta de usuario.</p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-azul flex items-center space-x-1 bg-celeste px-3 py-1 rounded-full border border-borde">
                <Check className="w-4 h-4" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-tinta-suave">Tipo de Documento</label>
                  {userData?.profile?.docNumber && (
                    <span className="text-[10px] font-bold text-tinta-suave bg-cian px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-tinta-suave" /> Facturación
                    </span>
                  )}
                </div>
                <select
                  value={editDocType}
                  disabled={!!userData?.profile?.docNumber}
                  onChange={(e) => setEditDocType(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border font-semibold text-tinta ${
                    userData?.profile?.docNumber
                      ? 'bg-cian border-borde cursor-not-allowed opacity-75'
                      : 'bg-cian border-borde focus:ring-2 focus:ring-celeste'
                  }`}
                >
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                  <option value="NIT">NIT (Empresa)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-tinta-suave">
                    Número de Documento (Factura)
                  </label>
                  {userData?.profile?.docNumber && (
                    <span className="text-[10px] font-bold text-tinta bg-amarillo border border-borde px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-tertiary" /> No Modificable
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={editDocNumber}
                  disabled={!!userData?.profile?.docNumber}
                  onChange={(e) => setEditDocNumber(e.target.value)}
                  placeholder="Ej: 1020304050"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border font-semibold ${
                    userData?.profile?.docNumber
                      ? 'bg-cian border-borde text-tinta-suave cursor-not-allowed font-mono'
                      : 'bg-cian border-borde focus:ring-2 focus:ring-celeste'
                  }`}
                />
              </div>
            </div>

            {/* Datos Bebé */}
            <div className="border-t border-borde pt-4 space-y-4">
              <h3 className="font-bold text-sm text-azul flex items-center gap-1.5 uppercase tracking-wide">
                <Baby className="w-4 h-4 text-azul" /> Información del Bebé
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Nombre del Bebé</label>
                  <input
                    type="text"
                    value={editBabyName}
                    onChange={(e) => setEditBabyName(e.target.value)}
                    placeholder="Ej: Sofía"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Condición de la Piel</label>
                  <select
                    value={editSkinCondition}
                    onChange={(e) => setEditSkinCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borde text-xs font-semibold text-tinta bg-cian"
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
              className="inline-flex items-center space-x-2 bg-azul hover:bg-azul-hondo text-white font-bold text-xs px-8 py-3.5 rounded-full transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Cambios</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Mis Direcciones de Envío */}
      {activeTab === 'direcciones' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borde max-w-3xl space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-borde pb-4 gap-3">
            <div>
              <h2 className="font-extrabold text-xl text-tinta flex items-center gap-2">
                <MapPin className="w-5 h-5 text-azul" /> Mis Direcciones de Envío ({savedAddresses.length})
              </h2>
              <p className="text-xs text-tinta-suave mt-0.5">
                Administra tus ubicaciones guardadas y establece tu dirección predeterminada para el checkout.
              </p>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="btn-ensueno-primary text-xs font-extrabold px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>{isAddingAddress ? 'Cancelar' : '+ Añadir Nueva Dirección'}</span>
            </button>
          </div>

          {/* Formulario Nueva Dirección en Perfil */}
          {isAddingAddress && (
            <form onSubmit={handleCreateAddress} className="bg-cian/70 border border-borde/80 rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="font-bold text-sm text-azul flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-azul" /> Nueva Dirección de Envío
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-tinta-suave uppercase mb-1">Nombre o Etiqueta (Ej: Hogar, Oficina)</label>
                  <input
                    type="text"
                    required
                    value={newAddrTitle}
                    onChange={(e) => setNewAddrTitle(e.target.value)}
                    placeholder="Ej: Casa Mamá, Trabajo"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-borde focus:ring-2 focus:ring-celeste font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-tinta-suave uppercase mb-1">Departamento</label>
                  <select
                    value={newAddrDeptIdx}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setNewAddrDeptIdx(idx);
                      setNewAddrCity(COLOMBIA_LOCATION_DATA[idx].cities[0]);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-borde text-xs font-semibold text-tinta bg-white"
                  >
                    {COLOMBIA_LOCATION_DATA.map((d, index) => (
                      <option key={d.name} value={index}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-tinta-suave uppercase mb-1">Municipio / Ciudad</label>
                  <select
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-borde text-xs font-semibold text-tinta bg-white"
                  >
                    {COLOMBIA_LOCATION_DATA[newAddrDeptIdx].cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-tinta-suave uppercase mb-1">Dirección Exacta</label>
                  <input
                    type="text"
                    required
                    value={newAddrLine}
                    onChange={(e) => setNewAddrLine(e.target.value)}
                    placeholder="Calle, Carrera, Apto, Barrio"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-borde focus:ring-2 focus:ring-celeste font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="profileAddrIsDefault"
                  checked={newAddrIsDefault}
                  onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 text-azul rounded border-borde focus:ring-celeste cursor-pointer"
                />
                <label htmlFor="profileAddrIsDefault" className="text-xs font-bold text-tinta-suave cursor-pointer select-none">
                  Establecer como mi dirección predeterminada de envío ⭐
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-tinta-suave hover:bg-cian"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-ensueno-primary text-xs font-extrabold px-6 py-2 rounded-xl shadow-sm"
                >
                  Guardar Dirección
                </button>
              </div>
            </form>
          )}

          {/* Listado de Direcciones Guardadas */}
          {savedAddresses.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-cian rounded-2xl border border-dashed border-borde">
              <MapPin className="w-10 h-10 text-borde mx-auto" />
              <p className="text-xs font-bold text-tinta-suave">Aún no tienes direcciones guardadas en tu cuenta.</p>
              <p className="text-[11px] text-tinta-suave">Añade tu primera dirección para agilizar tus compras en el carrito.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 relative ${
                    addr.isDefault
                      ? 'bg-cian/70 border-borde shadow-sm ring-2 ring-celeste'
                      : 'bg-cian border-borde hover:bg-cian'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-tinta flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-azul" /> {addr.title || 'Hogar'}
                      {addr.isDefault && (
                        <span className="text-[9px] font-black uppercase bg-cian text-secondary px-2 py-0.5 rounded-full border border-borde">
                          ⭐ Predeterminada
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-tinta-suave hover:text-secondary p-1 transition-colors"
                      title="Eliminar dirección"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-tinta-suave space-y-0.5">
                    <p className="font-bold text-tinta">{addr.address}</p>
                    <p className="text-tinta-suave font-semibold">{addr.city}, {addr.department}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-borde">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr)}
                        className="text-[11px] font-bold text-azul hover:text-azul hover:underline inline-flex items-center gap-1"
                      >
                        ⭐ Marcar como predeterminada
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-azul flex items-center gap-1">
                        ✓ Seleccionada para envíos
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mis Pedidos */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-borde pb-3">
            <h2 className="font-extrabold text-xl text-tinta">Historial de Pedidos Especifico de tu Cuenta</h2>
            <span className="text-xs text-tinta-suave">{userOrders.length} orden(es) registrada(s)</span>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-borde shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-cian text-azul flex items-center justify-center mx-auto text-2xl">
                📦
              </div>
              <h3 className="font-bold text-tinta text-base">Aún no has realizado pedidos</h3>
              <p className="text-xs text-tinta-suave">
                Tus pedidos confirmados aparecerán aquí con su estado de envío en tiempo real y código de rastreo.
              </p>
              <Link
                href="/"
                className="inline-block bg-azul hover:bg-azul-hondo text-white font-bold text-xs px-6 py-3 rounded-full shadow-md"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 border border-borde shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-borde pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-tinta">Orden #{order.orderNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            order.status === 'confirmado' || order.paymentStatus === 'approved'
                              ? 'bg-celeste text-azul border-borde font-extrabold'
                              : order.status === 'anulada' || order.paymentStatus === 'rejected' || order.paymentStatus === 'expired'
                              ? 'bg-cian text-secondary border-borde font-extrabold'
                              : order.status === 'orden_generada'
                              ? 'bg-amarillo text-tinta border-borde font-extrabold'
                              : order.status === 'empacada'
                              ? 'bg-cian text-azul border-borde'
                              : order.status === 'en_camino'
                              ? 'bg-celeste text-azul border-borde'
                              : order.status === 'sin_poder_entregarse'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : order.status === 'entregada'
                              ? 'bg-teal-100 text-teal-800 border-teal-300'
                              : order.status === 'devolucion'
                              ? 'bg-cian text-secondary border-borde'
                              : 'bg-cian text-secondary border-borde'
                          }`}
                        >
                          {order.status === 'confirmado' || order.paymentStatus === 'approved'
                            ? '✅ Pago Aprobado'
                            : order.status === 'anulada' || order.paymentStatus === 'rejected' || order.paymentStatus === 'expired'
                            ? '❌ Pago Rechazado / Anulada'
                            : order.status === 'orden_generada'
                            ? '⏳ Pendiente de Pago (<15m)'
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
                            : '❌ Anulada'}
                        </span>
                      </div>
                      <span className="text-xs text-tinta-suave mt-0.5 block">
                        Realizada el {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-lg text-azul block">{formatPrice(order.total)}</span>
                      {order.status === 'orden_generada' && (
                        <Link
                          href={`/confirmacion/${order.orderNumber}?status=rejected`}
                          className="btn-ensueno-amber text-[10px] h-8 px-3.5 mt-1 inline-flex items-center font-extrabold"
                        >
                          Completar / Reintentar Pago
                        </Link>
                      )}
                      {order.status !== 'orden_generada' && (
                        <span className="text-[11px] text-tinta-suave">Estimado: {order.deliveryEstimate || '2-4 días'}</span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-borde">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs text-tinta-suave">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-tinta">{item.productName}</span>
                          <span className="text-tinta-suave">x{item.quantity}</span>
                          {item.selectedFragrance && <span className="text-azul text-[11px]">({item.selectedFragrance})</span>}
                        </div>
                        <span className="font-bold text-tinta">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-cian p-3 rounded-2xl flex items-center justify-between text-xs text-tinta-suave">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-azul" /> Entrega en: {order.shippingAddress}
                    </span>
                    <span className="font-bold text-azul font-mono text-[11px]">
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borde max-w-2xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-borde pb-3">
            <h2 className="font-extrabold text-xl text-tinta flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-azul" /> Cambiar Contraseña de tu Cuenta
            </h2>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Contraseña Actual</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-tinta-suave mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-cian border border-borde focus:ring-2 focus:ring-celeste font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-azul hover:bg-azul-hondo text-white font-bold text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      )}

      {/* Modal de Confirmación de Correo (Código 6 Dígitos) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-tinta/70 flex items-center justify-center p-4">
          <div className="bg-white border border-borde max-w-md w-full rounded-3xl p-6 text-tinta shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-borde pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-azul" />
                <h3 className="font-bold text-lg text-tinta">Confirmación de Correo</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-tinta-suave hover:text-tinta-suave p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {verifyMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  verifyMessage.type === 'success' ? 'bg-celeste text-azul border border-borde' : 'bg-cian text-secondary border border-borde'
                }`}
              >
                {verifyMessage.text}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-xs text-tinta-suave">
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
                  className="w-full px-4 py-3 rounded-xl border border-borde text-tinta font-mono text-center tracking-widest text-xl font-black focus:outline-none focus:ring-2 focus:ring-celeste bg-cian/50"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingCode}
                className="w-full bg-azul hover:bg-azul-hondo text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingCode ? 'Verificando...' : 'Confirmar Código'}
              </button>

              <button
                type="button"
                onClick={handleResendVerificationCode}
                className="w-full text-tinta-suave hover:text-azul text-xs font-bold text-center block pt-1 cursor-pointer"
              >
                ¿No recibiste el código? Reenviar correo
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
