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
  runTransaction,
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from './firebase';
import {
  Warehouse,
  WarehouseBooking,
  WarehouseBookingStatus,
  CreateWarehouseInput,
  CreateWarehouseBookingInput,
} from '../types/warehouse';
import { DEMO_WAREHOUSES, DEMO_STORAGE_BOOKINGS } from '../data/demoDatasets';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout } from '../utils/networkUtil';

const WAREHOUSES_COLLECTION = 'warehouses';
const BOOKINGS_COLLECTION = 'warehouseBookings';
const NOTIFICATIONS_COLLECTION = 'notifications';

const normalizeWarehouseDoc = (id: string, data: any, isDemo: boolean = false): Warehouse => ({
  id,
  ownerId: data.ownerId || '',
  ownerName: data.ownerName || 'State Agri Logistics',
  warehouseName: data.warehouseName || data.name || 'Warehouse Facility',
  capacity: Number(data.capacity) || 500,
  availableSpace: Number(data.availableSpace !== undefined ? data.availableSpace : data.capacity) || 200,
  ratePerDay: Number(data.ratePerDay || data.price || data.dailyRatePerBag || 15),
  location: data.location || 'Tamil Nadu',
  district: data.district,
  type: data.type,
  contactPhone: data.contactPhone,
  latitude: Number(data.latitude) || 10.7905,
  longitude: Number(data.longitude) || 78.7047,
  createdAt: data.createdAt,
  isDemo,
});

/**
 * Fetch ecosystem warehouses from backend persistent store (includes admin-created facilities).
 */
const fetchBackendEcosystemWarehouses = async (): Promise<Warehouse[]> => {
  const base = getApiBaseUrl();
  if (!base) return [];
  try {
    const res = await fetchWithTimeout(`${base}/ecosystem/warehouses?limit=100`, {}, 3000);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((w: any) => normalizeWarehouseDoc(w.id, w, false));
      }
    }
  } catch (err) {
    // backend offline
  }
  return [];
};

/**
 * Merges Firestore real-time facilities with backend warehouses.
 */
const mergeWarehouses = (firestoreWh: Warehouse[], backendWh: Warehouse[]): Warehouse[] => {
  const map = new Map<string, Warehouse>();
  for (const b of backendWh) {
    map.set(b.id, b);
  }
  for (const f of firestoreWh) {
    map.set(f.id, f);
  }
  const merged = Array.from(map.values());
  return merged.length > 0 ? merged : DEMO_WAREHOUSES.map((w) => ({ ...w, isDemo: true }));
};

/**
 * Real-time listener for all available warehouses.
 * Unifies Firestore real-time facilities with admin-created storage facilities.
 */
