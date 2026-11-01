/**
 * Smart Uzhavan — Ecosystem Data Cloud Synchronization Tool
 * Safely migrates and synchronizes persistent ecosystem records
 * (crops, warehouses, vehicles, mandi prices, alerts) into Cloud Firestore.
 *
 * Uses stable IDs and idempotent setDoc (merge: true) to prevent duplicate documents.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/ecosystem_data.json');

console.log('====================================================');
console.log('🌾 Smart Uzhavan — Cloud Firestore Sync Tool');
console.log('====================================================');

if (!fs.existsSync(DATA_FILE)) {
  console.error(`❌ Source file not found: ${DATA_FILE}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

console.log(`Source records to sync:`);
console.log(`- Crops:         ${data.crops?.length || 0}`);
console.log(`- Vehicles:      ${data.vehicles?.length || 0}`);
console.log(`- Warehouses:    ${data.warehouses?.length || 0}`);
console.log(`- Market Prices: ${data.marketPrices?.length || 0}`);
console.log(`- Alerts:        ${data.alerts?.length || 0}`);
console.log('====================================================');

async function syncWithFirebaseAdmin() {
  const admin = await import('firebase-admin');
  const { getFirebaseAdminState } = await import('../src/config/firebase.js');
  const state = getFirebaseAdminState();

  if (!state.isConfigured) {
    console.log('[Notice] Firebase Admin credentials not set in backend/.env.');
    console.log('To synchronize directly using Firebase Admin:');
    console.log('1. Download service account JSON from Firebase Console > Project Settings > Service Accounts');
    console.log('2. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json in backend/.env');
    console.log('3. Run: node scripts/syncToFirestore.js');
    console.log('====================================================');
    return false;
  }

  const db = admin.default.firestore();
  console.log(`[Firestore Admin] Syncing to project: ${state.projectId}...`);

  // Batch sync crops to 'posts'
  const cropBatch = db.batch();
  for (const crop of (data.crops || [])) {
    const ref = db.collection('posts').doc(crop.id);
    cropBatch.set(ref, {
      ...crop,
      userId: crop.userId || crop.farmerId || 'admin_smart_uzhavan',
      userName: crop.userName || crop.farmerName || 'Smart Uzhavan Catalog',
      cropName: crop.cropName || crop.name,
      updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await cropBatch.commit();
  console.log(`✅ Synced ${data.crops.length} crops to 'posts' collection`);

  // Batch sync warehouses to 'warehouses'
  const whBatch = db.batch();
  for (const wh of (data.warehouses || [])) {
    const ref = db.collection('warehouses').doc(wh.id);
    whBatch.set(ref, {
      ...wh,
      ownerId: wh.ownerId || 'admin_smart_uzhavan',
      updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await whBatch.commit();
  console.log(`✅ Synced ${data.warehouses.length} warehouses to 'warehouses' collection`);

  // Batch sync vehicles to 'vehicles'
  const vehBatch = db.batch();
  for (const veh of (data.vehicles || [])) {
    const ref = db.collection('vehicles').doc(veh.id);
    vehBatch.set(ref, {
      ...veh,
      ownerId: veh.ownerId || 'admin_smart_uzhavan',
      updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await vehBatch.commit();
  console.log(`✅ Synced ${data.vehicles.length} vehicles to 'vehicles' collection`);

  // Batch sync alerts
  const alertBatch = db.batch();
  for (const alert of (data.alerts || [])) {
    const ref = db.collection('alerts').doc(alert.id);
    alertBatch.set(ref, {
      ...alert,
      updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await alertBatch.commit();
  console.log(`✅ Synced ${data.alerts.length} bulletins to 'alerts' collection`);

  // Batch sync market prices
  const priceBatch = db.batch();
  for (const mp of (data.marketPrices || [])) {
    const ref = db.collection('market_prices').doc(mp.id);
    priceBatch.set(ref, {
      ...mp,
      updatedAt: admin.default.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  await priceBatch.commit();
  console.log(`✅ Synced ${data.marketPrices.length} benchmark quotes to 'market_prices' collection`);

  console.log('🎉 Cloud Firestore synchronization completed successfully!');
  return true;
}

syncWithFirebaseAdmin().catch((err) => {
  console.error('❌ Cloud Firestore sync encountered an error:', err.message);
});
