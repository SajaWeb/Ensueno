'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { COLOMBIA_LOCATION_DATA } from '@/data/colombiaData';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Mail,
  Baby,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Sparkles,
  BarChart3,
  Search,
  Truck,
  MapPin,
  Lock,
  LogOut,
  Save,
  Plus,
  ShieldCheck,
  Building2,
  Layers,
  Settings,
  X,
  KeyRound,
  UserCheck,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Filter,
  Pencil,
  Check,
  Tag,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@ensueno.com.co');
  const [loginPassword, setLoginPassword] = useState('AdminEnsueno2026*');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'crm' | 'cohorts' | 'products' | 'shipping' | 'coupons'>('crm');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    babyCohorts?: any;
    surveyResponses?: any[];
    pendingReminders?: any[];
  }>({});

  const [products, setProducts] = useState<any[]>([]);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rateSearchTerm, setRateSearchTerm] = useState('');

  // Password Change Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Shipping Config & Rates State
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 60000,
    defaultRate: 12000,
    qtyDiscountThreshold: 3,
    qtyDiscountAmount: 3000,
  });
  const [shippingRates, setShippingRates] = useState<any[]>([]);

  // Department-wide rate assignment using numeric index
  const [deptFlatIndex, setDeptFlatIndex] = useState(0);
  const [deptFlatRate, setDeptFlatRate] = useState('8000');
  const [deptFlatDays, setDeptFlatDays] = useState('2-3 días hábiles');

  // Single City Rate using numeric index
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [selectedCityName, setSelectedCityName] = useState(COLOMBIA_LOCATION_DATA[0].cities[0]);
  const [singleCityRate, setSingleCityRate] = useState('7000');
  const [singleCityDays, setSingleCityDays] = useState('2-3 días hábiles');

  // Inline editing state
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState('');
  const [editDays, setEditDays] = useState('');

  // Table features state
  const [selectedRateIds, setSelectedRateIds] = useState<Set<string>>(new Set());
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<'department' | 'city' | 'cost'>('department');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Coupon state
  const [promotionsList, setPromotionsList] = useState<any[]>([]);
  const [couponTitle, setCouponTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState('10');
  const [couponDiscountAmount, setCouponDiscountAmount] = useState('');
  const [couponStage, setCouponStage] = useState('Todas');

  useEffect(() => {
    checkAdminAuth();
    loadProductsAndShipping();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await apiService.getAdminRemarketingData();
      if (res.success) {
        setIsAuthenticated(true);
        setData(res.data);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsAndShipping = async () => {
    try {
      const prods = await apiService.getProducts();
      setProducts(prods);

      const configRes = await fetch('/api/v1/shipping/config');
      const configJson = await configRes.json();
      if (configJson.success && configJson.data) setShippingConfig(configJson.data);

      const ratesRes = await fetch('/api/v1/shipping/rates');
      const ratesJson = await ratesRes.json();
      if (ratesJson.success && Array.isArray(ratesJson.data)) {
        setShippingRates(ratesJson.data);
      }

      const promos = await apiService.getPromotions(undefined, true);
      setPromotionsList(promos);
    } catch (err) {
      console.error('Error cargando configuración de envíos:', err);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await apiService.login(loginEmail, loginPassword);
      if (res.success && res.user?.role === 'ADMIN') {
        setIsAuthenticated(true);
        showToast('¡Bienvenido al Panel Administrador Ensueño!', 'success');
        loadProductsAndShipping();
        const remarketingRes = await apiService.getAdminRemarketingData();
        if (remarketingRes.success) setData(remarketingRes.data);
      } else if (res.success && res.user?.role !== 'ADMIN') {
        setLoginError('Tu usuario no tiene permisos de Administrador.');
        showToast('Acceso Denegado: No eres Administrador', 'error');
      } else {
        setLoginError(res.error || 'Credenciales incorrectas');
        showToast(res.error || 'Credenciales incorrectas', 'error');
      }
    } catch (err) {
      setLoginError('Error de inicio de sesión');
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    showToast('Sesión de administración cerrada', 'info');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas nuevas no coinciden', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('¡Contraseña actualizada exitosamente!', 'success');
        setShowSettingsModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(json.error || 'Error al cambiar contraseña', 'error');
      }
    } catch (err) {
      showToast('Error en el servidor al cambiar contraseña', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveShippingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/shipping/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingConfig),
      });
      const json = await res.json();
      if (json.success) {
        showToast('¡Reglas globales de envío guardadas con éxito!', 'success');
      }
    } catch (err) {
      showToast('Error al guardar reglas de envío', 'error');
    }
  };

  const handleApplyDepartmentFlatRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = COLOMBIA_LOCATION_DATA[deptFlatIndex];
    if (!deptObj || !deptObj.cities || !deptFlatRate) {
      showToast('Por favor selecciona un departamento e ingresa una tarifa válida', 'error');
      return;
    }

    const rateVal = parseFloat(String(deptFlatRate).replace(/[^0-9]/g, ''));
    if (isNaN(rateVal) || rateVal < 0) {
      showToast('Ingresa un valor numérico válido para la tarifa', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v1/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: deptObj.name,
          cities: deptObj.cities,
          cost: rateVal,
          estimatedDays: deptFlatDays || '2-3 días hábiles',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`¡Tarifa de $${rateVal.toLocaleString('es-CO')} aplicada a ${deptObj.cities.length} municipios de ${deptObj.name}!`, 'success');
        loadProductsAndShipping();
      } else {
        showToast(json.error || 'Error al aplicar tarifa por departamento', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al aplicar tarifa por departamento', 'error');
    }
  };

  const handleAddSingleCityRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = COLOMBIA_LOCATION_DATA[selectedDeptIndex];
    if (!deptObj || !selectedCityName || !singleCityRate) {
      showToast('Por favor selecciona departamento, municipio y costo de envío', 'error');
      return;
    }

    const rateVal = parseFloat(String(singleCityRate).replace(/[^0-9]/g, ''));
    if (isNaN(rateVal) || rateVal < 0) {
      showToast('El costo de envío debe ser un valor numérico válido', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v1/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: deptObj.name,
          city: selectedCityName,
          cost: rateVal,
          estimatedDays: singleCityDays,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Tarifa de $${rateVal.toLocaleString('es-CO')} para ${selectedCityName} (${deptObj.name}) guardada con éxito.`, 'success');
        loadProductsAndShipping();
      } else {
        showToast(json.error || 'Error al guardar tarifa de envío', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al guardar tarifa de ciudad', 'error');
    }
  };

  const handleDeleteRate = async (rateId: string, cityName: string) => {
    try {
      const res = await fetch(`/api/v1/shipping/rates?id=${rateId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Tarifa de ${cityName} eliminada con éxito`, 'info');
        setSelectedRateIds((prev) => { const next = new Set(prev); next.delete(rateId); return next; });
        loadProductsAndShipping();
      }
    } catch (err) {
      showToast('Error al eliminar tarifa', 'error');
    }
  };

  const handleInlineEditSave = async (rate: any) => {
    const costVal = parseFloat(String(editCost).replace(/[^0-9]/g, ''));
    if (isNaN(costVal) || costVal < 0) {
      showToast('El costo debe ser un número válido', 'error');
      return;
    }
    try {
      const res = await fetch('/api/v1/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: rate.department,
          city: rate.city,
          cost: costVal,
          estimatedDays: editDays || '2-3 días hábiles',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Tarifa de ${rate.city} actualizada a $${costVal.toLocaleString('es-CO')} COP`, 'success');
        setEditingRateId(null);
        loadProductsAndShipping();
      } else {
        showToast(json.error || 'Error al actualizar tarifa', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al actualizar tarifa', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRateIds.size === 0) return;
    const count = selectedRateIds.size;
    let deleted = 0;
    for (const id of selectedRateIds) {
      try {
        const res = await fetch(`/api/v1/shipping/rates?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) deleted++;
      } catch (err) { /* skip */ }
    }
    setSelectedRateIds(new Set());
    showToast(`${deleted} de ${count} tarifas eliminadas correctamente`, deleted > 0 ? 'success' : 'error');
    loadProductsAndShipping();
  };

  const toggleRateSelection = (id: string) => {
    setSelectedRateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleSort = (col: 'department' | 'city' | 'cost') => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleUpdateProductImage = async (productId: string) => {
    if (!newImageUrl) return;
    try {
      const res = await apiService.updateProductImage(productId, newImageUrl);
      if (res.success) {
        showToast('URL de imagen de producto actualizada correctamente.', 'success');
        setEditingImageId(null);
        setNewImageUrl('');
        loadProductsAndShipping();
      } else {
        showToast(res.error || 'Error al actualizar imagen', 'error');
      }
    } catch (err: any) {
      showToast('Error en el servidor al actualizar imagen', 'error');
    }
  };

  const handleSendReminder = async (email: string, name: string, babyName: string, productTitle: string) => {
    try {
      const res = await apiService.sendRemarketingReminder(email, name, babyName, productTitle);
      if (res.success) {
        showToast(`Recordatorio de remarketing enviado a ${email}`, 'success');
      } else {
        showToast(`Error al enviar correo: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast('Error enviando recordatorio', 'error');
    }
  };

  // Unique departments from loaded rates for the filter dropdown
  const uniqueDepartments = Array.from(new Set(shippingRates.map((r) => r.department).filter(Boolean))).sort();

  // Filter by department, then by search text, then sort
  const filteredRates = shippingRates
    .filter((r) => deptFilter === 'all' || r.department === deptFilter)
    .filter(
      (r) =>
        !rateSearchTerm ||
        r.department?.toLowerCase().includes(rateSearchTerm.toLowerCase()) ||
        r.city?.toLowerCase().includes(rateSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortColumn === 'cost') return (a.cost - b.cost) * dir;
      const valA = (a[sortColumn] || '').toLowerCase();
      const valB = (b[sortColumn] || '').toLowerCase();
      return valA.localeCompare(valB) * dir;
    });

  const allFilteredSelected = filteredRates.length > 0 && filteredRates.every((r) => selectedRateIds.has(r.id));

  // Login exclusivo de Administrador en Tonos Pastel Ensueño
  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 py-16 px-4 flex items-center justify-center relative overflow-hidden">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-pink-100 rounded-3xl p-8 shadow-xl space-y-6 relative z-10">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-white">
              <ShieldCheck className="w-9 h-9 text-purple-700" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold uppercase tracking-widest border border-pink-200">
              Acceso Administrador Ensueño
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Portal Ensueño Admin</h1>
            <p className="text-xs text-slate-500">
              Ingresa tus credenciales autorizadas para gestionar envíos, catálogo de productos y remarketing.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Correo Electrónico Administrador
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Contraseña de Seguridad
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-pink-200 transition-all text-xs tracking-wider uppercase"
            >
              Ingresar al Dashboard Admin
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setLoginEmail('admin@ensueno.com.co');
                setLoginPassword('AdminEnsueno2026*');
                showToast('Credenciales maestras autocompletadas', 'info');
              }}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              Cargar Credenciales Maestras por Defecto
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading || isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-50 py-20 text-center text-slate-500 text-sm">Cargando Dashboard Admin Ensueño...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar Exclusivo de Administración en Tonos Pastel Ensueño */}
      <header className="bg-white/95 border-b border-purple-100 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-700 rounded-2xl flex items-center justify-center font-bold shadow-sm border border-white">
              <Baby className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-800 block leading-tight">Panel Administrador</span>
              <span className="text-[11px] text-purple-600 font-semibold">Ensueño Baby Cosmetics</span>
            </div>
          </div>

          {/* Opciones de Usuario Administrador (Superior Derecha) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-full text-xs">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">admin@ensueno.com.co</span>
                <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">ADMIN MAESTRO</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Settings className="w-4 h-4 text-purple-500" /> Configurar Cuenta
            </button>

            <button
              onClick={handleLogout}
              className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header Hero Banner Pastel */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-sky-100 rounded-3xl p-8 border border-purple-200/60 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3 border border-purple-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" /> Control de Envíos y Remarketing
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Ensueño Baby</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Gestión simplificada de envíos por departamentos de Colombia, umbrales gratis, catálogo de productos y remarketing CRM.
              </p>
            </div>
          </div>

          {/* Tarjetas KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-purple-200/50">
            <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
              <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                <span>Umbral Envío Gratis</span>
                <Truck className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">
                ${shippingConfig.freeShippingThreshold?.toLocaleString('es-CO')} COP
              </p>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
              <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                <span>Total Bebés Registrados</span>
                <Baby className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">{data.babyCohorts?.totalBabies || 12}</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                <span>Recién Nacidos (0-3m)</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">{data.babyCohorts?.summary?.recienNacido || 5}</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                <span>Productos Estrella</span>
                <ShoppingBag className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">{products.length || 6}</p>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Dashboard */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'crm' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Clientes y Remarketing CRM
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'shipping' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" /> Tarifas de Envío y Municipios ({shippingRates.length})
          </button>

          <button
            onClick={() => setActiveTab('cohorts')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'cohorts' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Cohortes por Edad
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'products' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> URLs de Imágenes Productos
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'coupons' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" /> Cupones de Descuento ({promotionsList.length})
          </button>
        </div>

        {/* Tab 1: CRM Clientes */}
        {activeTab === 'crm' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Base de Datos Mamás y Bebés</h2>
                <p className="text-xs text-slate-500 mt-1">Contacto directo de remarketing según la etapa del bebé.</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar mamá o bebé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-64 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                    <th className="py-3 px-4">Mamá (Cliente)</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Bebé & Etapa</th>
                    <th className="py-3 px-4">Sensibilidad Piel</th>
                    <th className="py-3 px-4 text-right">Acción Remarketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      María Alejandra Morales
                      <div className="text-[11px] font-normal text-slate-500">Bogotá, Cundinamarca</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Mail className="w-3.5 h-3.5 text-purple-600" /> maria.alejandra@example.com
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">+57 310 456 7890</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        <Baby className="w-3.5 h-3.5" /> Sofía (6 Meses)
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">Piel Sensible / Atópica</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() =>
                          handleSendReminder(
                            'maria.alejandra@example.com',
                            'María Alejandra',
                            'Sofía',
                            'Cremas Corporales Ensueño'
                          )
                        }
                        className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Recordatorio Recompra
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Envíos */}
        {activeTab === 'shipping' && (
          <div className="space-y-8">
            {/* Asignación por Departamento Completo usando índice numérico */}
            <div className="bg-gradient-to-r from-sky-100 via-purple-100 to-pink-100 rounded-3xl p-6 text-slate-800 border border-purple-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-700" />
                <h2 className="text-lg font-extrabold text-slate-800">Asignación Rápida por Departamento Completo</h2>
              </div>
              <p className="text-xs text-slate-600">
                Selecciona un departamento de Colombia e ingresa la tarifa plana para aplicarla con un solo clic a todos sus municipios.
              </p>

              <form onSubmit={handleApplyDepartmentFlatRate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Departamento</label>
                  <select
                    value={deptFlatIndex}
                    onChange={(e) => setDeptFlatIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {COLOMBIA_LOCATION_DATA.map((d, index) => (
                      <option key={d.name} value={index}>
                        {d.name} ({d.cities.length} municipios)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tarifa Envío (COP)</label>
                  <input
                    type="number"
                    required
                    value={deptFlatRate}
                    onChange={(e) => setDeptFlatRate(e.target.value)}
                    placeholder="Ej: 8000"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tiempo Estimado</label>
                  <select
                    value={deptFlatDays}
                    onChange={(e) => setDeptFlatDays(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="1-2 días hábiles">1-2 días hábiles</option>
                    <option value="2-3 días hábiles">2-3 días hábiles</option>
                    <option value="3-5 días hábiles">3-5 días hábiles</option>
                    <option value="5-7 días hábiles">5-7 días hábiles</option>
                    <option value="7-10 días hábiles">7-10 días hábiles</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide"
                  >
                    <Layers className="w-4 h-4" /> Aplicar a Departamento
                  </button>
                </div>
              </form>
            </div>

            {/* Selector por Municipio Específico */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" /> Tarifas Configuradas por Municipio ({shippingRates.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Guarda o modifica el valor del envío para cualquier municipio de Colombia.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Department filter */}
                  <div className="relative">
                    <select
                      value={deptFilter}
                      onChange={(e) => { setDeptFilter(e.target.value); setSelectedRateIds(new Set()); }}
                      className="pl-7 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs w-44 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none"
                    >
                      <option value="all">Todos los departamentos</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                  </div>
                  {/* Text search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar ciudad..."
                      value={rateSearchTerm}
                      onChange={(e) => setRateSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    onClick={loadProductsAndShipping}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Recargar Tarifas"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bulk delete bar */}
              {selectedRateIds.size > 0 && (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                  <span className="text-xs font-bold text-rose-700">
                    {selectedRateIds.size} tarifa{selectedRateIds.size > 1 ? 's' : ''} seleccionada{selectedRateIds.size > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRateIds(new Set())}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      Deseleccionar
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar Seleccionadas
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddSingleCityRate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">1. Departamento</label>
                  <select
                    value={selectedDeptIndex}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setSelectedDeptIndex(idx);
                      setSelectedCityName(COLOMBIA_LOCATION_DATA[idx].cities[0]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    {COLOMBIA_LOCATION_DATA.map((d, index) => (
                      <option key={d.name} value={index}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">2. Municipio / Ciudad</label>
                  <select
                    value={selectedCityName}
                    onChange={(e) => setSelectedCityName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    {COLOMBIA_LOCATION_DATA[selectedDeptIndex].cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">3. Costo Envío (COP)</label>
                  <input
                    type="number"
                    required
                    value={singleCityRate}
                    onChange={(e) => setSingleCityRate(e.target.value)}
                    placeholder="Ej: 7000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">4. Tiempo Estimado</label>
                  <select
                    value={singleCityDays}
                    onChange={(e) => setSingleCityDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="1-2 días hábiles">1-2 días hábiles</option>
                    <option value="2-3 días hábiles">2-3 días hábiles</option>
                    <option value="3-5 días hábiles">3-5 días hábiles</option>
                    <option value="5-7 días hábiles">5-7 días hábiles</option>
                    <option value="7-10 días hábiles">7-10 días hábiles</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Guardar
                  </button>
                </div>
              </form>

              {/* Tabla de Tarifas Registradas */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                      <th className="py-3 px-3 w-10">
                        <button
                          onClick={() => {
                            if (allFilteredSelected) {
                              setSelectedRateIds(new Set());
                            } else {
                              setSelectedRateIds(new Set(filteredRates.map((r) => r.id)));
                            }
                          }}
                          className="text-purple-500 hover:text-purple-700 transition-colors"
                          title={allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        >
                          {allFilteredSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">
                        <button onClick={() => handleToggleSort('department')} className="flex items-center gap-1 hover:text-purple-700 transition-colors">
                          Departamento
                          {sortColumn === 'department' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">
                        <button onClick={() => handleToggleSort('city')} className="flex items-center gap-1 hover:text-purple-700 transition-colors">
                          Municipio / Ciudad
                          {sortColumn === 'city' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">
                        <button onClick={() => handleToggleSort('cost')} className="flex items-center gap-1 hover:text-purple-700 transition-colors">
                          Costo de Envío
                          {sortColumn === 'cost' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                        </button>
                      </th>
                      <th className="py-3 px-4">Tiempo Estimado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                          No hay tarifas específicas cargadas. Agrega una arriba o haz clic en &quot;Aplicar a Todo el Departamento&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredRates.map((rate) => (
                        <tr
                          key={rate.id}
                          className={`transition-colors ${
                            selectedRateIds.has(rate.id) ? 'bg-purple-50/70' : editingRateId === rate.id ? 'bg-amber-50/60' : 'hover:bg-purple-50/40'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <button
                              onClick={() => toggleRateSelection(rate.id)}
                              className="text-purple-500 hover:text-purple-700 transition-colors"
                            >
                              {selectedRateIds.has(rate.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">{rate.department}</td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">{rate.city}</td>
                          <td className="py-2 px-4">
                            {editingRateId === rate.id ? (
                              <input
                                type="number"
                                value={editCost}
                                onChange={(e) => setEditCost(e.target.value)}
                                className="w-24 px-2 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                autoFocus
                              />
                            ) : (
                              <span className="font-black text-emerald-600">${rate.cost?.toLocaleString('es-CO')} COP</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {editingRateId === rate.id ? (
                              <select
                                value={editDays}
                                onChange={(e) => setEditDays(e.target.value)}
                                className="w-36 px-2 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              >
                                <option value="1-2 días hábiles">1-2 días hábiles</option>
                                <option value="2-3 días hábiles">2-3 días hábiles</option>
                                <option value="3-5 días hábiles">3-5 días hábiles</option>
                                <option value="5-7 días hábiles">5-7 días hábiles</option>
                                <option value="7-10 días hábiles">7-10 días hábiles</option>
                              </select>
                            ) : (
                              <span className="text-slate-500">{rate.estimatedDays}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {editingRateId === rate.id ? (
                                <>
                                  <button
                                    onClick={() => handleInlineEditSave(rate)}
                                    className="text-emerald-500 hover:text-emerald-700 p-1 transition-colors"
                                    title="Guardar cambios"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingRateId(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                                    title="Cancelar edición"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingRateId(rate.id);
                                      setEditCost(String(rate.cost || 0));
                                      setEditDays(rate.estimatedDays || '2-3 días hábiles');
                                    }}
                                    className="text-amber-500 hover:text-amber-700 p-1 transition-colors"
                                    title="Editar tarifa"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRate(rate.id, rate.city)}
                                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                    title="Eliminar tarifa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary footer */}
              {filteredRates.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Mostrando {filteredRates.length} de {shippingRates.length} tarifas{deptFilter !== 'all' ? ` en ${deptFilter}` : ''}</span>
                  <span>Ordenado por {sortColumn === 'department' ? 'Departamento' : sortColumn === 'city' ? 'Ciudad' : 'Costo'} ({sortDirection === 'asc' ? 'A→Z' : 'Z→A'})</span>
                </div>
              )}
            </div>

            {/* Reglas Globales */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" /> Umbral para Envío Gratis y Descuentos
              </h2>

              <form onSubmit={handleSaveShippingConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Monto Pedido para Envío Gratis (COP)
                  </label>
                  <input
                    type="number"
                    value={shippingConfig.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingConfig({ ...shippingConfig, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Tarifa Base Nacional Estándar (COP)
                  </label>
                  <input
                    type="number"
                    value={shippingConfig.defaultRate}
                    onChange={(e) =>
                      setShippingConfig({ ...shippingConfig, defaultRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Mínimo Productos Descuento Cantidad
                  </label>
                  <input
                    type="number"
                    value={shippingConfig.qtyDiscountThreshold}
                    onChange={(e) =>
                      setShippingConfig({ ...shippingConfig, qtyDiscountThreshold: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Descuento Envío por Cantidad (COP)
                  </label>
                  <input
                    type="number"
                    value={shippingConfig.qtyDiscountAmount}
                    onChange={(e) =>
                      setShippingConfig({ ...shippingConfig, qtyDiscountAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Guardar Reglas Globales
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Cohortes por Edad */}
        {activeTab === 'cohorts' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Distribución de Bebés por Etapa de Crecimiento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-pink-50 border border-pink-200">
                <h3 className="font-bold text-pink-900 text-sm">Recién Nacidos (0 - 3m)</h3>
                <p className="text-xs text-pink-700 mt-2">
                  Recomendación: Pañitos Húmedos sin alcohol + Jabón Líquido Sin Lágrimas.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-bold text-amber-900 text-sm">Lactantes (3 - 12m)</h3>
                <p className="text-xs text-amber-700 mt-2">
                  Recomendación: Bálsamo de Sueño Reparador + Colonia Ensueño.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200">
                <h3 className="font-bold text-sky-900 text-sm">Prenatal / Embarazo</h3>
                <p className="text-xs text-sky-700 mt-2">
                  Recomendación: Kit Completo Sueño Dorado con Neceser de regalo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Productos */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Catálogo de 6 Productos Estrella</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
                  <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" />
                  <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                  <p className="text-xs text-purple-600 font-extrabold">${product.price?.toLocaleString('es-CO')} COP</p>

                  {editingImageId === product.id ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Nueva URL de imagen..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                      <button
                        onClick={() => handleUpdateProductImage(product.id)}
                        className="w-full bg-purple-600 text-white text-xs font-semibold py-1.5 rounded-lg shadow-sm"
                      >
                        Guardar URL
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingImageId(product.id);
                        setNewImageUrl(product.image);
                      }}
                      className="w-full border border-purple-200 text-purple-700 text-xs font-bold py-1.5 rounded-lg hover:bg-purple-50"
                    >
                      Editar URL de Imagen
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Configuración de Cuenta */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 max-w-md w-full rounded-3xl p-6 text-slate-800 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg text-slate-800">Cambiar Contraseña Admin</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
                >
                  {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
