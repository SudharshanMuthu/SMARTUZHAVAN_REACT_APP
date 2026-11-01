/**
 * Seed script for Smart Uzhavan Backend
 * Safe and idempotent. Populates 53 Tamil Nadu crops, 30 transport listings,
 * 12 district warehouses, 15 role-targeted alerts, and APMC mandi market prices.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SEED_CROPS,
  SEED_VEHICLES,
  SEED_WAREHOUSES,
  SEED_ALERTS,
  SEED_MARKET_PRICES,
} from './src/data/seedData.js';
import { ecosystemStore } from './src/data/ecosystemStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'ecosystem_data.json');

console.log('====================================================');
console.log('🌾 Smart Uzhavan — Ecosystem Data Seeding');
console.log('====================================================');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Force re-seed / refresh
  ecosystemStore.crops = [...SEED_CROPS];
  ecosystemStore.vehicles = [...SEED_VEHICLES];
  ecosystemStore.warehouses = [...SEED_WAREHOUSES];
  ecosystemStore.alerts = [...SEED_ALERTS];
  ecosystemStore.marketPrices = [...SEED_MARKET_PRICES];
  ecosystemStore.appContent = {
    cropCategories: ['Cereals', 'Pulses', 'Spices', 'Fruits', 'Vegetables', 'Oilseeds', 'Commercial Crops'],
    districts: [
      'Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore', 'Thanjavur',
      'Dindigul', 'Tirunelveli', 'Namakkal', 'Krishnagiri', 'Cuddalore', 'Theni', 'Dharmapuri', 'Vellore'
    ],
  };
  ecosystemStore.persist();

  console.log(`✅ Crops Seeded:          ${SEED_CROPS.length} items (Across 15+ TN districts)`);
  console.log(`✅ Transport Fleet:        ${SEED_VEHICLES.length} vehicles (6 vehicle categories)`);
  console.log(`✅ Warehouses:             ${SEED_WAREHOUSES.length} facilities (Cold, Dry, Silo)`);
  console.log(`✅ Role-Targeted Alerts:   ${SEED_ALERTS.length} bulletins (Farmer, Buyer, Transporter, WH)`);
  console.log(`✅ APMC Mandi Benchmarks:  ${SEED_MARKET_PRICES.length} price quotes`);
  console.log(`📁 Persistence Target:     ${DATA_FILE}`);
  console.log('====================================================');
  console.log('🎉 Seeding completed successfully!');
} catch (err) {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
}
