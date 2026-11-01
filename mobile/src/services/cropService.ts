import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { CropPost, CreateCropPostInput } from '../types/crop';
import { DEMO_CROPS } from '../data/demoDatasets';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout } from '../utils/networkUtil';

const POSTS_COLLECTION = 'posts';

/**
 * Normalizes document data from Firestore or Backend into typed CropPost.
 * Handles legacy and cross-platform field name variations.
 */
const normalizeCropDoc = (id: string, data: any, isDemo: boolean = false): CropPost => {
  return {
    id,
    userId: data.userId || data.farmerId || '',
    userName: data.userName || data.farmerName || 'Farmer',
    cropName: data.cropName || data.crop || data.name || 'Crop Produce',
    capacity: data.capacity || (data.quantity ? `${data.quantity} ${data.unit || 'Kg'}` : '500 Kg'),
    rate: data.rate !== undefined ? data.rate : data.price !== undefined ? data.price : '30',
    quality: data.quality || 'A',
    location: data.location || data.mandi || 'Tamil Nadu',
    imageUrl: data.imageUrl || data.image || null,
    createdAt: data.createdAt,
    category: data.category,
    district: data.district,
    variety: data.variety,
    isDemo,
  };
};

/**
 * Fetch ecosystem crops from backend persistent store (includes admin-created crops).
 */
const fetchBackendEcosystemCrops = async (): Promise<CropPost[]> => {
  const base = getApiBaseUrl();
  if (!base) return [];
  try {
    const res = await fetchWithTimeout(`${base}/ecosystem/crops?limit=100`, {}, 3000);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((c: any) => normalizeCropDoc(c.id, c, false));
      }
    }
  } catch (err) {
    // backend offline or unreachable
  }
  return [];
};

/**
 * Merges Firestore real-time documents with backend crops (deduplicated by ID).
 */
const mergeCrops = (firestorePosts: CropPost[], backendPosts: CropPost[]): CropPost[] => {
  const map = new Map<string, CropPost>();
  for (const b of backendPosts) {
    map.set(b.id, b);
  }
  for (const f of firestorePosts) {
    map.set(f.id, f);
  }
  const merged = Array.from(map.values());
  return merged.length > 0 ? merged : DEMO_CROPS.map((c) => ({ ...c, isDemo: true }));
};

/**
 * Fetch all crop posts from Firestore collection 'posts' and backend ecosystem.
 * Falls back to demo dataset if collection is empty or offline.
 */
export const fetchCropPosts = async (): Promise<CropPost[]> => {
  const db = getFirebaseFirestore();
  const postsRef = collection(db, POSTS_COLLECTION);
  let firestorePosts: CropPost[] = [];

  try {
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      firestorePosts = snapshot.docs.map((d) => normalizeCropDoc(d.id, d.data(), false));
    }
  } catch (err) {
    try {
      const snapshot = await getDocs(postsRef);
      if (!snapshot.empty) {
        firestorePosts = snapshot.docs.map((d) => normalizeCropDoc(d.id, d.data(), false));
      }
    } catch (innerErr) {
      console.warn('[cropService] Error querying posts collection, using fallback:', innerErr);
    }
  }

  const backendPosts = await fetchBackendEcosystemCrops();
  return mergeCrops(firestorePosts, backendPosts);
};

/**
 * Real-time listener for all crop posts in the marketplace.
 * Unifies Firestore real-time farmer listings with backend admin-created crops.
 */
export const subscribeToCropPosts = (
  onUpdate: (posts: CropPost[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  let latestBackendPosts: CropPost[] = [];

  // Fetch backend crops initially to ensure Admin additions appear immediately
  fetchBackendEcosystemCrops().then((bPosts) => {
    latestBackendPosts = bPosts;
    if (latestBackendPosts.length > 0) {
      onUpdate(mergeCrops([], latestBackendPosts));
    }
  });

  const handleSnapshot = (snapshot: any) => {
    let firestorePosts: CropPost[] = [];
    if (snapshot.docs && snapshot.docs.length > 0) {
      firestorePosts = snapshot.docs.map((d: any) =>
        normalizeCropDoc(d.id, d.data(), false)
      );
    }
    onUpdate(mergeCrops(firestorePosts, latestBackendPosts));
  };

  return onSnapshot(
    q,
    handleSnapshot,
    (error) => {
      // If orderBy fails due to missing index or mixed types, fallback to unordered snapshot
      console.warn('[cropService] Realtime listener error, trying unindexed query:', error.message);
      const fallbackUnsub = onSnapshot(
        postsRef,
        handleSnapshot,
        (fallbackErr) => {
          console.warn('[cropService] Unordered query also failed, supplying demo dataset:', fallbackErr.message);
          onUpdate(DEMO_CROPS.map((c) => ({ ...c, isDemo: true })));
          if (onError) onError(fallbackErr);
        }
      );
      return fallbackUnsub;
    }
  );
};

/**
 * Fetch crop posts created by a specific farmer.
 */
export const fetchMyCropPosts = async (userId: string): Promise<CropPost[]> => {
  const db = getFirebaseFirestore();
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, where('userId', '==', userId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => normalizeCropDoc(d.id, d.data(), false));
};

/**
 * Real-time listener for posts created by a specific user.
 */
export const subscribeToMyCropPosts = (
  userId: string,
  onUpdate: (posts: CropPost[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: CropPost[] = snapshot.docs.map((d) =>
        normalizeCropDoc(d.id, d.data(), false)
      );
      onUpdate(posts);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
};

/**
 * Fetch a single crop post by document ID from collection 'posts'.
 */
export const getCropPostById = async (id: string): Promise<CropPost | null> => {
  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, POSTS_COLLECTION, id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return normalizeCropDoc(snap.id, snap.data(), false);
    }
  } catch (err) {
    console.warn('[cropService] Failed to fetch doc from firestore:', err);
  }

  // Check demo catalog fallback
  const demoFound = DEMO_CROPS.find((c) => c.id === id);
  if (demoFound) {
    return { ...demoFound, isDemo: true };
  }

  return null;
};

/**
 * Create a new crop listing in collection 'posts'.
 * Preserves the exact Firestore schema used by the Flutter application.
 */
export const createCropPost = async (
  userId: string,
  userName: string,
  input: CreateCropPostInput
): Promise<string> => {
  const db = getFirebaseFirestore();
  const postsRef = collection(db, POSTS_COLLECTION);

  const docData = {
    userId,
    userName: userName || 'Farmer',
    cropName: input.cropName.trim(),
    capacity: input.capacity.trim(),
    rate: input.rate.trim(),
    quality: input.quality?.trim() || 'A',
    location: input.location.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(postsRef, docData);
  return docRef.id;
};

/**
 * Update an existing crop listing.
 */
export const updateCropPost = async (
  postId: string,
  input: Partial<CreateCropPostInput>
): Promise<void> => {
  const db = getFirebaseFirestore();
  const docRef = doc(db, POSTS_COLLECTION, postId);

  const updateData: Record<string, any> = {};
  if (input.cropName !== undefined) updateData.cropName = input.cropName.trim();
  if (input.capacity !== undefined) updateData.capacity = input.capacity.trim();
  if (input.rate !== undefined) updateData.rate = input.rate.trim();
  if (input.quality !== undefined) updateData.quality = input.quality.trim();
  if (input.location !== undefined) updateData.location = input.location.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl?.trim() || null;

  await updateDoc(docRef, updateData);
};

/**
 * Delete a crop listing from collection 'posts'.
 */
export const deleteCropPost = async (postId: string): Promise<void> => {
  const db = getFirebaseFirestore();
  const docRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(docRef);
};
