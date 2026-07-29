import { Product, Order, UserProfile, Tip } from '@/types';

export const apiService = {
  async getProducts(category?: string, query?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);

    const res = await fetch(`/api/v1/products?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const res = await fetch(`/api/v1/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  },

  async updateProductImage(id: string, image: string, additionalImages?: string[]) {
    const res = await fetch('/api/v1/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, image, additionalImages }),
    });
    return res.json();
  },

  async getPromotions(stage?: string, includeAll = false) {
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    if (includeAll) params.append('all', 'true');
    const res = await fetch(`/api/v1/promotions?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  },

  async createPromotion(data: any) {
    const res = await fetch('/api/v1/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePromotion(id: string) {
    const res = await fetch(`/api/v1/promotions?id=${id}`, { method: 'DELETE' });
    return res.json();
  },

  async createOrder(orderPayload: any): Promise<{ order: Order; mercadopago: any }> {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const json = await res.json();
    if (!json.success) {
      const err = new Error(json.error || 'Error al crear orden') as any;
      err.pendingOrderNumber = json.pendingOrderNumber;
      throw err;
    }
    return { order: json.data, mercadopago: json.mercadopago };
  },

  async getUserOrders() {
    const res = await fetch('/api/v1/orders', { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  },

  async login(email: string, password: string) {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data: any) {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch('/api/v1/auth/me', { cache: 'no-store' });
    return res.json();
  },

  async updateUserProfile(data: any) {
    const res = await fetch('/api/v1/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getSavedAddresses() {
    const res = await fetch('/api/v1/user/addresses', { cache: 'no-store' });
    return res.json();
  },

  async addSavedAddress(data: { title?: string; department: string; city: string; address: string; isDefault?: boolean }) {
    const res = await fetch('/api/v1/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSavedAddress(data: { id: string; title?: string; department: string; city: string; address: string; isDefault?: boolean }) {
    const res = await fetch('/api/v1/user/addresses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSavedAddress(id: string) {
    const res = await fetch(`/api/v1/user/addresses?id=${id}`, { method: 'DELETE' });
    return res.json();
  },

  async requestPasswordReset(email: string) {
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async verifyEmail(email: string, code: string) {
    const res = await fetch('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return res.json();
  },

  async resendVerificationCode(email: string) {
    const res = await fetch('/api/v1/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(token: string, newPassword: string, email?: string) {
    const res = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, code: token, email, newPassword }),
    });
    return res.json();
  },

  async getAdminRemarketingData() {
    const res = await fetch('/api/v1/admin/remarketing', { cache: 'no-store' });
    return res.json();
  },

  async sendRemarketingReminder(motherEmail: string, motherName: string, babyName: string, productTitle?: string) {
    const res = await fetch('/api/v1/admin/remarketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_reminder',
        motherEmail,
        motherName,
        babyName,
        productTitle,
      }),
    });
    return res.json();
  },

  async getTips(category?: string, query?: string): Promise<Tip[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);

    const res = await fetch(`/api/v1/tips?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  },
};
