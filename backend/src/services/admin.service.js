import { getAdminFirestore, getFirebaseAdminState } from '../config/firebase.js';
import { getAiHealthStatus } from './ai.service.js';
import { getWeatherHealthStatus } from './weather.service.js';
import { getMarketHealthStatus } from './market.service.js';
import { getAlertsHealthStatus } from './alerts.service.js';
import { ecosystemStore } from '../data/ecosystemStore.js';

const AUDIT_LOGS_COLLECTION = 'admin_audit_logs';

/**
 * Helper to record administrative actions into Firestore and local audit log.
 */
export const recordAuditLog = async ({ action, targetId, targetType, details, adminEmail }) => {
  ecosystemStore.addAuditLog({
    action,
    targetId,
    targetType,
    details,
    performedBy: adminEmail,
  });

  try {
    const adminState = getFirebaseAdminState();
    if (!adminState.isConfigured) return;

    const db = getAdminFirestore();
    await db.collection(AUDIT_LOGS_COLLECTION).add({
      action,
      targetId,
      targetType,
      details,
      performedBy: adminEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Admin Audit] Failed to write Firestore audit record:', err.message);
  }
};

/**
 * Aggregates actual system statistics across all primary collections.
 * Uses Firestore if configured, otherwise falls back to persistent ecosystemStore.
 */
export const getSystemStats = async () => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getSystemStats();
  }

  try {
    const db = getAdminFirestore();

    const [
      usersSnap,
      postsSnap,
      whSnap,
      vehiclesSnap,
      whBookingsSnap,
      ordersSnap,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('posts').get(),
      db.collection('warehouses').get(),
      db.collection('vehicles').get(),
      db.collection('warehouseBookings').get(),
      db.collection('orders').get(),
    ]);

    let farmers = 0;
    let buyers = 0;
    let transporters = 0;
    let warehouseOwners = 0;
    let blockedUsers = 0;

    usersSnap.forEach((doc) => {
      const data = doc.data();
      const role = (data.role || '').toLowerCase();
      if (role === 'farmer') farmers++;
      else if (role === 'buyer') buyers++;
      else if (role === 'transporter') transporters++;
      else if (role === 'warehouse') warehouseOwners++;
      if (data.blocked === true) blockedUsers++;
    });

    let pendingStorageBookings = 0;
    whBookingsSnap.forEach((doc) => {
      const status = (doc.data().status || '').toLowerCase();
      if (status === 'pending' || status === 'requested') pendingStorageBookings++;
    });

    let pendingTransportBookings = 0;
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.type === 'transport' && (data.status || '').toLowerCase() === 'requested') {
        pendingTransportBookings++;
      }
    });

    return {
      isConfigured: true,
      stats: {
        totalUsers: usersSnap.size,
        farmers,
        buyers,
        transporters,
        warehouses: warehouseOwners,
        blockedUsers,
        totalPosts: postsSnap.size,
        totalWarehouses: whSnap.size,
        totalVehicles: vehiclesSnap.size,
        pendingStorageBookings,
        pendingTransportBookings,
        totalOrders: ordersSnap.size,
      },
    };
  } catch (err) {
    console.warn('[Admin Service] Firestore stats query failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getSystemStats();
  }
};

/**
 * List registered platform users.
 */
export const listUsers = async ({ role, search, limit = 50 }) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getUsers({ role, search, limit });
  }

  try {
    const db = getAdminFirestore();
    let query = db.collection('users');

    if (role && role !== 'all') {
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      query = query.where('role', '==', formattedRole);
    }

    const snapshot = await query.limit(Number(limit) || 50).get();
    const searchLower = (search || '').trim().toLowerCase();

    const users = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user) => {
        if (!searchLower) return true;
        const nameMatch = (user.name || '').toLowerCase().includes(searchLower);
        const emailMatch = (user.email || '').toLowerCase().includes(searchLower);
        const phoneMatch = (user.phone || '').toLowerCase().includes(searchLower);
        return nameMatch || emailMatch || phoneMatch;
      });

    return users.length > 0 ? users : ecosystemStore.getUsers({ role, search, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore user list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getUsers({ role, search, limit });
  }
};

/**
 * Block or unblock a user.
 */
