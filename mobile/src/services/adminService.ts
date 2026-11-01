import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout, getFriendlyNetworkError } from '../utils/networkUtil';
import { getFirebaseFirestore } from './firebase';

const getBaseUrl = () => getApiBaseUrl();

export const ADMIN_TOKEN_KEY = '@smart_uzhavan_admin_token';
export const ADMIN_USER_KEY = '@smart_uzhavan_admin_user';

export interface AdminUser {
  username: string;
  email: string;
  role: 'admin' | 'Admin';
  isAdmin: boolean;
  name?: string;
}

export interface AdminStats {
  totalUsers: number;
  farmers: number;
  buyers: number;
  transporters: number;
  warehouseOwners: number;
  blockedUsers: number;
  totalPosts: number;
  totalWarehouses: number;
  totalVehicles: number;
  pendingStorageBookings: number;
  activeStorageBookings: number;
  completedStorageBookings: number;
  pendingTransportBookings: number;
  onTripTransportBookings: number;
  completedTransportBookings: number;
  totalOrders: number;
  totalWarehouseBookings?: number;
  totalCrops?: number;
  activeAlerts?: number;
  pendingBookings?: number;
  warehouses?: number;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const adminService = {
  // Authentication
  async login(username: string, pass: string): Promise<{ success: boolean; token?: string; adminUser?: AdminUser; error?: string }> {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        error: 'Cloud backend is not configured. Please set a public HTTPS backend URL.',
      };
    }
    try {
      const res = await fetchWithTimeout(`${baseUrl}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: pass.trim() }),
      }, 5000);

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        await AsyncStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        const adminUser = {
          ...data.adminUser,
          name: 'System Administrator',
          role: 'Admin' as const,
        };
        await AsyncStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
        return { success: true, token: data.token, adminUser };
      }
      return { success: false, error: data.error || 'Invalid administrator credentials.' };
    } catch (err: any) {
      const friendly = getFriendlyNetworkError(err, `${baseUrl}/admin/auth/login`);
      return { success: false, error: friendly };
    }
  },

  async logout(): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await fetchWithTimeout(`${getBaseUrl()}/admin/auth/logout`, {
        method: 'POST',
        headers,
      }, 3000);
    } catch {
      // Ignore network errors on logout
    } finally {
      await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
      await AsyncStorage.removeItem(ADMIN_USER_KEY);
    }
  },

  async getStoredAdminSession(): Promise<{ token: string; user: AdminUser } | null> {
    try {
      const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(ADMIN_USER_KEY);
      if (!token || !userJson) return null;
      return { token, user: JSON.parse(userJson) };
    } catch {
      return null;
    }
  },

  async verifySession(): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetchWithTimeout(`${getBaseUrl()}/admin/session`, { headers }, 4000);
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.success);
      }
      return false;
    } catch {
      return false;
    }
  },

  // Overview & Analytics
  async getStats(): Promise<{ isConfigured: boolean; stats: AdminStats }> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/stats`, { headers }, 4000);
    const data = await res.json();
    return data.data || { isConfigured: false, stats: {} };
  },

