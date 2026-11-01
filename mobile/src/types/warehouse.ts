export interface Warehouse {
  id: string;
  ownerId: string;
  ownerName?: string;
  warehouseName: string;
  capacity: number;
  availableSpace: number;
  ratePerDay: number;
  location: string;
  district?: string;
  type?: string;
  contactPhone?: string;
  latitude: number;
  longitude: number;
  createdAt?: any;
  isDemo?: boolean;
}

export type WarehouseBookingStatus = 'requested' | 'accepted' | 'stored' | 'rejected';

export interface WarehouseBooking {
  id: string;
  warehouseId: string;
  ownerId?: string;
  farmerId: string;
  farmerName: string;
  farmerEmail?: string;
  quantity: number;
  days: number;
  totalPrice: number;
  status: WarehouseBookingStatus;
  createdAt?: any;
  warehouseName?: string;
  location?: string;
  isDemo?: boolean;
}

export interface CreateWarehouseInput {
  warehouseName: string;
  capacity: number;
  availableSpace?: number;
  ratePerDay: number;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateWarehouseBookingInput {
  warehouseId: string;
  ownerId?: string;
  quantity: number;
  days: number;
  warehouseName?: string;
  location?: string;
}
