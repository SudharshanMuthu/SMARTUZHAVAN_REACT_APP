export type UserRole = 'Farmer' | 'Buyer' | 'Transporter' | 'Warehouse';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isAdmin: boolean;
  authMethod?: string;
}

export interface UserAccount {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  location?: string;
  blocked?: boolean;
  blockedAt?: string;
  blockedBy?: string;
  createdAt?: any;
}

export interface SystemStats {
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
  totalWarehouseBookings: number;
}

export interface ServiceHealthItem {
  service: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'CONFIGURED' | 'NOT_CONFIGURED';
  mode?: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface AuditLogItem {
  id: string;
  action: string;
  targetId: string;
  targetType: string;
  details?: Record<string, any>;
  performedBy: string;
  timestamp: string;
}
