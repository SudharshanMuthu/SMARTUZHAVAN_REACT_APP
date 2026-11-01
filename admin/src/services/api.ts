import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to generate Authorization headers with either the persistent Admin session token
 * or the current user's Firebase ID token.
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const sessionToken = localStorage.getItem('@smart_uzhavan_admin_token');
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
    return headers;
  }

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const api = {
  // Authentication
  async login(username: string, pass: string) {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: pass.trim() }),
    });
    return res.json();
  },

  async logout() {
    const headers = await getAuthHeaders();
    try {
      await fetch(`${API_BASE}/admin/auth/logout`, {
        method: 'POST',
        headers,
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('@smart_uzhavan_admin_token');
  },

  async verifySession() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/session`, { headers });
    return res.json();
  },

  // Analytics & Stats
  async getStats() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/stats`, { headers });
    return res.json();
  },

  // User Management
  async getUsers(params: { role?: string; search?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, { headers });
    return res.json();
  },

  async getUser(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { headers });
    return res.json();
  },

  async updateUser(id: string, updates: { name?: string; phone?: string; status?: string }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async toggleBlockUser(userId: string, blocked: boolean) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ blocked }),
    });
    return res.json();
  },

  // Crop Marketplace Management
  async getPosts(params: { crop?: string; location?: string; search?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.location) query.append('location', params.location);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/crops?${query.toString()}`, { headers });
    return res.json();
  },

  async createCrop(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/crops`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCrop(id: string, updates: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/crops/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deletePost(postId: string, reason?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/crops/${postId}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ reason: reason || 'Admin moderation' }),
    });
    return res.json();
  },

  // Warehouses
  async getWarehouses(params: { search?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/warehouses?${query.toString()}`, { headers });
    return res.json();
  },

  async createWarehouse(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/warehouses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateWarehouse(id: string, updates: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/warehouses/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteWarehouse(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/warehouses/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  // Vehicles & Transport
  async getVehicles(params: { search?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/vehicles?${query.toString()}`, { headers });
    return res.json();
  },

  async createVehicle(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/vehicles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateVehicle(id: string, updates: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/vehicles/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteVehicle(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/vehicles/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  // Orders & Bookings
  async getOrders(params: { type?: string; status?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, { headers });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getStorageBookings(params: { status?: string; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/storage-bookings?${query.toString()}`, { headers });
    return res.json();
  },

  async updateStorageBookingStatus(id: string, status: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/storage-bookings/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Market Prices
  async getMarketPrices() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/market-prices`, { headers });
    return res.json();
  },

  async saveMarketPrice(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/market-prices`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteMarketPrice(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/market-prices/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  // Agricultural Alerts & Notifications
  async getAlerts() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/alerts`, { headers });
    return res.json();
  },

  async saveAlert(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/alerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAlert(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/alerts/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  // Shared App Content & Configurations
  async getAppContent() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/content`, { headers });
    return res.json();
  },

  async saveAppContent(data: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/content`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Health & Audit Logs
  async getServicesStatus() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/services`, { headers });
    return res.json();
  },

  async getAuditLogs(limit = 30) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, { headers });
    return res.json();
  },
};