export const toggleUserBlock = async (userId, blocked, adminEmail) => {
  ecosystemStore.toggleUserBlock(userId, blocked, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          blocked: Boolean(blocked),
          status: blocked ? 'blocked' : 'active',
          updatedAt: new Date().toISOString(),
          blockedBy: blocked ? adminEmail : null,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore user block update failed:', err.message);
  }

  await recordAuditLog({
    action: blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    targetId: userId,
    targetType: 'user',
    details: { blocked },
    adminEmail,
  });

  return { id: userId, blocked: Boolean(blocked) };
};

/**
 * List crop listings.
 */
export const listCropListings = async ({ crop, location, search, limit = 50 }) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getCrops({ crop, location, search, limit });
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('posts').limit(Number(limit) || 50).get();
    const searchLower = (search || '').trim().toLowerCase();

    const posts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((post) => {
        if (crop && crop !== 'all' && post.cropName?.toLowerCase() !== crop.toLowerCase()) return false;
        if (location && location !== 'all' && post.location?.toLowerCase() !== location.toLowerCase()) return false;
        if (searchLower) {
          const cropMatch = (post.cropName || '').toLowerCase().includes(searchLower);
          const userMatch = (post.userName || '').toLowerCase().includes(searchLower);
          const locMatch = (post.location || '').toLowerCase().includes(searchLower);
          if (!cropMatch && !userMatch && !locMatch) return false;
        }
        return true;
      });

    return posts.length > 0 ? posts : ecosystemStore.getCrops({ crop, location, search, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore posts list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getCrops({ crop, location, search, limit });
  }
};

/**
 * Delete crop listing with audit logging.
 */
export const deleteCropListing = async (postId, reason, adminEmail) => {
  ecosystemStore.deleteCrop(postId, reason, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const postRef = db.collection('posts').doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        await postRef.delete();
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore post deletion failed:', err.message);
  }

  await recordAuditLog({
    action: 'POST_DELETED',
    targetId: postId,
    targetType: 'post',
    details: { reason: reason || 'Moderation deletion' },
    adminEmail,
  });

  return { success: true, deletedPostId: postId };
};

/**
 * Get comprehensive health status of backend integration services.
 */
export const getServicesHealth = async () => {
  const adminState = getFirebaseAdminState();
  const aiStatus = getAiHealthStatus();
  const weatherStatus = getWeatherHealthStatus();
  const marketStatus = getMarketHealthStatus();
  const alertsStatus = getAlertsHealthStatus();

  return {
    timestamp: new Date().toISOString(),
    firebaseAdmin: {
      status: adminState.status,
      isConfigured: adminState.isConfigured,
      projectId: adminState.projectId,
      missingKeys: adminState.missingKeys,
    },
    aiService: aiStatus,
    weatherService: weatherStatus,
    marketService: marketStatus,
    alertsService: alertsStatus,
  };
};

/**
 * Fetch recent audit logs.
 */
export const getAuditLogs = async (limit = 30) => {
  return ecosystemStore.getAuditLogs(limit);
};

/**
 * Get detailed profile for a single user.
 */
export const getUserDetails = async (userId) => {
  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        const [postsSnap, ordersSnap, whSnap, vehSnap] = await Promise.all([
          db.collection('posts').where('userId', '==', userId).get().catch(() => ({ docs: [] })),
          db.collection('orders').where('buyerId', '==', userId).get().catch(() => ({ docs: [] })),
          db.collection('warehouses').where('ownerId', '==', userId).get().catch(() => ({ docs: [] })),
          db.collection('vehicles').where('ownerId', '==', userId).get().catch(() => ({ docs: [] })),
        ]);
        return {
          ...userData,
          listingsCount: postsSnap.docs?.length || 0,
          ordersCount: ordersSnap.docs?.length || 0,
          warehousesCount: whSnap.docs?.length || 0,
          vehiclesCount: vehSnap.docs?.length || 0,
        };
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore getUserDetails failed:', err.message);
  }

  return ecosystemStore.getUserDetails(userId);
};

/**
 * Update permitted user profile fields.
 */
export const updateUserProfile = async (userId, updates, adminEmail) => {
  const updated = ecosystemStore.updateUserProfile(userId, updates, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateUserProfile failed:', err.message);
  }

  await recordAuditLog({
    action: 'USER_PROFILE_UPDATED',
    targetId: userId,
    targetType: 'user',
    details: updates,
    adminEmail,
  });

  return updated;
};

/**
 * Create a new crop listing.
 */
