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
  ChevronLeft,
  ChevronRight,
  Star,
  Gift,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'crm' | 'cohorts' | 'products' | 'shipping' | 'coupons'>('orders');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    babyCohorts?: any;
    surveyResponses?: any[];
    pendingReminders?: any[];
    customers?: any[];
  }>({});

  const [products, setProducts] = useState<any[]>([]);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Full Product Management Modal & Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productFilter, setProductFilter] = useState<'all' | 'featured' | 'promo'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    category: 'sueno',
    price: '28500',
    originalPrice: '',
    isPromo: false,
    badge: '',
    description: '',
    safetyInfo: 'Dermatológicamente testeado • Libre de Alcohol • Hipoalergénico',
    pediatricGuarantee: 'Aprobado por la Asociación Colombiana de Pediatría',
    sizes: '150ml, 250ml',
    fragrances: 'Flores Silvestres & Lavanda, Manzanilla Dulce',
    benefits: 'Induce sueño profundo, Calma irritaciones, Suavidad 24h',
    ingredients: 'Aceite esencial de Lavanda, Extracto de Manzanilla, Avena',
    image: '',
    additionalImages: '',
    isFeatured: true,
    inStock: true,
  });

  // Promotions & Combos Management State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [adminProductSubTab, setAdminProductSubTab] = useState<'catalog' | 'promotions'>('catalog');
  const [promoForm, setPromoForm] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    badge: 'OFERTA ESTRELLA ⭐',
    badgeColor: 'secondary',
    price: '',
    originalPrice: '',
    savingText: '',
    imageUrl: '',
    videoUrl: '',
    productId: '',
    code: '',
    discountPercent: '',
    targetBabyStage: '',
    isActive: true,
    sortOrder: '0',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [rateSearchTerm, setRateSearchTerm] = useState('');

  // Orders & Accounting Module State
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [orderMetrics, setOrderMetrics] = useState<any>({});
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Orders Pagination State
  const [ordersPerPage, setOrdersPerPage] = useState<number | 'all'>(10);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);

  // Mobile Menu Drawer & Sidebar Collapse State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'crm' || activeTab === 'cohorts')) {
      loadRemarketingData();
    }
  }, [activeTab, isAuthenticated]);

  const loadRemarketingData = async () => {
    try {
      const res = await apiService.getAdminRemarketingData();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error cargando datos de remarketing:', err);
    }
  };

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

      await loadAdminOrders();
    } catch (err) {
      console.error('Error cargando configuración de envíos:', err);
    }
  };

  const loadAdminOrders = async (status = orderStatusFilter, search = orderSearchTerm) => {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      const res = await fetch(`/api/v1/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAdminOrders(json.data || []);
        if (json.metrics) setOrderMetrics(json.metrics);
      }
    } catch (err) {
      console.error('Error cargando órdenes para admin:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/v1/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Estado de la orden actualizado a "${newStatus.replace(/_/g, ' ')}"`, 'success');
        loadAdminOrders();
      } else {
        showToast(json.error || 'Error al actualizar pedido', 'error');
      }
    } catch (err) {
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setUpdatingOrderId(null);
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

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      subtitle: '',
      category: 'sueno',
      price: '28500',
      originalPrice: '',
      isPromo: false,
      badge: 'NUEVO',
      description: 'Fórmula delicada enriquecida con extractos naturales para el cuidado diario de tu bebé.',
      safetyInfo: 'Dermatológicamente testeado • Libre de Alcohol • Hipoalergénico',
      pediatricGuarantee: 'Aprobado por la Asociación Colombiana de Pediatría',
      sizes: '150ml, 250ml',
      fragrances: 'Flores Silvestres & Lavanda, Manzanilla Dulce',
      benefits: 'Induce sueño profundo, Calma irritaciones, Suavidad prolongada',
      ingredients: 'Aceite esencial de Lavanda, Extracto de Manzanilla, Avena coloidal',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      additionalImages: '',
      isFeatured: true,
      inStock: true,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      subtitle: product.subtitle || '',
      category: product.category || 'sueno',
      price: product.price ? String(product.price) : '0',
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      isPromo: Boolean(product.originalPrice && product.originalPrice > product.price),
      badge: product.badge || '',
      description: product.description || '',
      safetyInfo: product.safetyInfo || 'Dermatológicamente testeado',
      pediatricGuarantee: product.pediatricGuarantee || 'Aprobado por la Asociación Colombiana de Pediatría',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      fragrances: Array.isArray(product.fragrances) ? product.fragrances.join(', ') : product.fragrances || '',
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : product.benefits || '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || '',
      image: product.image || '',
      additionalImages: Array.isArray(product.additionalImages) ? product.additionalImages.join(', ') : product.additionalImages || '',
      isFeatured: product.isFeatured !== false,
      inStock: product.inStock !== false,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.image) {
      showToast('Por favor completa el Nombre, Precio e Imagen principal.', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload: any = {
        name: productForm.name,
        subtitle: productForm.subtitle,
        category: productForm.category,
        price: parseFloat(productForm.price),
        originalPrice: productForm.isPromo && productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        badge: productForm.badge || null,
        description: productForm.description,
        safetyInfo: productForm.safetyInfo,
        pediatricGuarantee: productForm.pediatricGuarantee,
        sizes: productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        fragrances: productForm.fragrances.split(',').map((s) => s.trim()).filter(Boolean),
        benefits: productForm.benefits.split(',').map((s) => s.trim()).filter(Boolean),
        ingredients: productForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        image: productForm.image,
        additionalImages: productForm.additionalImages.split(',').map((s) => s.trim()).filter(Boolean),
        isFeatured: productForm.isFeatured,
        inStock: productForm.inStock,
      };

      let res;
      if (editingProduct) {
        res = await apiService.updateProduct(editingProduct.id, payload);
      } else {
        res = await apiService.createProduct(payload);
      }

      if (res.success) {
        showToast(
          editingProduct
            ? 'Producto actualizado correctamente en el catálogo y página principal ✨'
            : '¡Nuevo producto creado y publicado exitosamente! 🛍️',
          'success'
        );
        setShowProductModal(false);
        setEditingProduct(null);
        loadProductsAndShipping();
      } else {
        showToast(res.error || 'Error al guardar producto', 'error');
      }
    } catch (err: any) {
      showToast('Error en el servidor al guardar el producto', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleToggleFeaturedProduct = async (product: any) => {
    try {
      const newFeaturedState = !product.isFeatured;
      const res = await apiService.updateProduct(product.id, { isFeatured: newFeaturedState });
      if (res.success) {
        showToast(
          newFeaturedState
            ? `⭐ "${product.name}" agregado a los esenciales de la página principal`
            : `"${product.name}" retirado de la página principal`,
          'info'
        );
        loadProductsAndShipping();
      }
    } catch (err) {
      showToast('Error al actualizar visibilidad en página principal', 'error');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}" del catálogo?`)) return;

    try {
      const res = await apiService.deleteProduct(productId);
      if (res.success) {
        showToast(`Producto "${productName}" eliminado del sistema`, 'info');
        loadProductsAndShipping();
      } else {
        showToast(res.error || 'Error al eliminar producto', 'error');
      }
    } catch (err) {
      showToast('Error en el servidor al eliminar producto', 'error');
    }
  };

  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoForm({
      title: '',
      subtitle: 'Descripción detallada de la oferta especial...',
      tagline: 'Combo Especial',
      badge: 'OFERTA ESTRELLA ⭐',
      badgeColor: 'secondary',
      price: '37800',
      originalPrice: '56700',
      savingText: 'Ahorras $18.900 COP',
      imageUrl: 'https://i.postimg.cc/dV03DDbN/Whats-App-Image-2026-07-24-at-10-08-29-AM-(3).jpg',
      videoUrl: '',
      productId: products[0]?.id || '',
      code: '',
      discountPercent: '',
      targetBabyStage: '',
      isActive: true,
      sortOrder: '0',
    });
    setShowPromoModal(true);
  };

  const handleOpenEditPromo = (promo: any) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title || '',
      subtitle: promo.subtitle || '',
      tagline: promo.tagline || '',
      badge: promo.badge || '',
      badgeColor: promo.badgeColor || 'secondary',
      price: promo.price ? String(promo.price) : '',
      originalPrice: promo.originalPrice ? String(promo.originalPrice) : '',
      savingText: promo.savingText || '',
      imageUrl: promo.imageUrl || '',
      videoUrl: promo.videoUrl || '',
      productId: promo.productId || '',
      code: promo.code || '',
      discountPercent: promo.discountPercent ? String(promo.discountPercent) : '',
      targetBabyStage: promo.targetBabyStage || '',
      isActive: promo.isActive !== false,
      sortOrder: promo.sortOrder ? String(promo.sortOrder) : '0',
    });
    setShowPromoModal(true);
  };

  const handleSavePromo = async () => {
    if (!promoForm.title) {
      showToast('Por favor ingresa un título para la promoción o combo.', 'error');
      return;
    }

    setIsSavingPromo(true);
    try {
      const payload: any = {
        title: promoForm.title,
        subtitle: promoForm.subtitle,
        tagline: promoForm.tagline,
        badge: promoForm.badge,
        badgeColor: promoForm.badgeColor,
        price: promoForm.price ? parseFloat(promoForm.price) : null,
        originalPrice: promoForm.originalPrice ? parseFloat(promoForm.originalPrice) : null,
        savingText: promoForm.savingText,
        imageUrl: promoForm.imageUrl,
        videoUrl: promoForm.videoUrl,
        productId: promoForm.productId || null,
        code: promoForm.code ? promoForm.code.trim().toUpperCase() : null,
        discountPercent: promoForm.discountPercent ? parseFloat(promoForm.discountPercent) : null,
        targetBabyStage: promoForm.targetBabyStage || null,
        isActive: promoForm.isActive,
        sortOrder: promoForm.sortOrder ? parseInt(promoForm.sortOrder) : 0,
      };

      let res;
      if (editingPromo) {
        res = await apiService.updatePromotion(editingPromo.id, payload);
      } else {
        res = await apiService.createPromotion(payload);
      }

      if (res.success) {
        showToast(
          editingPromo
            ? 'Promoción/Combo actualizado correctamente en la página principal ✨'
            : '¡Nueva promoción creada y publicada en la página principal! 🎁',
          'success'
        );
        setShowPromoModal(false);
        setEditingPromo(null);
        loadProductsAndShipping();
      } else {
        showToast(res.error || 'Error al guardar promoción', 'error');
      }
    } catch (err: any) {
      showToast('Error en el servidor al guardar la promoción', 'error');
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo: any) => {
    try {
      const res = await apiService.updatePromotion(promo.id, { isActive: !promo.isActive });
      if (res.success) {
        showToast(
          !promo.isActive
            ? `🎁 Promoción "${promo.title}" activada`
            : `Promoción "${promo.title}" desactivada`,
          'info'
        );
        loadProductsAndShipping();
      }
    } catch (err) {
      showToast('Error al cambiar estado de la promoción', 'error');
    }
  };

  const handleDeletePromo = async (promoId: string, promoTitle: string) => {
    if (!confirm(`¿Estás seguro de eliminar la promoción "${promoTitle}"?`)) return;

    try {
      const res = await apiService.deletePromotion(promoId);
      if (res.success) {
        showToast(`Promoción "${promoTitle}" eliminada`, 'info');
        loadProductsAndShipping();
      } else {
        showToast(res.error || 'Error al eliminar promoción', 'error');
      }
    } catch (err) {
      showToast('Error al eliminar promoción', 'error');
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


        </div>
      </main>
    );
  }

  if (loading || isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-50 py-20 text-center text-slate-500 text-sm">Cargando Dashboard Admin Ensueño...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      {/* Left Sidebar Navigation (Desktop Collapsible & Mobile Drawer) */}
      <aside
        className={`w-full bg-white/95 border-b md:border-b-0 md:border-r border-purple-100/80 backdrop-blur-md shrink-0 flex flex-col justify-between z-30 shadow-sm md:min-h-screen sticky top-0 md:h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
        }`}
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Brand Logo & Mobile/Collapse Toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-700 rounded-2xl flex items-center justify-center font-bold shadow-sm border border-white shrink-0">
                <Baby className="w-5 h-5 text-purple-700" />
              </div>
              {!isSidebarCollapsed && (
                <div className="hidden md:block overflow-hidden transition-all duration-300">
                  <span className="font-extrabold text-base text-slate-800 block leading-tight truncate">
                    Panel Admin
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold truncate">Ensueño Baby</span>
                </div>
              )}
              <div className="md:hidden">
                <span className="font-extrabold text-base text-slate-800 block leading-tight">Panel Admin</span>
                <span className="text-[11px] text-purple-600 font-semibold">Ensueño Baby</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
                className="hidden md:flex p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all shadow-2xs"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`space-y-1.5 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-3 mb-2 transition-all duration-300">
                Módulos de Gestión
              </span>
            )}

            {/* Item 1: Orders */}
            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileMenuOpen(false);
                loadAdminOrders();
              }}
              title="Control de Pedidos y Contabilidad"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5 relative">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                {isSidebarCollapsed && (orderMetrics.confirmedCount ?? adminOrders.filter((o) => o.status === 'confirmado').length) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-white shadow-2xs">
                    {orderMetrics.confirmedCount ?? adminOrders.filter((o) => o.status === 'confirmado').length}
                  </span>
                )}
                {!isSidebarCollapsed && <span className="truncate">Control de Pedidos</span>}
              </div>
              {!isSidebarCollapsed && (
                <span
                  title="Órdenes con Pago Aprobado pendientes por empacar y enviar"
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {orderMetrics.confirmedCount ?? adminOrders.filter((o) => o.status === 'confirmado').length}
                </span>
              )}
            </button>

            {/* Item 2: CRM */}
            <button
              onClick={() => {
                setActiveTab('crm');
                setIsMobileMenuOpen(false);
              }}
              title="Clientes & Remarketing CRM"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'crm'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Clientes & CRM</span>}
              </div>
            </button>

            {/* Item 3: Shipping */}
            <button
              onClick={() => {
                setActiveTab('shipping');
                setIsMobileMenuOpen(false);
              }}
              title="Tarifas de Envío y Municipios"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'shipping'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Tarifas de Envío</span>}
              </div>
              {!isSidebarCollapsed && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    activeTab === 'shipping' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {shippingRates.length}
                </span>
              )}
            </button>

            {/* Item 4: Cohorts */}
            <button
              onClick={() => {
                setActiveTab('cohorts');
                setIsMobileMenuOpen(false);
              }}
              title="Cohortes por Edad del Bebé"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'cohorts'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Cohortes por Edad</span>}
              </div>
            </button>

            {/* Item 5: Products */}
            <button
              onClick={() => {
                setActiveTab('products');
                setIsMobileMenuOpen(false);
              }}
              title="Galería y URLs de Productos"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Imágenes Productos</span>}
              </div>
            </button>

            {/* Item 6: Coupons */}
            <button
              onClick={() => {
                setActiveTab('coupons');
                setIsMobileMenuOpen(false);
              }}
              title="Cupones y Descuentos Activos"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-3 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'coupons'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Cupones Descuento</span>}
              </div>
              {!isSidebarCollapsed && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    activeTab === 'coupons' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {promotionsList.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className={`p-4 m-4 rounded-2xl bg-purple-50/80 border border-purple-100 space-y-3 hidden md:block transition-all duration-300 ${
          isSidebarCollapsed ? 'p-2 m-2 text-center' : ''
        }`}>
          <div className="flex items-center gap-2.5 justify-center md:justify-start">
            <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-slate-800 block text-xs truncate">admin@ensueno.com.co</span>
                <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">ADMIN MAESTRO</span>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-2 pt-1 border-t border-purple-100 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Ajustes de Cuenta"
              className="flex-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs w-full"
            >
              <Settings className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Ajustes</span>}
            </button>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold py-1.5 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs w-full"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Salir</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Header Hero Banner (Dinamico segun el modulo activo) */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-sky-100 rounded-3xl p-6 sm:p-8 border border-purple-200/60 shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3 border border-purple-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {activeTab === 'orders'
                  ? 'Módulo de Órdenes y Finanzas'
                  : activeTab === 'crm'
                  ? 'Gestión de Mamás y Familias'
                  : activeTab === 'shipping'
                  ? 'Logística & Despachos Colombia'
                  : activeTab === 'cohorts'
                  ? 'Analítica por Etapas de Crecimiento'
                  : activeTab === 'products'
                  ? 'Catálogo Multimedia HD'
                  : 'Estrategia Promocional'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {activeTab === 'orders'
                  ? 'Control de Pedidos y Contabilidad'
                  : activeTab === 'crm'
                  ? 'CRM & Base de Datos Remarketing'
                  : activeTab === 'shipping'
                  ? 'Configuración de Tarifas y Envíos'
                  : activeTab === 'cohorts'
                  ? 'Cohortes por Edad del Bebé'
                  : activeTab === 'products'
                  ? 'Galería y URLs de Productos'
                  : 'Cupones y Descuentos Activos'}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                {activeTab === 'orders'
                  ? 'Monitoreo de ingresos recaudados, aprobación de pasarela MercadoPago y trazabilidad logística de despachos.'
                  : activeTab === 'crm'
                  ? 'Directorio de usuarias registradas, seguimiento de teléfonos de contacto y perfilado de piel del bebé.'
                  : activeTab === 'shipping'
                  ? 'Administración de fletes por departamento, fletes para municipios especiales y reglas de envío gratis.'
                  : activeTab === 'cohorts'
                  ? 'Agrupación automática de bebés según su edad para envíos segmentados de productos y fragancias.'
                  : activeTab === 'products'
                  ? 'Gestión de imágenes de alta resolución, descripciones sensoriales e información técnica del catálogo.'
                  : 'Creación y auditoría de códigos de descuento por porcentaje o monto fijo para campañas de conversión.'}
              </p>
            </div>
          </div>

          {/* Tarjetas KPI Dinámicas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-200/50">
            {activeTab === 'orders' ? (
              <>
                <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                    <span>Recaudado Confirmado</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    ${(orderMetrics.totalRevenue || 0).toLocaleString('es-CO')} COP
                  </p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                    <span>Órdenes Generadas</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{orderMetrics.generatedCount || 0}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                    <span>Pagos Aprobados</span>
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{orderMetrics.confirmedCount || 0}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
                  <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                    <span>En Camino / Entregadas</span>
                    <Truck className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    {(orderMetrics.shippedCount || 0) + (orderMetrics.deliveredCount || 0)}
                  </p>
                </div>
              </>
            ) : activeTab === 'crm' ? (
              (() => {
                const totalMothersCount = data.customers?.length || 0;
                const allBabies = (data.customers || []).flatMap((c: any) => c.babies || c.motherProfile?.babies || []);
                const totalBabiesCount = data.babyCohorts?.totalBabies || allBabies.length;
                const sensitiveBabies = allBabies.filter((b: any) => {
                  const cond = (b.skinCondition || '').toLowerCase();
                  return cond.includes('sensible') || cond.includes('atópica') || cond.includes('atopica');
                });
                const sensitivePercentage = totalBabiesCount > 0 ? Math.round((sensitiveBabies.length / totalBabiesCount) * 100) : 0;
                const pendingRemindersCount = data.pendingReminders?.length || 0;

                return (
                  <>
                    <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
                      <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                        <span>Total Bebés Registrados</span>
                        <Baby className="w-4 h-4 text-sky-500" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{totalBabiesCount}</p>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
                      <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                        <span>Mamás en Comunidad</span>
                        <Users className="w-4 h-4 text-pink-500" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{totalMothersCount}</p>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 shadow-sm">
                      <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                        <span>Piel Sensible / Atópica</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{sensitivePercentage}%</p>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                        <span>Recordatorios Pendientes</span>
                        <Mail className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{pendingRemindersCount}</p>
                    </div>
                  </>
                );
              })()
            ) : activeTab === 'shipping' ? (
              <>
                <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
                  <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                    <span>Umbral Envío Gratis</span>
                    <Truck className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    ${shippingConfig.freeShippingThreshold?.toLocaleString('es-CO')} COP
                  </p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                    <span>Tarifas Configuradas</span>
                    <MapPin className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{shippingRates.length}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
                  <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                    <span>Departamentos Colombia</span>
                    <Building2 className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">32 Coberturas</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                    <span>Tiempo Promedio</span>
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">2-4 Días</p>
                </div>
              </>
            ) : activeTab === 'cohorts' ? (
              <>
                <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
                  <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                    <span>Prenatal / Embarazo</span>
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{data.babyCohorts?.summary?.embarazo || 0}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                    <span>Recién Nacidos (0-3m)</span>
                    <Baby className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{data.babyCohorts?.summary?.recienNacido || 0}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                    <span>Lactantes (3-12m)</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    {(data.babyCohorts?.summary?.lactanteMenor || 0) + (data.babyCohorts?.summary?.lactanteMayor || 0)}
                  </p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
                  <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                    <span>Toddler / Mayores (12m+)</span>
                    <BarChart3 className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{data.babyCohorts?.summary?.toddler || 0}</p>
                </div>
              </>
            ) : activeTab === 'products' ? (
              <>
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                    <span>Productos Activos</span>
                    <ShoppingBag className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{products.length}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
                  <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                    <span>Galería Multimedia HD</span>
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{products.length} HD</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-sky-200 shadow-sm">
                  <div className="flex items-center justify-between text-sky-700 text-xs font-bold">
                    <span>Notas Aromáticas</span>
                    <Sparkles className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">4 Variedades</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                    <span>Estado del Catálogo</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-2">100% En Stock</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/90 rounded-2xl p-4 border border-pink-200 shadow-sm">
                  <div className="flex items-center justify-between text-pink-700 text-xs font-bold">
                    <span>Cupones Creados</span>
                    <Tag className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{promotionsList.length}</p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                    <span>Cupones Activos</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    {promotionsList.filter((p: any) => p.isActive).length}
                  </p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                    <span>Promoción Destacada</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-lg font-black text-amber-700 mt-2 truncate">
                    {promotionsList[0]?.code || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                    <span>Descuento Máximo</span>
                    <Tag className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">25% Off</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab 0: Módulo de Verificación de Pedidos y Contabilidad */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-600" /> Módulo de Verificación de Pedidos y Contabilidad
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control, trazabilidad y cambio de estado de pedidos en tiempo real para la contabilidad del e-commerce.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAdminOrders()}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-purple-200 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar Datos
                </button>
              </div>
            </div>

            {/* Resumen Contable */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-purple-50/60 rounded-2xl p-4 border border-purple-100">
              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Recaudado Confirmado</span>
                <span className="text-lg font-black text-emerald-700">
                  ${(orderMetrics.totalRevenue || 0).toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Órdenes Generadas</span>
                <span className="text-lg font-black text-amber-600">{orderMetrics.generatedCount || 0}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Pagos Aprobados</span>
                <span className="text-lg font-black text-purple-700">{orderMetrics.confirmedCount || 0}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Empacadas / En Camino</span>
                <span className="text-lg font-black text-sky-600">
                  {(orderMetrics.packedCount || 0) + (orderMetrics.shippedCount || 0)}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Entregadas</span>
                <span className="text-lg font-black text-emerald-600">{orderMetrics.deliveredCount || 0}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Sin Entregar / Devolución</span>
                <span className="text-lg font-black text-rose-600">
                  {(orderMetrics.failedDeliveryCount || 0) + (orderMetrics.returnedCount || 0)}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Anuladas</span>
                <span className="text-lg font-black text-slate-500">{orderMetrics.canceledCount || 0}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Registros</span>
                <span className="text-lg font-black text-slate-800">{orderMetrics.totalOrders || 0}</span>
              </div>
            </div>

            {/* Calculos y Controles de Paginación Variable */}
            {(() => {
              const totalOrdersCount = adminOrders.length;
              const effectivePerPage = ordersPerPage === 'all' ? totalOrdersCount : Number(ordersPerPage);
              const totalPages = ordersPerPage === 'all' ? 1 : Math.ceil(totalOrdersCount / (effectivePerPage || 1)) || 1;
              const safeCurrentPage = Math.min(Math.max(1, ordersCurrentPage), totalPages);

              const startIndex = ordersPerPage === 'all' ? 0 : (safeCurrentPage - 1) * effectivePerPage;
              const endIndex = ordersPerPage === 'all' ? totalOrdersCount : startIndex + effectivePerPage;
              const paginatedOrders = adminOrders.slice(startIndex, endIndex);

              return (
                <>
                  {/* Barra de Filtros, Búsqueda y Paginación Variable */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrderStatusFilter(val);
                            setOrdersCurrentPage(1);
                            loadAdminOrders(val, orderSearchTerm);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="all">Ver Todos los Estados ({adminOrders.length})</option>
                          <option value="orden_generada">1. Orden Generada (Pendiente Pago)</option>
                          <option value="confirmado">2. Pago Aprobado</option>
                          <option value="empacada">3. Empacada</option>
                          <option value="en_camino">4. En Camino</option>
                          <option value="sin_poder_entregarse">5. Sin Poder Entregarse</option>
                          <option value="entregada">6. Entregada</option>
                          <option value="devolucion">7. Devolución</option>
                          <option value="anulada">8. Anulada</option>
                        </select>
                      </div>

                      {/* Selector de Paginación Variable */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Mostrar:</span>
                        <select
                          value={ordersPerPage}
                          onChange={(e) => {
                            const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                            setOrdersPerPage(val);
                            setOrdersCurrentPage(1);
                          }}
                          className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-extrabold text-purple-700 focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-2xs"
                        >
                          <option value={5}>5 reg / pág</option>
                          <option value={10}>10 reg / pág</option>
                          <option value={25}>25 reg / pág</option>
                          <option value={50}>50 reg / pág</option>
                          <option value={100}>100 reg / pág</option>
                          <option value="all">Ver Todos ({totalOrdersCount})</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Buscar por Nº orden, cliente o ciudad..."
                        value={orderSearchTerm}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrderSearchTerm(val);
                          setOrdersCurrentPage(1);
                          loadAdminOrders(orderStatusFilter, val);
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Tabla de Órdenes Paginada */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                          <th className="py-3 px-4">Nº Orden & Fecha</th>
                          <th className="py-3 px-4">Cliente / Contacto</th>
                          <th className="py-3 px-4">Destino & Dirección</th>
                          <th className="py-3 px-4">Productos & Total</th>
                          <th className="py-3 px-4">Pasarela MercadoPago</th>
                          <th className="py-3 px-4">Estado Contable / Logístico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                              No se encontraron pedidos registrados con los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          paginatedOrders.map((ord) => {
                            const dateStr = new Date(ord.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });

                            return (
                              <tr key={ord.id} className="hover:bg-purple-50/40 transition-colors">
                                <td className="py-4 px-4 align-top">
                                  <span className="font-extrabold text-purple-700 block font-mono text-sm">
                                    #{ord.orderNumber || ord.id.slice(-6)}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                                </td>

                                <td className="py-4 px-4 align-top">
                                  <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                                  <span className="text-[11px] text-slate-500 block">{ord.customerEmail}</span>
                                  {ord.customerPhone && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Tel: {ord.customerPhone}</span>
                                  )}
                                </td>

                                <td className="py-4 px-4 align-top">
                                  <span className="font-semibold text-slate-800 block line-clamp-2">{ord.shippingAddress}</span>
                                  <span className="text-[11px] text-slate-500 block">
                                    {ord.city}, {ord.department}
                                  </span>
                                </td>

                                <td className="py-4 px-4 align-top">
                                  <div className="space-y-1">
                                    {ord.items?.map((it: any) => (
                                      <div key={it.id} className="text-[11px] text-slate-700">
                                        <strong>{it.quantity}x</strong> {it.productName || it.product?.name}{' '}
                                        <span className="text-slate-400 text-[10px]">
                                          (${it.unitPrice?.toLocaleString('es-CO')})
                                        </span>
                                      </div>
                                    ))}
                                    <div className="pt-1 border-t border-slate-100 font-extrabold text-sm text-purple-700">
                                      Total: ${ord.total?.toLocaleString('es-CO')} COP
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 px-4 align-top">
                                  {ord.paymentStatus === 'approved' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="w-3 h-3" /> Aprobado MP
                                    </span>
                                  ) : ord.paymentStatus === 'rejected' || ord.paymentStatus === 'cancelled' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                      Rechazado MP
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                      Pendiente Pago
                                    </span>
                                  )}
                                  {ord.paymentTransactionId && (
                                    <span className="text-[9px] text-slate-400 block font-mono mt-1">
                                      ID: {ord.paymentTransactionId}
                                    </span>
                                  )}
                                </td>

                                <td className="py-4 px-4 align-top">
                                  <select
                                    value={ord.status}
                                    disabled={updatingOrderId === ord.id}
                                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                      ord.status === 'orden_generada'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : ord.status === 'confirmado'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : ord.status === 'empacada'
                                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                                        : ord.status === 'en_camino'
                                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                                        : ord.status === 'sin_poder_entregarse'
                                        ? 'bg-orange-50 text-orange-800 border-orange-300'
                                        : ord.status === 'entregada'
                                        ? 'bg-teal-50 text-teal-800 border-teal-300'
                                        : ord.status === 'devolucion'
                                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                                        : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    <option value="orden_generada">1. Orden Generada</option>
                                    <option value="confirmado">2. Pago Aprobado</option>
                                    <option value="empacada">3. Empacada</option>
                                    <option value="en_camino">4. En Camino</option>
                                    <option value="sin_poder_entregarse">5. Sin Poder Entregarse</option>
                                    <option value="entregada">6. Entregada</option>
                                    <option value="devolucion">7. Devolución</option>
                                    <option value="anulada">8. Anulada</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pie de Página con Controles de Paginación */}
                  {totalOrdersCount > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">
                        Mostrando{' '}
                        <strong className="text-slate-800 font-bold">
                          {totalOrdersCount === 0 ? 0 : startIndex + 1}
                        </strong>{' '}
                        a{' '}
                        <strong className="text-slate-800 font-bold">
                          {Math.min(endIndex, totalOrdersCount)}
                        </strong>{' '}
                        de <strong className="text-purple-700 font-extrabold">{totalOrdersCount}</strong> órdenes
                      </span>

                      {ordersPerPage !== 'all' && totalPages > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                          <button
                            disabled={safeCurrentPage <= 1}
                            onClick={() => setOrdersCurrentPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Anterior
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setOrdersCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all shrink-0 ${
                                safeCurrentPage === pageNum
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            disabled={safeCurrentPage >= totalPages}
                            onClick={() => setOrdersCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Tab 1: CRM Clientes */}
        {activeTab === 'crm' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" /> Base de Datos Mamás y Bebés ({data.customers?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Clientes y perfiles registrados en la base de datos real con puntos acumulados e historial.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadRemarketingData}
                  title="Actualizar datos de clientes"
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, ciudad o bebé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-64 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                    <th className="py-3 px-4">Mamá (Cliente)</th>
                    <th className="py-3 px-4">Contacto & Ubicación</th>
                    <th className="py-3 px-4">Bebé & Piel</th>
                    <th className="py-3 px-4">Órdenes & Puntos</th>
                    <th className="py-3 px-4 text-right">Acción Remarketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!data.customers || data.customers.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No se encontraron clientes registrados en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    data.customers
                      .filter((c: any) => {
                        if (!searchTerm) return true;
                        const s = searchTerm.toLowerCase();
                        const prof = c.profile || c.motherProfile;
                        const fullName = (c.fullName || prof?.fullName || '').toLowerCase();
                        const email = (c.email || '').toLowerCase();
                        const phone = (c.phone || prof?.phone || '').toLowerCase();
                        const city = (c.city || prof?.city || '').toLowerCase();
                        const babyName = (c.babies?.[0]?.babyName || prof?.babies?.[0]?.babyName || '').toLowerCase();
                        return (
                          fullName.includes(s) ||
                          email.includes(s) ||
                          phone.includes(s) ||
                          city.includes(s) ||
                          babyName.includes(s)
                        );
                      })
                      .map((customer: any) => {
                        const prof = customer.profile || customer.motherProfile;
                        const motherName = customer.fullName || prof?.fullName || customer.email.split('@')[0];
                        const phone = customer.phone || prof?.phone || 'Sin teléfono';
                        const location =
                          [customer.city || prof?.city, customer.department || prof?.department]
                            .filter(Boolean)
                            .join(', ') || 'No especificada';
                        const babies = customer.babies || prof?.babies || [];
                        const baby = babies[0];
                        const babyName = baby?.babyName || 'Bebé';
                        const skin = baby?.skinCondition || 'Normal';
                        const approvedOrders = (customer.orders || []).filter(
                          (o: any) =>
                            o.paymentStatus === 'approved' ||
                            (o.status && o.status !== 'orden_generada' && o.status !== 'anulada')
                        );
                        const approvedCount = approvedOrders.length;
                        const totalSpentApproved = approvedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
                        const loyaltyPointsApproved = Math.floor(totalSpentApproved / 1000);

                        return (
                          <tr key={customer.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="py-4 px-4 align-top font-bold text-slate-800">
                              {motherName}
                              <div className="text-[11px] font-normal text-slate-400">
                                Reg: {new Date(customer.createdAt).toLocaleDateString('es-CO')}
                              </div>
                            </td>

                            <td className="py-4 px-4 align-top text-slate-600">
                              <div className="flex items-center gap-1.5 text-xs font-semibold">
                                <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" /> {customer.email}
                              </div>
                              {phone !== 'Sin teléfono' && (
                                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Tel: {phone}</div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-0.5">{location}</div>
                            </td>

                            <td className="py-4 px-4 align-top">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                                <Baby className="w-3.5 h-3.5" /> {babyName}
                              </span>
                              <span className="text-[11px] font-medium text-slate-600 block mt-1">
                                Piel: <strong className="text-purple-700">{skin}</strong>
                              </span>
                            </td>

                            <td className="py-4 px-4 align-top">
                              <span className="font-extrabold text-slate-800 block text-xs">
                                {approvedCount} orden(es) aprobadas
                              </span>
                              <span className="text-[11px] text-emerald-700 font-bold block">
                                ${totalSpentApproved.toLocaleString('es-CO')} COP
                              </span>
                              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                                ⭐ {loyaltyPointsApproved} pts
                              </span>
                            </td>

                            <td className="py-4 px-4 align-top text-right">
                              <button
                                onClick={() =>
                                  handleSendReminder(
                                    customer.email,
                                    motherName,
                                    babyName,
                                    'Cremas Corporales Ensueño'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                              >
                                <Send className="w-3.5 h-3.5" /> Recordatorio Recompra
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Baby className="w-6 h-6 text-purple-600" /> Distribución de Bebés por Etapa de Crecimiento
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Total de bebés registrados en la base de datos: <strong className="text-purple-700 font-extrabold">{data.babyCohorts?.totalBabies || 0}</strong>
                </p>
              </div>

              <button
                onClick={loadRemarketingData}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all flex items-center gap-1.5 text-xs font-bold w-fit shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" /> Actualizar Cohortes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-pink-50 border border-pink-200 shadow-2xs space-y-1">
                <h3 className="font-extrabold text-pink-900 text-sm">Embarazo / Prenatal</h3>
                <span className="text-3xl font-black text-pink-700 block">
                  {data.babyCohorts?.summary?.embarazo || 0}
                </span>
                <p className="text-[11px] font-medium text-pink-700">Bebés en camino registrados por las mamás.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 shadow-2xs space-y-1">
                <h3 className="font-extrabold text-purple-900 text-sm">Recién Nacidos (0 - 3m)</h3>
                <span className="text-3xl font-black text-purple-700 block">
                  {data.babyCohorts?.summary?.recienNacido || 0}
                </span>
                <p className="text-[11px] font-medium text-purple-700">Etapa de máxima cuidado y piel delicada.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs space-y-1">
                <h3 className="font-extrabold text-amber-900 text-sm">Lactantes (3 - 12m)</h3>
                <span className="text-3xl font-black text-amber-700 block">
                  {(data.babyCohorts?.summary?.lactanteMenor || 0) + (data.babyCohorts?.summary?.lactanteMayor || 0)}
                </span>
                <p className="text-[11px] font-medium text-amber-700">Etapa de rutina de baño y sueño dulce.</p>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 shadow-2xs space-y-1">
                <h3 className="font-extrabold text-sky-900 text-sm">Toddler / Mayores (12m+)</h3>
                <span className="text-3xl font-black text-sky-700 block">
                  {data.babyCohorts?.summary?.toddler || 0}
                </span>
                <p className="text-[11px] font-medium text-sky-700">Niños exploradores e hidratación diaria.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Administración de Productos & Promociones de la Página Principal */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Sub-Tab Navigation Bar */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex items-center gap-2">
              <button
                onClick={() => setAdminProductSubTab('catalog')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  adminProductSubTab === 'catalog'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>🛍️ Catálogo de Productos ({products.length})</span>
              </button>

              <button
                onClick={() => setAdminProductSubTab('promotions')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  adminProductSubTab === 'promotions'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>🎁 Promociones y Combos de Sueño ({promotionsList.length})</span>
              </button>
            </div>

            {/* SUBTAB 1: CATÁLOGO DE PRODUCTOS */}
            {adminProductSubTab === 'catalog' && (
              <div className="space-y-6">
                {/* Header Metrics & Main Action */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                      Gestión del Catálogo E-Commerce
                    </span>
                    <h2 className="text-2xl font-black text-slate-800 mt-1">Administración de Productos</h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Crea y edita productos para la 2da sección de la página principal y la página de detalle.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreateProduct}
                    className="btn-ensueno-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Nuevo Producto</span>
                  </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total en Catálogo</span>
                    <span className="text-2xl font-black text-slate-800 block">{products.length} productos</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-amber-700 uppercase">⭐ En 2da Sección Inicio</span>
                    <span className="text-2xl font-black text-amber-900 block">
                      {products.filter((p) => p.isFeatured !== false).length} destacados
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-pink-700 uppercase">🔥 En Oferta / Promoción</span>
                    <span className="text-2xl font-black text-pink-900 block">
                      {products.filter((p) => p.originalPrice && p.originalPrice > p.price).length} promociones
                    </span>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setProductFilter('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        productFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todos ({products.length})
                    </button>
                    <button
                      onClick={() => setProductFilter('featured')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        productFilter === 'featured'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" /> 2da Sección Inicio
                    </button>
                    <button
                      onClick={() => setProductFilter('promo')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        productFilter === 'promo'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      En Oferta
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter((p) => {
                      if (productFilter === 'featured') return p.isFeatured !== false;
                      if (productFilter === 'promo') return p.originalPrice && p.originalPrice > p.price;
                      return true;
                    })
                    .filter((p) =>
                      !productSearchQuery ||
                      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.subtitle?.toLowerCase().includes(productSearchQuery.toLowerCase())
                    )
                    .map((product) => {
                      const hasPromo = product.originalPrice && product.originalPrice > product.price;
                      const isFeatured = product.isFeatured !== false;

                      return (
                        <div
                          key={product.id}
                          className={`border rounded-3xl p-5 bg-white space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${
                            isFeatured ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                          }`}
                        >
                          {/* Featured Badge */}
                          <div className="flex items-center justify-between gap-2">
                            {isFeatured ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 2da Sección Inicio
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                Solo en Catálogo
                              </span>
                            )}

                            {hasPromo && (
                              <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                🔥 En Promoción
                              </span>
                            )}
                          </div>

                          {/* Image Preview */}
                          <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            {product.badge && (
                              <span className="absolute top-2.5 left-2.5 bg-purple-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                {product.badge}
                              </span>
                            )}
                          </div>

                          {/* Content Info */}
                          <div className="space-y-1.5 flex-grow">
                            <h3 className="font-extrabold text-slate-900 text-base leading-snug">{product.name}</h3>
                            <p className="text-xs font-semibold text-slate-500 line-clamp-2">{product.subtitle}</p>

                            {/* Price Display */}
                            <div className="pt-2 flex items-baseline gap-2">
                              <span className="text-base font-black text-purple-700">
                                ${product.price?.toLocaleString('es-CO')} COP
                              </span>
                              {hasPromo && (
                                <span className="text-xs text-slate-400 line-through font-bold">
                                  ${product.originalPrice?.toLocaleString('es-CO')} COP
                                </span>
                              )}
                            </div>

                            {/* Badges Summary */}
                            <div className="pt-2 flex flex-wrap gap-1">
                              {product.fragrances?.length > 0 && (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  🌸 {product.fragrances.length} Aromas
                                </span>
                              )}
                              {product.sizes?.length > 0 && (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  📐 {product.sizes.length} Tallas
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(product)}
                                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Editar Todo
                              </button>

                              <button
                                onClick={() => handleToggleFeaturedProduct(product)}
                                className={`w-full text-xs font-bold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1 ${
                                  isFeatured
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                                title="Alternar presencia en 2da sección de la página principal"
                              >
                                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                {isFeatured ? 'En Inicio' : '+ A Inicio'}
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="w-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar Producto
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUBTAB 2: PROMOCIONES Y COMBOS DE SUEÑO (SECCIÓN 3 PÁGINA PRINCIPAL) */}
            {adminProductSubTab === 'promotions' && (
              <div className="space-y-6">
                {/* Header Metrics & Main Action */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Sección 3 de la Página Principal
                    </span>
                    <h2 className="text-2xl font-black text-slate-800 mt-1">Promociones y Combos de Sueño</h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Modifica, elimina o agrega ofertas especiales, imágenes o videos promocionales para la tienda.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreatePromo}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Nueva Promoción / Combo</span>
                  </button>
                </div>

                {/* Promos Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotionsList.map((promo: any) => {
                    const hasVideo = Boolean(promo.videoUrl);
                    const isYouTube = promo.videoUrl?.includes('youtube.com') || promo.videoUrl?.includes('youtu.be');

                    return (
                      <div
                        key={promo.id}
                        className={`border rounded-3xl p-5 bg-white space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${
                          promo.isActive !== false ? 'border-amber-300 ring-2 ring-amber-100/60' : 'border-slate-200 opacity-80'
                        }`}
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            {promo.badge || 'OFERTA ESPECIAL ⭐'}
                          </span>

                          <button
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
                              promo.isActive !== false
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {promo.isActive !== false ? '● ACTIVA EN INICIO' : '○ INACTIVA'}
                          </button>
                        </div>

                        {/* Media Preview: Video o Imagen */}
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                          {hasVideo ? (
                            isYouTube ? (
                              <iframe
                                src={promo.videoUrl?.replace('watch?v=', 'embed/')}
                                title={promo.title}
                                className="w-full h-full border-0 pointer-events-none"
                              />
                            ) : (
                              <video src={promo.videoUrl} className="w-full h-full object-cover" />
                            )
                          ) : promo.imageUrl ? (
                            <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold bg-slate-100">
                              Sin Imagen/Video
                            </div>
                          )}

                          {hasVideo && (
                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
                              🎬 Video Adjunto
                            </span>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-1.5 flex-grow">
                          {promo.tagline && (
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                              {promo.tagline}
                            </span>
                          )}
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug">{promo.title}</h3>
                          <p className="text-xs font-semibold text-slate-500 line-clamp-2">{promo.subtitle}</p>

                          {/* Pricing & Savings */}
                          <div className="pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                            {promo.savingText && (
                              <p className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                {promo.savingText}
                              </p>
                            )}
                            <div className="flex items-baseline gap-2">
                              {promo.price && (
                                <span className="text-base font-black text-purple-800">
                                  ${promo.price?.toLocaleString('es-CO')} COP
                                </span>
                              )}
                              {promo.originalPrice && (
                                <span className="text-xs text-slate-400 line-through font-bold">
                                  ${promo.originalPrice?.toLocaleString('es-CO')} COP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenEditPromo(promo)}
                            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold py-2 rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar Todo
                          </button>

                          <button
                            onClick={() => handleDeletePromo(promo.id, promo.title)}
                            className="w-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-bold py-2 rounded-xl border border-rose-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE EDICIÓN Y CREACIÓN COMPLETA DE PRODUCTOS */}
      {showProductModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-purple-100 max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  {editingProduct ? 'Editar Producto Existente' : 'Nuevo Producto Catálogo'}
                </span>
                <h3 className="font-black text-xl text-slate-900 mt-1">
                  {editingProduct ? `Modificar "${editingProduct.name}"` : 'Crear Producto para Inicio & Detalle'}
                </h3>
              </div>

              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 text-xs font-semibold">
              {/* Sección 1: Datos Básicos */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 text-purple-700">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Información Principal
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Ej. Colonia Ensueño Lavanda & Manzanilla"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo / Eslogan *</label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="Ej. Bruma suave relajante para antes de dormir"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoría</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                    >
                      <option value="sueno">🌙 Sueño & Descanso</option>
                      <option value="piel">🌸 Piel Delicada</option>
                      <option value="higiene">🛁 Higiene & Baño</option>
                      <option value="kits">🎁 Kits & Regalos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Etiqueta / Badge Promocional</label>
                    <input
                      type="text"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      placeholder="Ej. MÁS VENDIDO, 15% OFF, NUEVO"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Precios y Oferta */}
              <div className="space-y-3 p-4 bg-pink-50/60 rounded-2xl border border-pink-200">
                <h4 className="font-bold text-pink-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-pink-600" /> Precios y Estado de Promoción
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Precio de Venta ($ COP) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="28500"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-purple-700 font-black focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ¿Está en Oferta / Promoción?
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, isPromo: !productForm.isPromo })}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                        productForm.isPromo
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {productForm.isPromo ? '🔥 SÍ (EN PROMOCIÓN)' : 'NO (PRECIO REGULAR)'}
                    </button>
                  </div>

                  {productForm.isPromo && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-rose-800 mb-1">
                        Precio Anterior / Sin Descuento ($ COP)
                      </label>
                      <input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        placeholder="Ej. 35000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 3: Imágenes */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 text-purple-700">
                  <ImageIcon className="w-4 h-4 text-purple-600" /> Imágenes del Producto
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">URL Imagen Principal *</label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-purple-400"
                    />
                    {productForm.image && (
                      <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <img src={productForm.image} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      URLs Imágenes Adicionales (Separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={productForm.additionalImages}
                      onChange={(e) => setProductForm({ ...productForm, additionalImages: e.target.value })}
                      placeholder="https://img1.com, https://img2.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Opciones de Producto (Tallas y Fragancias) */}
              <div className="space-y-3 p-4 bg-purple-50/60 rounded-2xl border border-purple-200">
                <h4 className="font-bold text-purple-900 text-xs uppercase tracking-wide">
                  Opciones Seleccionables (Tallas & Aromas)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Presentaciones / Tallas (Separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      placeholder="150ml, 250ml, Pack x3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Fragancias / Aromas (Separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={productForm.fragrances}
                      onChange={(e) => setProductForm({ ...productForm, fragrances: e.target.value })}
                      placeholder="Flores Silvestres, Manzanilla, Sin Fragancia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 5: Detalles Médicos, Beneficios e Ingredientes */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 text-purple-700">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> Detalles Clínicos y Descripción
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción Completa *</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Escribe la descripción del producto..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">
                      🛡️ Garantía Pediátrica Certificada *
                    </label>
                    <input
                      type="text"
                      value={productForm.pediatricGuarantee}
                      onChange={(e) => setProductForm({ ...productForm, pediatricGuarantee: e.target.value })}
                      placeholder="Ej. Aprobado por la Asociación Colombiana de Pediatría"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-white text-purple-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Sellos de Seguridad</label>
                    <input
                      type="text"
                      value={productForm.safetyInfo}
                      onChange={(e) => setProductForm({ ...productForm, safetyInfo: e.target.value })}
                      placeholder="Ej. Dermatológicamente testeado • Libre de Alcohol • Hipoalergénico"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Beneficios (Separados por coma)
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.benefits}
                        onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                        placeholder="Induce sueño profundo, Calma irritaciones"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Ingredientes (Separados por coma)
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.ingredients}
                        onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                        placeholder="Aceite esencial de lavanda, Extracto de manzanilla"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 6: Visibilidad */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-400 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-amber-900 text-xs">Visibilidad en 2da Sección de Inicio</h5>
                    <p className="text-[11px] text-amber-800">
                      Muestra este producto en los esenciales de la página principal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, isFeatured: !productForm.isFeatured })}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shrink-0 ${
                    productForm.isFeatured
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {productForm.isFeatured ? '⭐ MOSTRAR EN INICIO' : 'SOLO EN CATÁLOGO'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className="btn-ensueno-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
              >
                {isSavingProduct
                  ? 'Guardando...'
                  : editingProduct
                  ? 'Guardar Cambios de Producto'
                  : 'Crear & Publicar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN Y CREACIÓN DE PROMOCIONES Y COMBOS (SECCIÓN 3 INICIO) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-200 max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {editingPromo ? 'Editar Promoción / Combo' : 'Nueva Promoción para Sección 3 Inicio'}
                </span>
                <h3 className="font-black text-xl text-slate-900 mt-1">
                  {editingPromo ? `Modificar "${editingPromo.title}"` : 'Crear Combo Promocional'}
                </h3>
              </div>

              <button
                onClick={() => setShowPromoModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 text-xs font-semibold">
              {/* Sección 1: Información de la Oferta */}
              <div className="space-y-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" /> Título y Eslogan de la Oferta
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Promoción *</label>
                    <input
                      type="text"
                      value={promoForm.title}
                      onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      placeholder="Ej. Trío de Pañitos Húmedos"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Eslogan / Tagline Superior</label>
                    <input
                      type="text"
                      value={promoForm.tagline}
                      onChange={(e) => setPromoForm({ ...promoForm, tagline: e.target.value })}
                      placeholder="Ej. Paga 2 y Lleva 3, Combo Dueto Fragancia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Etiqueta Destacada / Badge</label>
                    <input
                      type="text"
                      value={promoForm.badge}
                      onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                      placeholder="Ej. OFERTA ESTRELLA ⭐, REGALO GRATIS 🎁"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción de la Oferta</label>
                    <textarea
                      rows={3}
                      value={promoForm.subtitle}
                      onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                      placeholder="Ej. Lleva 3 paquetes de Pañitos Húmedos Ensueño y paga solo 2..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Precios y Mensaje de Ahorro */}
              <div className="space-y-3 p-4 bg-purple-50/60 rounded-2xl border border-purple-200">
                <h4 className="font-bold text-purple-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Precios y Mensaje de Ahorro
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Precio Promocional ($ COP) *</label>
                    <input
                      type="number"
                      value={promoForm.price}
                      onChange={(e) => setPromoForm({ ...promoForm, price: e.target.value })}
                      placeholder="37800"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-purple-800 font-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Precio Original Sin Oferta ($ COP)</label>
                    <input
                      type="number"
                      value={promoForm.originalPrice}
                      onChange={(e) => setPromoForm({ ...promoForm, originalPrice: e.target.value })}
                      placeholder="56700"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">
                      Texto Destacado de Ahorro
                    </label>
                    <input
                      type="text"
                      value={promoForm.savingText}
                      onChange={(e) => setPromoForm({ ...promoForm, savingText: e.target.value })}
                      placeholder="Ej. Ahorras $18.900 COP o Pañitos Húmedos GRATIS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Multimedia (Imagen & Video) */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 text-purple-700">
                  <ImageIcon className="w-4 h-4 text-purple-600" /> Multimedia del Artículo (Imagen & Video)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">URL Imagen Promocional</label>
                    <input
                      type="url"
                      value={promoForm.imageUrl}
                      onChange={(e) => setPromoForm({ ...promoForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                    {promoForm.imageUrl && (
                      <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                        <img src={promoForm.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🎬 URL Video Promocional (MP4, WebM o YouTube)
                    </label>
                    <input
                      type="url"
                      value={promoForm.videoUrl}
                      onChange={(e) => setPromoForm({ ...promoForm, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... o https://midominio.com/video.mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                    {promoForm.videoUrl && (
                      <div className="mt-2 w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                        {promoForm.videoUrl.includes('youtube.com') || promoForm.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={promoForm.videoUrl.replace('watch?v=', 'embed/')}
                            className="w-full h-full border-0"
                            title="Vista previa video"
                          />
                        ) : (
                          <video src={promoForm.videoUrl} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 4: Tipo de Artículo */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <h5 className="font-extrabold text-emerald-900 text-xs">🛍️ Producto Independiente de Promoción</h5>
                  <p className="text-[11px] text-emerald-800">
                    Este combo se agregará al carrito como un producto armado independiente con su propio título, precio final, imágenes y videos.
                  </p>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                  Combo Autónomo
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePromo}
                disabled={isSavingPromo}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
              >
                {isSavingPromo
                  ? 'Guardando...'
                  : editingPromo
                  ? 'Guardar Cambios de la Promoción'
                  : 'Crear & Publicar Promoción'}
              </button>
            </div>
          </div>
        </div>
      )}

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
