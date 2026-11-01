import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from './firebase';
import {
  Vehicle,
  TransportOrder,
  TripStatus,
  CreateVehicleInput,
  CreateTransportOrderInput,
} from '../types/transport';
import { DEMO_VEHICLES, DEMO_TRANSPORT_ORDERS } from '../data/demoDatasets';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout } from '../utils/networkUtil';

const VEHICLES_COLLECTION = 'vehicles';
const ORDERS_COLLECTION = 'orders';
const NOTIFICATIONS_COLLECTION = 'notifications';

const normalizeVehicleDoc = (id: string, data: any, isDemo: boolean = false): Vehicle => ({
  id,
  ownerId: data.ownerId || '',
  ownerName: data.ownerName || 'Verified Logistics Partner',
  ownerEmail: data.ownerEmail,
  name: data.name || data.vehicleName || 'Freight Vehicle',
  type: data.type || data.vehicleType || 'Mini Truck',
  number: data.number || data.vehicleNumber || 'TN-45',
  capacity: Number(data.capacity || data.payloadTons || data.capacityTons || 3),
  ratePerKm: Number(data.ratePerKm || data.rate || 20),
  baseLocation: data.baseLocation || data.location || 'Trichy',
  driverPhone: data.driverPhone,
  isAvailable: data.isAvailable !== false,
  createdAt: data.createdAt,
  isDemo,
});

/**
 * Fetch ecosystem transport listings from backend persistent store (includes admin-created vehicles).
 */
const fetchBackendEcosystemVehicles = async (): Promise<Vehicle[]> => {
  const base = getApiBaseUrl();
  if (!base) return [];
  try {
    const res = await fetchWithTimeout(`${base}/ecosystem/vehicles?limit=100`, {}, 3000);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((v: any) => normalizeVehicleDoc(v.id, v, false));
      }
    }
  } catch (err) {
    // backend offline
  }
  return [];
};

/**
 * Merges Firestore real-time transport fleet with backend vehicles.
 */
const mergeVehicles = (firestoreVeh: Vehicle[], backendVeh: Vehicle[], baseLocation?: string): Vehicle[] => {
  const map = new Map<string, Vehicle>();
  for (const b of backendVeh) {
    if (b.isAvailable) map.set(b.id, b);
  }
  for (const f of firestoreVeh) {
    if (f.isAvailable) map.set(f.id, f);
  }
  let merged = Array.from(map.values());
  if (baseLocation && baseLocation.trim() !== '' && baseLocation !== 'All') {
    const filtered = merged.filter((v) => v.baseLocation.toLowerCase() === baseLocation.toLowerCase());
    if (filtered.length > 0) merged = filtered;
  }
  return merged.length > 0 ? merged : DEMO_VEHICLES.map((v) => ({ ...v, isDemo: true }));
};

/**
 * Real-time listener for available vehicles, optionally filtered by base location.
 * Unifies Firestore transporter listings with backend admin transport listings.
 */
