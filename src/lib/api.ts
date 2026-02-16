import axios from 'axios';
import type {
  Category,
  CategoryChild,
  Product,
  ProductCategory,
  ProductColor,
  BestSelling,
  Hot,
  Notification,
  TrackingCode,
  SiteSettings,
  HomepageData,
  CreateOrderData,
  CreateOrderProductItem,
  CreateMultiProductOrderData,
  CreateSingleProductOrderData,
  Order,
  Cart,
  CartItem,
  AddToCartData,
  UpdateCartItemData,
} from '@/types/api';

export type {
  Category,
  CategoryChild,
  Product,
  ProductCategory,
  ProductColor,
  BestSelling,
  Hot,
  Notification,
  TrackingCode,
  SiteSettings,
  HomepageData,
  CreateOrderData,
  CreateOrderProductItem,
  CreateMultiProductOrderData,
  CreateSingleProductOrderData,
  Order,
  Cart,
  CartItem,
  AddToCartData,
  UpdateCartItemData,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Function to get CSRF token from cookies
function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Helper function to convert relative image URLs to absolute URLs
export function getImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  
  // If already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, prepend API base URL
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE_URL}${cleanUrl}`;
}

// API Functions - Read-only product endpoints
export const productApi = {
  getAll: async (search?: string, category?: string): Promise<Product[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const response = await api.get('/api/products/', { params });
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/api/products/${id}/`);
    return response.data;
  },
};

// API Functions - Categories
export const categoryApi = {
  getTree: async (): Promise<Category[]> => {
    const response = await api.get('/api/categories/tree/');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/api/categories/${encodeURIComponent(slug)}/`);
    return response.data;
  },
};

// API Functions - Best Selling products
export const bestSellingApi = {
  getAll: async (): Promise<BestSelling[]> => {
    const response = await api.get('/api/best-selling/');
    return response.data.results || response.data;
  },
};

// API Functions - Hot products (homepage Hot section)
export const hotApi = {
  getAll: async (): Promise<Hot[]> => {
    const response = await api.get('/api/hot/');
    return response.data.results || response.data;
  },
};

// Homepage: single request for products + best_selling + hot (faster than 3 parallel calls)
export const homepageApi = {
  getData: async (): Promise<HomepageData> => {
    const response = await api.get<HomepageData>('/api/homepage/');
    return response.data;
  },
};

// API Functions - Notifications
export const notificationApi = {
  getActive: async (): Promise<Notification | null> => {
    try {
      const response = await api.get('/api/notifications/active/');
      return response.data.is_active ? response.data : null;
    } catch (error) {
      console.error('Error fetching notification:', error);
      return null;
    }
  },
};

// API Functions - Tracking Codes
export const trackingCodeApi = {
  getActive: async (): Promise<TrackingCode[]> => {
    try {
      const response = await api.get('/api/tracking-codes/active/');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tracking codes:', error);
      return [];
    }
  },
};

// API Functions - Site Settings
export const siteSettingsApi = {
  get: async (): Promise<SiteSettings> => {
    const response = await api.get<SiteSettings>('/api/site-settings/');
    return response.data;
  },
};

// API Functions - Cart
export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await api.get('/api/cart/');
    return response.data;
  },

  add: async (data: AddToCartData): Promise<Cart> => {
    const response = await api.post('/api/cart/add/', data);
    return response.data;
  },

  updateItem: async (itemId: number, data: UpdateCartItemData): Promise<Cart> => {
    const response = await api.put(`/api/cart/items/${itemId}/`, data);
    return response.data;
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    const response = await api.delete(`/api/cart/items/${itemId}/remove/`);
    return response.data;
  },

  clear: async (): Promise<void> => {
    await api.delete('/api/cart/');
  },
};

// API Functions - Orders
export const orderApi = {
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post('/api/orders/create/', data);
    return response.data;
  },

  createSingleProduct: async (data: CreateSingleProductOrderData): Promise<Order> => {
    const response = await api.post('/api/orders/create/', data);
    return response.data;
  },
};