export const subscribeToWarehouses = (
  onUpdate: (warehouses: Warehouse[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const whRef = collection(db, WAREHOUSES_COLLECTION);
  const q = query(whRef, orderBy('createdAt', 'desc'));

  let latestBackendWh: Warehouse[] = [];

  fetchBackendEcosystemWarehouses().then((bWh) => {
    latestBackendWh = bWh;
    if (latestBackendWh.length > 0) {
      onUpdate(mergeWarehouses([], latestBackendWh));
    }
  });

  const handleSnapshot = (snapshot: any) => {
    let firestoreWh: Warehouse[] = [];
    if (snapshot.docs && snapshot.docs.length > 0) {
      firestoreWh = snapshot.docs.map((d: any) =>
        normalizeWarehouseDoc(d.id, d.data(), false)
      );
    }
    onUpdate(mergeWarehouses(firestoreWh, latestBackendWh));
  };

  return onSnapshot(
    q,
    handleSnapshot,
    (err) => {
      // Fallback query without orderBy if composite index is pending
      const fallbackUnsub = onSnapshot(
        whRef,
        handleSnapshot,
        (fallbackErr) => {
          console.warn('[warehouseService] Query error, supplying demo facilities:', fallbackErr.message);
          onUpdate(DEMO_WAREHOUSES.map((w) => ({ ...w, isDemo: true })));
          if (onError) onError(fallbackErr);
        }
      );
      return fallbackUnsub;
    }
  );
};

/**
 * Real-time listener for warehouses owned by the current user.
 */
export const subscribeToMyWarehouses = (
  ownerId: string,
  onUpdate: (warehouses: Warehouse[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const whRef = collection(db, WAREHOUSES_COLLECTION);
  const q = query(whRef, where('ownerId', '==', ownerId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const warehouses: Warehouse[] = snapshot.docs.map((d) =>
          normalizeWarehouseDoc(d.id, d.data(), false)
        );
        onUpdate(warehouses);
      } else {
        // Provide demo facility slots for testing
        onUpdate(DEMO_WAREHOUSES.slice(0, 2).map((w) => ({ ...w, ownerId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[warehouseService] MyWarehouses query error, using fallback:', err);
      onUpdate(DEMO_WAREHOUSES.slice(0, 2).map((w) => ({ ...w, ownerId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Add a new warehouse slot (Warehouse Owner action).
 */
export const addWarehouse = async (input: CreateWarehouseInput): Promise<string> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be authenticated to add a warehouse.');
  }

  const docRef = await addDoc(collection(db, WAREHOUSES_COLLECTION), {
    ownerId: user.uid,
    warehouseName: input.warehouseName.trim(),
    capacity: Number(input.capacity),
    availableSpace: Number(input.availableSpace !== undefined ? input.availableSpace : input.capacity),
    ratePerDay: Number(input.ratePerDay),
    location: input.location.trim(),
    latitude: input.latitude || 10.7905,
    longitude: input.longitude || 78.7047,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

/**
 * Create a storage booking request (Farmer action).
 */
export const createWarehouseBooking = async (
  input: CreateWarehouseBookingInput
): Promise<string> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be authenticated to book storage.');
  }

  // Fetch warehouse to verify available space and calculate price
  const whDoc = await getDoc(doc(db, WAREHOUSES_COLLECTION, input.warehouseId));
  if (!whDoc.exists()) {
    throw new Error('Selected warehouse was not found.');
  }

  const whData = whDoc.data();
  const ratePerDay = Number(whData.ratePerDay) || 0;
  const totalPrice = ratePerDay * input.quantity * input.days;
  const ownerId = whData.ownerId || input.ownerId || '';

  const bookingRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    warehouseId: input.warehouseId,
    ownerId: ownerId,
    farmerId: user.uid,
    farmerName: user.displayName || user.email?.split('@')[0] || 'Farmer',
    farmerEmail: user.email || '',
    quantity: Number(input.quantity),
    days: Number(input.days),
    totalPrice: totalPrice,
    status: 'requested' as WarehouseBookingStatus,
    warehouseName: whData.warehouseName || input.warehouseName || 'Warehouse',
    location: whData.location || input.location || '',
    createdAt: serverTimestamp(),
  });

  // Notify warehouse owner
  if (ownerId) {
    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        userId: ownerId,
        title: 'New Storage Request',
        body: `Farmer requested ${input.quantity}T storage for ${input.days} days.`,
        read: false,
        createdAt: serverTimestamp(),
        meta: { bookingId: bookingRef.id, warehouseId: input.warehouseId },
      });
    } catch (_) {
      // Non-critical notification failure
    }
  }

  return bookingRef.id;
};

/**
 * Real-time listener for storage bookings created by a specific farmer.
 */
export const subscribeToFarmerWarehouseBookings = (
  farmerId: string,
  onUpdate: (bookings: WarehouseBooking[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(
    bookingsRef,
    where('farmerId', '==', farmerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const bookings: WarehouseBooking[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            warehouseId: data.warehouseId || '',
            ownerId: data.ownerId,
            farmerId: data.farmerId,
            farmerName: data.farmerName || 'Farmer',
            farmerEmail: data.farmerEmail,
            quantity: Number(data.quantity) || 0,
            days: Number(data.days) || 1,
            totalPrice: Number(data.totalPrice) || 0,
            status: (data.status as WarehouseBookingStatus) || 'requested',
            warehouseName: data.warehouseName,
            location: data.location,
            createdAt: data.createdAt,
            isDemo: false,
          };
        });
        bookings.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        onUpdate(bookings);
      } else {
        onUpdate(DEMO_STORAGE_BOOKINGS.slice(0, 2).map((b) => ({ ...b, farmerId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[warehouseService] Farmer bookings query error, using fallback:', err);
      onUpdate(DEMO_STORAGE_BOOKINGS.slice(0, 2).map((b) => ({ ...b, farmerId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Real-time listener for incoming bookings for a warehouse owner.
 */
export const subscribeToOwnerWarehouseBookings = (
  ownerId: string,
  onUpdate: (bookings: WarehouseBooking[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(bookingsRef, where('ownerId', '==', ownerId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.docs && snapshot.docs.length > 0) {
        const bookings: WarehouseBooking[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            warehouseId: data.warehouseId || '',
            ownerId: data.ownerId,
            farmerId: data.farmerId,
            farmerName: data.farmerName || 'Farmer',
            farmerEmail: data.farmerEmail,
            quantity: Number(data.quantity) || 0,
            days: Number(data.days) || 1,
            totalPrice: Number(data.totalPrice) || 0,
            status: (data.status as WarehouseBookingStatus) || 'requested',
            warehouseName: data.warehouseName,
            location: data.location,
            createdAt: data.createdAt,
            isDemo: false,
          };
        });
        bookings.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        onUpdate(bookings);
      } else {
        onUpdate(DEMO_STORAGE_BOOKINGS.map((b) => ({ ...b, ownerId, isDemo: true })));
      }
    },
    (err) => {
      console.warn('[warehouseService] Owner bookings query error, using fallback:', err);
      onUpdate(DEMO_STORAGE_BOOKINGS.map((b) => ({ ...b, ownerId, isDemo: true })));
      if (onError) onError(err);
    }
  );
};

/**
 * Update warehouse booking status (Accept / Reject / Stored) with atomic capacity adjustment.
 */
export const updateWarehouseBookingStatus = async (
  bookingId: string,
  newStatus: WarehouseBookingStatus,
  bookingData?: Partial<WarehouseBooking>
): Promise<void> => {
  const db = getFirebaseFirestore();
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  // If accepting, execute transaction to deduct available capacity from the warehouse
  if (newStatus === 'accepted') {
    await runTransaction(db, async (transaction) => {
      const bDoc = await transaction.get(bookingRef);
      if (!bDoc.exists()) {
        throw new Error('Booking not found.');
      }
      const bData = bDoc.data();
      const warehouseId = bData.warehouseId;
      const quantity = Number(bData.quantity) || 0;

      if (warehouseId) {
        const whRef = doc(db, WAREHOUSES_COLLECTION, warehouseId);
        const whDoc = await transaction.get(whRef);
        if (whDoc.exists()) {
          const currentAvail = Number(whDoc.data().availableSpace !== undefined ? whDoc.data().availableSpace : whDoc.data().capacity) || 0;
          const nextAvail = Math.max(0, currentAvail - quantity);
          transaction.update(whRef, { availableSpace: nextAvail });
        }
      }

      transaction.update(bookingRef, { status: newStatus });
    });
  } else {
    await updateDoc(bookingRef, { status: newStatus });
  }

  // Send status update notification to the farmer
  const farmerId = bookingData?.farmerId;
  if (farmerId) {
    try {
      const statusTitle =
        newStatus === 'accepted'
          ? 'Storage Booking Approved'
          : newStatus === 'rejected'
          ? 'Storage Booking Declined'
          : 'Crops Stored Successfully';

      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        userId: farmerId,
        title: statusTitle,
        body: `Your storage booking for ${bookingData.warehouseName || 'warehouse'} is marked as ${newStatus}.`,
        read: false,
        createdAt: serverTimestamp(),
        meta: { bookingId, status: newStatus },
      });
    } catch (_) {
      // Ignore notification failures
    }
  }
};