export const subscribeToAvailableVehicles = (
  baseLocation?: string,
  onUpdate?: (vehicles: Vehicle[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const vRef = collection(db, VEHICLES_COLLECTION);

  let latestBackendVeh: Vehicle[] = [];

  fetchBackendEcosystemVehicles().then((bVeh) => {
    latestBackendVeh = bVeh;
    if (latestBackendVeh.length > 0 && onUpdate) {
      onUpdate(mergeVehicles([], latestBackendVeh, baseLocation));
    }
  });

  let q;
  if (baseLocation && baseLocation.trim() !== '' && baseLocation !== 'All') {
    q = query(vRef, where('baseLocation', '==', baseLocation.trim()));
  } else {
    q = query(vRef);
  }

  return onSnapshot(
    q,
    (snapshot) => {
      let firestoreVeh: Vehicle[] = snapshot.docs.map((d) =>
        normalizeVehicleDoc(d.id, d.data(), false)
      );
      if (onUpdate) {
        onUpdate(mergeVehicles(firestoreVeh, latestBackendVeh, baseLocation));
      }
    },
    (err) => {
      console.warn('[transportService] Error querying available vehicles, supplying demo fleet:', err);
      if (onUpdate) onUpdate(mergeVehicles([], latestBackendVeh, baseLocation));
      if (onError) onError(err);
    }
  );
};

/**
 * Real-time listener for vehicles owned by the transporter.
 */
export const subscribeToMyVehicles = (
  ownerId: string,
  onUpdate: (vehicles: Vehicle[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const vRef = collection(db, VEHICLES_COLLECTION);
  const q = query(vRef, where('ownerId', '==', ownerId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const vehicles: Vehicle[] = snapshot.docs.map((d) =>
          normalizeVehicleDoc(d.id, d.data(), false)
        );
        onUpdate(vehicles);
      } else {
        // Demo fleet for review session
        onUpdate(DEMO_VEHICLES.slice(0, 2).map((v) => ({ ...v, ownerId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[transportService] Error querying my vehicles, supplying demo fleet:', err);
      onUpdate(DEMO_VEHICLES.slice(0, 2).map((v) => ({ ...v, ownerId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Add a new vehicle to fleet (Transporter action).
 */
export const addVehicle = async (input: CreateVehicleInput): Promise<string> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be authenticated to add a vehicle.');
  }

  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
    ownerId: user.uid,
    ownerEmail: user.email || '',
    name: input.name.trim(),
    type: input.type,
    number: input.number.trim().toUpperCase(),
    capacity: Number(input.capacity),
    ratePerKm: Number(input.ratePerKm),
    baseLocation: input.baseLocation.trim(),
    isAvailable: input.isAvailable !== false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

/**
 * Toggle vehicle availability.
 */
export const updateVehicleAvailability = async (
  vehicleId: string,
  isAvailable: boolean
): Promise<void> => {
  const db = getFirebaseFirestore();
  await updateDoc(doc(db, VEHICLES_COLLECTION, vehicleId), {
    isAvailable,
  });
};

/**
 * Create transport booking request (Farmer action).
 */
export const createTransportOrder = async (
  input: CreateTransportOrderInput
): Promise<string> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be authenticated to book transport.');
  }

  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    type: 'transport',
    vehicleId: input.vehicleId,
    transporterId: input.transporterId,
    requestedById: user.uid,
    requestedByEmail: user.email || '',
    requestedByName: user.displayName || user.email?.split('@')[0] || 'Farmer',
    pickup: input.pickup.trim(),
    drop: input.drop.trim(),
    distanceKm: Number(input.distanceKm),
    weightTons: Number(input.weightTons),
    price: Number(input.price),
    status: 'requested' as TripStatus,
    vehicleName: input.vehicleName || 'Vehicle',
    vehicleType: input.vehicleType || 'Mini Truck',
    createdAt: serverTimestamp(),
  });

  // Notify transporter
  if (input.transporterId) {
    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        userId: input.transporterId,
        title: 'New Transport Booking Request',
        body: `Route: ${input.pickup} to ${input.drop} (${input.distanceKm} km, ${input.weightTons}T)`,
        read: false,
        createdAt: serverTimestamp(),
        meta: { orderId: orderRef.id, vehicleId: input.vehicleId },
      });
    } catch (_) {
      // Non-critical notification failure
    }
  }

  return orderRef.id;
};

/**
 * Real-time listener for transport orders assigned to the transporter.
 */
export const subscribeToTransporterOrders = (
  transporterId: string,
  onUpdate: (orders: TransportOrder[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef,
    where('transporterId', '==', transporterId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const realOrders: TransportOrder[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: (data.type as any) || 'transport',
            vehicleId: data.vehicleId || '',
            transporterId: data.transporterId || '',
            requestedById: data.requestedById || '',
            requestedByEmail: data.requestedByEmail,
            requestedByName: data.requestedByName || 'Farmer',
            pickup: data.pickup || '',
            drop: data.drop || '',
            distanceKm: Number(data.distanceKm) || 0,
            weightTons: Number(data.weightTons) || 0,
            price: Number(data.price) || 0,
            status: (data.status as TripStatus) || 'requested',
            vehicleName: data.vehicleName,
            vehicleType: data.vehicleType,
            createdAt: data.createdAt,
            isDemo: false,
          };
        })
        .filter((o) => o.type === 'transport');

      if (realOrders.length > 0) {
        realOrders.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        onUpdate(realOrders);
      } else {
        onUpdate(DEMO_TRANSPORT_ORDERS.map((o) => ({ ...o, transporterId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[transportService] Transporter orders error, supplying demo orders:', err);
      onUpdate(DEMO_TRANSPORT_ORDERS.map((o) => ({ ...o, transporterId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Real-time listener for transport orders requested by the farmer.
 */
export const subscribeToFarmerTransportOrders = (
  farmerId: string,
  onUpdate: (orders: TransportOrder[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef,
    where('requestedById', '==', farmerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const realOrders: TransportOrder[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: (data.type as any) || 'transport',
            vehicleId: data.vehicleId || '',
            transporterId: data.transporterId || '',
            requestedById: data.requestedById || '',
            requestedByEmail: data.requestedByEmail,
            requestedByName: data.requestedByName || 'Farmer',
            pickup: data.pickup || '',
            drop: data.drop || '',
            distanceKm: Number(data.distanceKm) || 0,
            weightTons: Number(data.weightTons) || 0,
            price: Number(data.price) || 0,
            status: (data.status as TripStatus) || 'requested',
            vehicleName: data.vehicleName,
            vehicleType: data.vehicleType,
            createdAt: data.createdAt,
            isDemo: false,
          };
        })
        .filter((o) => o.type === 'transport');

      if (realOrders.length > 0) {
        realOrders.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        onUpdate(realOrders);
      } else {
        onUpdate(DEMO_TRANSPORT_ORDERS.slice(0, 2).map((o) => ({ ...o, requestedById: farmerId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[transportService] Farmer transport orders error, supplying demo orders:', err);
      onUpdate(DEMO_TRANSPORT_ORDERS.slice(0, 2).map((o) => ({ ...o, requestedById: farmerId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Update transport order lifecycle status (requested -> accepted -> on_trip -> completed / rejected)
 */
export const updateTransportOrderStatus = async (
  orderId: string,
  status: TripStatus,
  farmerId?: string,
  routeDesc?: string
): Promise<void> => {
  const db = getFirebaseFirestore();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  await updateDoc(orderRef, { status });

  if (farmerId) {
    try {
      let title = 'Transport Update';
      if (status === 'accepted') title = 'Booking Accepted by Transporter';
      if (status === 'on_trip') title = 'Driver Dispatched / On Trip';
      if (status === 'completed') title = 'Cargo Delivered Successfully';
      if (status === 'rejected') title = 'Transport Request Declined';

      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        userId: farmerId,
        title,
        body: `Your transport request (${routeDesc || 'Trip'}) is now: ${status.replace('_', ' ').toUpperCase()}`,
        read: false,
        createdAt: serverTimestamp(),
        meta: { orderId, status },
      });
    } catch (_) {
      // Ignore notification failures
    }
  }
};
