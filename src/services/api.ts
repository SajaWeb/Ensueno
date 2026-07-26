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

  async createOrder(orderPayload: Partial<Order>): Promise<Order> {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al crear orden');
    return json.data;
  },

  async getUserProfile(): Promise<UserProfile> {
    const res = await fetch('/api/v1/user', { cache: 'no-store' });
    const json = await res.json();
    return json.data;
  },

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    const res = await fetch('/api/v1/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const json = await res.json();
    return json.data;
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
