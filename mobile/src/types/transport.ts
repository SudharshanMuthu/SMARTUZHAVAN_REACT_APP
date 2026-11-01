export type VehicleType =
  | 'Mini Truck'
  | 'Lorry'
  | 'Tractor'
  | 'Van'
  | 'Pickup'
  | 'Tipper'
  | 'Heavy Truck'
  | 'Refrigerated Truck'
  | string;

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  driverPhone?: string;
  name: string;
  type: VehicleType;
  number: string;
  capacity: number; // in tons
  ratePerKm: number; // in ₹/km
  baseLocation: string; // e.g., 'Trichy', 'Chennai', 'Erode', 'Madurai'
  isAvailable: boolean;
  createdAt?: any;
  isDemo?: boolean;
}

export type TripStatus = 'requested' | 'accepted' | 'on_trip' | 'completed' | 'rejected';

export interface TransportOrder {
  id: string;
  type: 'transport';
  vehicleId: string;
  transporterId: string;
  requestedById: string;
  requestedByEmail?: string;
  requestedByName: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  weightTons: number;
  price: number;
  status: TripStatus;
  createdAt?: any;
  vehicleName?: string;
  vehicleType?: string;
  isDemo?: boolean;
}

export interface CreateVehicleInput {
  name: string;
  type: VehicleType;
  number: string;
  capacity: number;
  ratePerKm: number;
  baseLocation: string;
  isAvailable?: boolean;
}

export interface CreateTransportOrderInput {
  vehicleId: string;
  transporterId: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  weightTons: number;
  price: number;
  vehicleName?: string;
  vehicleType?: string;
}
