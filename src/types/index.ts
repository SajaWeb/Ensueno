export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'sueno' | 'piel' | 'higiene' | 'kits';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  fragrances: string[];
  sizes: string[];
  description: string;
  benefits: string[];
  ingredients: string[];
  safetyInfo: string;
  pediatricGuarantee?: string;
  additionalImages?: string[];
  inStock: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + fragrance + size)
  product: Product;
  selectedFragrance: string;
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  date?: string;
  status: 'confirmado' | 'preparando' | 'en_camino' | 'entregado';
  statusStep: number; // 1 to 4
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  customerName: string;
  customerEmail: string;
  address: string;
  deliveryEstimate: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  babyName: string;
  babyAgeMonths: number;
  skinType: 'Normal' | 'Sensible' | 'Muy Sensible / Atópica';
  address: string;
  savedItemIds: string[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    nightRoutineReminder: boolean;
  };
}

export interface Tip {
  id: string;
  title: string;
  subtitle: string;
  category: 'sueno' | 'piel' | 'higiene' | 'rutinas';
  categoryLabel: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  image: string;
  summary: string;
  content: string[];
  tags: string[];
}

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string | null;
  code?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  badge?: string | null;
  badgeColor?: string | null;
  tagline?: string | null;
  description?: string | null;
  savingText?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  targetBabyStage?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  productId?: string | null;
}