export const createCropListing = async (data, adminEmail) => {
  const newCrop = ecosystemStore.addCrop(data, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('posts').doc(newCrop.id).set({
        ...newCrop,
        createdAt: new Date().toISOString(),
        createdBy: adminEmail,
        status: newCrop.status || 'active',
      });
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore createCropListing failed:', err.message);
  }

  await recordAuditLog({
    action: 'POST_CREATED',
    targetId: newCrop.id,
    targetType: 'post',
    details: { cropName: newCrop.cropName, price: newCrop.price },
    adminEmail,
  });

  return newCrop;
};

/**
 * Update existing crop listing.
 */
export const updateCropListing = async (postId, updates, adminEmail) => {
  const updated = ecosystemStore.updateCrop(postId, updates, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const postRef = db.collection('posts').doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        await postRef.update({
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateCropListing failed:', err.message);
  }

  await recordAuditLog({
    action: 'POST_UPDATED',
    targetId: postId,
    targetType: 'post',
    details: updates,
    adminEmail,
  });

  return updated;
};

/**
 * List warehouses.
 */
export const listWarehouses = async ({ search, limit = 50 } = {}) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getWarehouses({ search, limit });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('warehouses').limit(Number(limit) || 50).get();
    const searchLower = (search || '').trim().toLowerCase();

    const warehouses = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((w) => {
        if (!searchLower) return true;
        const name = (w.warehouseName || w.name || '').toLowerCase();
        const loc = (w.location || '').toLowerCase();
        return name.includes(searchLower) || loc.includes(searchLower);
      });

    return warehouses.length > 0 ? warehouses : ecosystemStore.getWarehouses({ search, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore warehouses list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getWarehouses({ search, limit });
  }
};

/**
 * Create a warehouse facility.
 */
export const createWarehouse = async (data, adminEmail) => {
  const newWh = ecosystemStore.addWarehouse(data, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('warehouses').doc(newWh.id).set({
        ...newWh,
        createdAt: new Date().toISOString(),
        createdBy: adminEmail,
        status: newWh.status || 'active',
      });
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore createWarehouse failed:', err.message);
  }

  await recordAuditLog({
    action: 'WAREHOUSE_CREATED',
    targetId: newWh.id,
    targetType: 'warehouse',
    details: { name: newWh.warehouseName || newWh.name, capacity: newWh.capacity },
    adminEmail,
  });

  return newWh;
};

/**
 * Update a warehouse facility.
 */
export const updateWarehouse = async (whId, updates, adminEmail) => {
  const updated = ecosystemStore.updateWarehouse(whId, updates, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const whRef = db.collection('warehouses').doc(whId);
      const whDoc = await whRef.get();
      if (whDoc.exists) {
        await whRef.update({
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateWarehouse failed:', err.message);
  }

  await recordAuditLog({
    action: 'WAREHOUSE_UPDATED',
    targetId: whId,
    targetType: 'warehouse',
    details: updates,
    adminEmail,
  });

  return updated;
};

/**
 * Delete a warehouse facility.
 */
export const deleteWarehouse = async (whId, adminEmail) => {
  ecosystemStore.deleteWarehouse(whId, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const whRef = db.collection('warehouses').doc(whId);
      const whDoc = await whRef.get();
      if (whDoc.exists) {
        await whRef.delete();
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore deleteWarehouse failed:', err.message);
  }

  await recordAuditLog({
    action: 'WAREHOUSE_DELETED',
    targetId: whId,
    targetType: 'warehouse',
    details: { id: whId },
    adminEmail,
  });

  return { success: true, deletedId: whId };
};

/**
 * List vehicles from collection `vehicles`.
 */
export const listVehicles = async ({ vehicleType, location, search, limit = 50 } = {}) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getVehicles({ vehicleType, location, search, limit });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('vehicles').limit(Number(limit) || 50).get();
    const searchLower = (search || '').trim().toLowerCase();

    const vehicles = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((v) => {
        if (!searchLower) return true;
        const name = (v.ownerName || v.name || '').toLowerCase();
        const num = (v.vehicleNumber || v.number || '').toLowerCase();
        const loc = (v.location || v.baseLocation || '').toLowerCase();
        return name.includes(searchLower) || num.includes(searchLower) || loc.includes(searchLower);
      });

    return vehicles.length > 0 ? vehicles : ecosystemStore.getVehicles({ vehicleType, location, search, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore vehicles list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getVehicles({ vehicleType, location, search, limit });
  }
};

/**
 * Create a vehicle in `vehicles`.
 */
export const createVehicle = async (data, adminEmail) => {
  const newVeh = ecosystemStore.addVehicle(data, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('vehicles').doc(newVeh.id).set({
        ...newVeh,
        createdAt: new Date().toISOString(),
        createdBy: adminEmail,
      });
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore createVehicle failed:', err.message);
  }

  await recordAuditLog({
    action: 'VEHICLE_CREATED',
    targetId: newVeh.id,
    targetType: 'vehicle',
    details: { vehicleNumber: newVeh.vehicleNumber, vehicleType: newVeh.vehicleType },
    adminEmail,
  });

  return newVeh;
};

/**
 * Update vehicle in `vehicles`.
 */
export const updateVehicle = async (vehId, updates, adminEmail) => {
  const updated = ecosystemStore.updateVehicle(vehId, updates, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const vehRef = db.collection('vehicles').doc(vehId);
      const vehDoc = await vehRef.get();
      if (vehDoc.exists) {
        await vehRef.update({
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateVehicle failed:', err.message);
  }

  await recordAuditLog({
    action: 'VEHICLE_UPDATED',
    targetId: vehId,
    targetType: 'vehicle',
    details: updates,
    adminEmail,
  });

  return updated;
};

/**
 * Delete a vehicle.
 */
export const deleteVehicle = async (vehId, adminEmail) => {
  ecosystemStore.deleteVehicle(vehId, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const vehRef = db.collection('vehicles').doc(vehId);
      const vehDoc = await vehRef.get();
      if (vehDoc.exists) {
        await vehRef.delete();
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore deleteVehicle failed:', err.message);
  }

  await recordAuditLog({
    action: 'VEHICLE_DELETED',
    targetId: vehId,
    targetType: 'vehicle',
    details: { id: vehId },
    adminEmail,
  });

  return { success: true, deletedId: vehId };
};

/**
 * List orders from `orders`.
 */
export const listOrders = async ({ type, status, limit = 50 } = {}) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getOrders({ type, status, limit });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('orders').limit(Number(limit) || 50).get();

    const orders = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((o) => {
        if (type && type !== 'all') {
          const orderType = o.type || 'crop';
          if (orderType.toLowerCase() !== type.toLowerCase()) return false;
        }
        if (status && status !== 'all') {
          if ((o.status || '').toLowerCase() !== status.toLowerCase()) return false;
        }
        return true;
      });

    return orders.length > 0 ? orders : ecosystemStore.getOrders({ type, status, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore orders list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getOrders({ type, status, limit });
  }
};

/**
 * Update order status in `orders`.
 */
export const updateOrderStatus = async (orderId, status, adminEmail) => {
  const updated = ecosystemStore.updateOrderStatus(orderId, status, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        await orderRef.update({
          status,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateOrderStatus failed:', err.message);
  }

  await recordAuditLog({
    action: 'ORDER_STATUS_UPDATED',
    targetId: orderId,
    targetType: 'order',
    details: { newStatus: status },
    adminEmail,
  });

  return updated;
};

/**
 * List storage bookings from `warehouseBookings`.
 */
export const listStorageBookings = async ({ status, limit = 50 } = {}) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getStorageBookings({ status, limit });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('warehouseBookings').limit(Number(limit) || 50).get();

    const bookings = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((b) => {
        if (status && status !== 'all') {
          if ((b.status || '').toLowerCase() !== status.toLowerCase()) return false;
        }
        return true;
      });

    return bookings.length > 0 ? bookings : ecosystemStore.getStorageBookings({ status, limit });
  } catch (err) {
    console.warn('[Admin Service] Firestore storage bookings list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getStorageBookings({ status, limit });
  }
};

/**
 * Update storage booking status in `warehouseBookings`.
 */
export const updateStorageBookingStatus = async (bookingId, status, adminEmail) => {
  const updated = ecosystemStore.updateStorageBookingStatus(bookingId, status, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const bookingRef = db.collection('warehouseBookings').doc(bookingId);
      const bookingDoc = await bookingRef.get();
      if (bookingDoc.exists) {
        await bookingRef.update({
          status,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: adminEmail,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore updateStorageBookingStatus failed:', err.message);
  }

  await recordAuditLog({
    action: 'STORAGE_BOOKING_STATUS_UPDATED',
    targetId: bookingId,
    targetType: 'storage_booking',
    details: { newStatus: status },
    adminEmail,
  });

  return updated;
};

/**
 * List market prices from collection `market_prices`.
 */
export const listMarketPrices = async () => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getMarketPrices();
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('market_prices').get();
    const prices = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return prices.length > 0 ? prices : ecosystemStore.getMarketPrices();
  } catch (err) {
    console.warn('[Admin Service] Firestore market prices failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getMarketPrices();
  }
};

/**
 * Add or update market price record.
 */
export const saveMarketPrice = async (priceData, adminEmail) => {
  const saved = ecosystemStore.saveMarketPrice(priceData, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const docRef = db.collection('market_prices').doc(saved.id);
      await docRef.set(saved, { merge: true });
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore saveMarketPrice failed:', err.message);
  }

  await recordAuditLog({
    action: priceData.id ? 'MARKET_PRICE_UPDATED' : 'MARKET_PRICE_CREATED',
    targetId: saved.id,
    targetType: 'market_price',
    details: { crop: saved.crop, mandi: saved.mandi, price: saved.modalPrice },
    adminEmail,
  });

  return saved;
};

/**
 * Delete market price record.
 */
export const deleteMarketPrice = async (priceId, adminEmail) => {
  ecosystemStore.deleteMarketPrice(priceId, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('market_prices').doc(priceId).delete();
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore deleteMarketPrice failed:', err.message);
  }

  await recordAuditLog({
    action: 'MARKET_PRICE_DELETED',
    targetId: priceId,
    targetType: 'market_price',
    details: { id: priceId },
    adminEmail,
  });

  return { success: true, deletedId: priceId };
};

/**
 * List agricultural alerts and notifications.
 */
export const listAlerts = async (params = {}) => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getAlerts(params);
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('alerts').get();
    const alerts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return alerts.length > 0 ? alerts : ecosystemStore.getAlerts(params);
  } catch (err) {
    console.warn('[Admin Service] Firestore alerts list failed, falling back to ecosystemStore:', err.message);
    return ecosystemStore.getAlerts(params);
  }
};

/**
 * Save agricultural alert.
 */
export const saveAlert = async (alertData, adminEmail) => {
  const saved = ecosystemStore.saveAlert(alertData, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      const docRef = db.collection('alerts').doc(saved.id);
      await docRef.set(saved, { merge: true });
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore saveAlert failed:', err.message);
  }

  await recordAuditLog({
    action: alertData.id ? 'ALERT_UPDATED' : 'ALERT_CREATED',
    targetId: saved.id,
    targetType: 'alert',
    details: { title: saved.titleEn, category: saved.category, targetAudience: saved.targetAudience },
    adminEmail,
  });

  return saved;
};

/**
 * Delete alert.
 */
export const deleteAlert = async (alertId, adminEmail) => {
  ecosystemStore.deleteAlert(alertId, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('alerts').doc(alertId).delete();
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore deleteAlert failed:', err.message);
  }

  await recordAuditLog({
    action: 'ALERT_DELETED',
    targetId: alertId,
    targetType: 'alert',
    details: { id: alertId },
    adminEmail,
  });

  return { success: true, deletedId: alertId };
};

/**
 * Fetch shared app content and configurations.
 */
export const getAppContent = async () => {
  const adminState = getFirebaseAdminState();
  if (!adminState.isConfigured) {
    return ecosystemStore.getAppContent();
  }

  try {
    const db = getAdminFirestore();
    const doc = await db.collection('app_config').doc('shared_content').get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore getAppContent failed:', err.message);
  }

  return ecosystemStore.getAppContent();
};

/**
 * Save shared app content.
 */
export const saveAppContent = async (content, adminEmail) => {
  ecosystemStore.saveAppContent(content, adminEmail);

  try {
    const adminState = getFirebaseAdminState();
    if (adminState.isConfigured) {
      const db = getAdminFirestore();
      await db.collection('app_config').doc('shared_content').set(
        {
          ...content,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[Admin Service] Firestore saveAppContent failed:', err.message);
  }

  await recordAuditLog({
    action: 'APP_CONTENT_UPDATED',
    targetId: 'shared_content',
    targetType: 'app_config',
    details: { keys: Object.keys(content) },
    adminEmail,
  });

  return content;
};
