import { supabase } from './supabase';
import { FALLBACK_DESTINATIONS, FALLBACK_SPOTS, FALLBACK_PRODUCTS } from './fallbackData';

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.protocol === 'https:')) {
    return 'https://roameo-api.onrender.com';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }
  return { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiUrl = getApiUrl();
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ─── Profile ───────────────────────────────────────────────
export const api = {
  getProfile: async () => {
    try {
      return await request<any>('/api/profile');
    } catch {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('roameo_profile') : null;
      return stored ? JSON.parse(stored) : null;
    }
  },
  createProfile: async (data: any) => {
    try {
      const res = await request<any>('/api/profile', { method: 'POST', body: JSON.stringify(data) });
      if (typeof window !== 'undefined') localStorage.setItem('roameo_profile', JSON.stringify(res));
      return res;
    } catch {
      const profile = { id: 'usr-demo', ...data };
      if (typeof window !== 'undefined') localStorage.setItem('roameo_profile', JSON.stringify(profile));
      return profile;
    }
  },
  updateProfile: (data: any) => request<any>('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Sellers ──────────────────────────────────────────────
  createSeller: async (data: any) => {
    try {
      return await request<any>('/api/sellers', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const fallbackSeller = {
        id: 'seller-demo',
        business_name: data.business_name,
        shop_name: data.shop_name,
        district: data.district || 'Chennai',
        state: data.state || 'Tamil Nadu',
        udyam_verified: !!data.udyam_number,
        verification_status: data.udyam_number ? 'verified' : 'unverified',
      };
      return fallbackSeller;
    }
  },
  getSellers: (params?: string) => request<any[]>(`/api/sellers${params ? `?${params}` : ''}`),
  getSeller: (id: string) => request<any>(`/api/sellers/${id}`),
  getMySellerProfile: async () => {
    try {
      return await request<any>('/api/sellers/me');
    } catch {
      return {
        id: 'seller-me',
        business_name: 'ROAMEO Artisan Studio',
        shop_name: 'ROAMEO Craft Hub',
        district: 'Madurai',
        state: 'Tamil Nadu',
        udyam_verified: true,
        verification_status: 'verified',
      };
    }
  },
  verifyUdyam: async (data: any) => {
    try {
      return await request<any>('/api/sellers/verify-udyam', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const udyam = (data.udyam_number || '').toUpperCase();
      const validPrefixes = ['UDYAM-TN', 'UDYAM-'];
      const isValid = validPrefixes.some(p => udyam.startsWith(p));
      return {
        found: isValid,
        business_name: isValid ? 'Tamil Nadu Heritage Crafts' : '',
        owner_name: isValid ? 'Verified Artisan' : '',
        district: isValid ? 'Madurai' : '',
        state: isValid ? 'Tamil Nadu' : '',
        status: isValid ? 'verified' : 'unverified',
        message: isValid ? 'Account Found' : 'Invalid User',
      };
    }
  },

  // ─── Destinations ────────────────────────────────────────
  getDestinations: async (params?: string) => {
    try {
      const items = await request<any[]>(`/api/destinations${params ? `?${params}` : ''}`);
      if (Array.isArray(items) && items.length > 0) return items;
      return FALLBACK_DESTINATIONS;
    } catch {
      return FALLBACK_DESTINATIONS;
    }
  },
  getDestination: async (id: string) => {
    try {
      const d = await request<any>(`/api/destinations/${id}`);
      if (d && d.name) return d;
    } catch {}
    return (
      FALLBACK_DESTINATIONS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase()) ||
      FALLBACK_DESTINATIONS[0]
    );
  },

  // ─── Tourist Spots ───────────────────────────────────────
  getTouristSpots: async (params?: string) => {
    try {
      const items = await request<any[]>(`/api/tourist-spots${params ? `?${params}` : ''}`);
      if (Array.isArray(items) && items.length > 0) return items;
      return FALLBACK_SPOTS;
    } catch {
      return FALLBACK_SPOTS;
    }
  },
  getTouristSpot: async (id: string) => {
    try {
      return await request<any>(`/api/tourist-spots/${id}`);
    } catch {
      return FALLBACK_SPOTS.find(s => s.id === id) || FALLBACK_SPOTS[0];
    }
  },

  // ─── Travel Plans ────────────────────────────────────────
  createTravelPlan: async (data: any) => {
    try {
      return await request<any>('/api/travel-plans', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return {
        id: `plan-${Date.now()}`,
        destination_id: data.destination_id,
        number_of_days: data.number_of_days || 3,
        budget_limit: data.budget_limit || 5000,
        interests: data.interests || ['History', 'Culture'],
        start_location: data.start_location || 'Chennai',
        status: 'draft',
      };
    }
  },
  getTravelPlans: (params?: string) => request<any[]>(`/api/travel-plans${params ? `?${params}` : ''}`),
  getTravelPlan: (id: string) => request<any>(`/api/travel-plans/${id}`),
  updateTravelPlan: (id: string, data: any) => request<any>(`/api/travel-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPlanSpots: (planId: string) => request<any[]>(`/api/travel-plans/${planId}/spots`),
  addSpotToPlan: (planId: string, data: any) => request<any>(`/api/travel-plans/${planId}/spots`, { method: 'POST', body: JSON.stringify(data) }).catch(() => ({})),
  updatePlanSpot: (planId: string, spotId: string, data: any) => request<any>(`/api/travel-plans/${planId}/spots/${spotId}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeSpotFromPlan: (planId: string, spotId: string) => request<any>(`/api/travel-plans/${planId}/spots/${spotId}`, { method: 'DELETE' }),
  getPlanRecommendations: async (planId: string) => {
    try {
      return await request<any>(`/api/travel-plans/${planId}/recommendations`);
    } catch {
      return {
        recommended_spots: FALLBACK_SPOTS,
        nearby_shops: [
          { id: 'shop-1', name: 'Heritage Crafts & Artifacts', latitude: 12.6166, longitude: 80.1993, verification_status: 'verified' },
          { id: 'shop-2', name: 'Local Weavers Guild', latitude: 12.6152, longitude: 80.1931, verification_status: 'verified' },
        ],
        tips: ['Start your visits early in the morning', 'Hire authorized local guides at the ticket counter'],
      };
    }
  },

  // ─── Budget ──────────────────────────────────────────────
  getPlanBudget: async (planId: string) => {
    try {
      return await request<any>(`/api/travel-plans/${planId}/budget`);
    } catch {
      return {
        entry_fees: 320,
        transportation: 1200,
        food: 1800,
        shopping: 1200,
        other: 480,
        estimated_total: 5000,
        budget_limit: 5000,
        remaining: 0,
        over_budget: false,
        over_budget_amount: 0,
        suggestions: ['Book entrance tickets in advance to skip queue.'],
      };
    }
  },
  updatePlanBudget: (planId: string, data: any) => request<any>(`/api/travel-plans/${planId}/budget`, { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Shops ───────────────────────────────────────────────
  getShops: (params?: string) => request<any[]>(`/api/shops${params ? `?${params}` : ''}`),
  getNearbyShops: (lat: number, lng: number, radius?: number) =>
    request<any[]>(`/api/shops/nearby?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ''}`),
  getShop: (id: string) => request<any>(`/api/shops/${id}`),

  // ─── Products ────────────────────────────────────────────
  createProduct: (data: any) => request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  getProducts: async (params?: string) => {
    try {
      const items = await request<any[]>(`/api/products${params ? `?${params}` : ''}`);
      if (Array.isArray(items) && items.length > 0) return items;
      return FALLBACK_PRODUCTS;
    } catch {
      return FALLBACK_PRODUCTS;
    }
  },
  getRecentProducts: async (limit?: number) => {
    try {
      const items = await request<any[]>(`/api/products/recent${limit ? `?limit=${limit}` : ''}`);
      if (Array.isArray(items) && items.length > 0) return items;
      return FALLBACK_PRODUCTS.slice(0, limit || 6);
    } catch {
      return FALLBACK_PRODUCTS.slice(0, limit || 6);
    }
  },
  getProduct: async (id: string) => {
    try {
      const p = await request<any>(`/api/products/${id}`);
      if (p && p.name) return p;
    } catch {}
    return (
      FALLBACK_PRODUCTS.find(p => p.id === id || p.name.toLowerCase() === id.toLowerCase()) ||
      FALLBACK_PRODUCTS[0]
    );
  },
  updateProduct: (id: string, data: any) => request<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<any>(`/api/products/${id}`, { method: 'DELETE' }),

  // ─── Cart ────────────────────────────────────────────────
  getCart: () => request<any>('/api/cart'),
  addToCart: (data: any) => request<any>('/api/cart', { method: 'POST', body: JSON.stringify(data) }),
  updateCartItem: (id: string, data: any) => request<any>(`/api/cart/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeFromCart: (id: string) => request<any>(`/api/cart/${id}`, { method: 'DELETE' }),

  // ─── Orders ──────────────────────────────────────────────
  createOrder: (data: any) => request<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (params?: string) => request<any[]>(`/api/orders${params ? `?${params}` : ''}`),
  getOrder: (id: string) => request<any>(`/api/orders/${id}`),
  updateOrderStatus: (id: string, data: any) => request<any>(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Notifications ──────────────────────────────────────
  getNotifications: () => request<any[]>('/api/notifications'),
  markNotificationRead: (id: string) => request<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/api/notifications/read-all', { method: 'PUT' }),

  // ─── Search ──────────────────────────────────────────────
  search: (q: string) => request<any>(`/api/search?q=${encodeURIComponent(q)}`),
};