  // User Management
  async getUsers(params: { role?: string; search?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/users?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async toggleBlockUser(userId: string, blocked: boolean): Promise<boolean> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/users/${userId}/block`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ blocked }),
    }, 4000);
    const data = await res.json();
    return Boolean(data.success);
  },

  // Crop Marketplace
  async getCrops(params: { crop?: string; location?: string; search?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.location) query.append('location', params.location);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/crops?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async createCrop(cropData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/crops`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cropData),
    }, 4000);
    return res.json();
  },

  async updateCrop(id: string, updates: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/crops/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    }, 4000);
    return res.json();
  },

  async deleteCrop(id: string, reason?: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/crops/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ reason: reason || 'Admin removal' }),
    }, 4000);
    return res.json();
  },

  // Warehouses
  async getWarehouses(params: { search?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/warehouses?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async createWarehouse(whData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/warehouses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(whData),
    }, 4000);
    return res.json();
  },

  async updateWarehouse(id: string, updates: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/warehouses/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    }, 4000);
    return res.json();
  },

  async deleteWarehouse(id: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/warehouses/${id}`, {
      method: 'DELETE',
      headers,
    }, 4000);
    return res.json();
  },

  // Vehicles
  async getVehicles(params: { search?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/vehicles?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async createVehicle(vehData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/vehicles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(vehData),
    }, 4000);
    return res.json();
  },

  async updateVehicle(id: string, updates: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/vehicles/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    }, 4000);
    return res.json();
  },

  async deleteVehicle(id: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/vehicles/${id}`, {
      method: 'DELETE',
      headers,
    }, 4000);
    return res.json();
  },

  // Orders & Bookings
  async getOrders(params: { type?: string; status?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/orders?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async updateOrderStatus(id: string, status: string): Promise<any> {
    const headers = await getAuthHeaders();
    let backendResult = null;
    try {
      const res = await fetchWithTimeout(`${getBaseUrl()}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      }, 4000);
      backendResult = await res.json();
    } catch (err) {
      console.warn('[adminService] Backend updateOrderStatus failed:', err);
    }

    // Mirror update to Cloud Firestore if order document exists
    try {
      const db = getFirebaseFirestore();
      const orderRef = doc(db, 'orders', id);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        await updateDoc(orderRef, { status });
      }
    } catch (err) {
      // Non-critical if offline or not a firestore doc
    }

    return backendResult || { success: true };
  },

  async getStorageBookings(params: { status?: string; limit?: number } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/storage-bookings?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async updateStorageBookingStatus(id: string, status: string): Promise<any> {
    const headers = await getAuthHeaders();
    let backendResult = null;
    try {
      const res = await fetchWithTimeout(`${getBaseUrl()}/admin/storage-bookings/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      }, 4000);
      backendResult = await res.json();
    } catch (err) {
      console.warn('[adminService] Backend updateStorageBookingStatus failed:', err);
    }

    // Mirror update to Cloud Firestore if booking document exists
    try {
      const db = getFirebaseFirestore();
      const bookingRef = doc(db, 'warehouseBookings', id);
      const snap = await getDoc(bookingRef);
      if (snap.exists()) {
        await updateDoc(bookingRef, { status });
      }
    } catch (err) {
      // Non-critical if offline or not a firestore doc
    }

    return backendResult || { success: true };
  },

  // Market Prices
  async getMarketPrices(params: { crop?: string; location?: string } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.location) query.append('location', params.location);

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/market-prices?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async saveMarketPrice(priceData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/market-prices`, {
      method: 'POST',
      headers,
      body: JSON.stringify(priceData),
    }, 4000);
    return res.json();
  },

  async deleteMarketPrice(id: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/market-prices/${id}`, {
      method: 'DELETE',
      headers,
    }, 4000);
    return res.json();
  },

  // Alerts
  async getAlerts(params: { category?: string } = {}): Promise<any[]> {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);

    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/alerts?${query.toString()}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async saveAlert(alertData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/alerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(alertData),
    }, 4000);
    return res.json();
  },

  async deleteAlert(id: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/alerts/${id}`, {
      method: 'DELETE',
      headers,
    }, 4000);
    return res.json();
  },

  // Content & Config
  async getContent(): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/content`, { headers }, 4000);
    const data = await res.json();
    return data.data || {};
  },

  async saveContent(contentData: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/content`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(contentData),
    }, 4000);
    return res.json();
  },

  // Services & Audit Logs
  async getServicesStatus(): Promise<any[]> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/services`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },

  async getAuditLogs(limit = 50): Promise<any[]> {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(`${getBaseUrl()}/admin/audit-logs?limit=${limit}`, { headers }, 4000);
    const data = await res.json();
    return data.data || [];
  },
};
