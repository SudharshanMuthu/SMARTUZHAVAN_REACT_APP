import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SEED_CROPS,
  SEED_VEHICLES,
  SEED_WAREHOUSES,
  SEED_ALERTS,
} from '../src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../../mobile/src/data/demoDatasets.ts');

const content = `import { CropPost } from '../types/crop';
import { Warehouse, WarehouseBooking } from '../types/warehouse';
import { Vehicle, TransportOrder } from '../types/transport';
import { MandiPriceData } from '../types/weatherAndMarket';

/**
 * Verified Tamil Nadu Agricultural Demo Datasets.
 * Auto-synced with centralized ecosystem seed data.
 * Used as graceful fallbacks when Firestore collections are empty or offline during semester review.
 */

export const DEMO_CROPS: CropPost[] = ${JSON.stringify(SEED_CROPS, null, 2)};

export const DEMO_WAREHOUSES: Warehouse[] = ${JSON.stringify(SEED_WAREHOUSES, null, 2)};

export const DEMO_STORAGE_BOOKINGS: WarehouseBooking[] = [
  {
    id: 'demo_bk_1',
    warehouseId: 'wh_thanjavur_cauvery',
    warehouseName: 'Cauvery Modern Rice Silo & Cold Storage',
    farmerId: 'farmer_demo_1',
    farmerName: 'K. Muthuvel',
    farmerEmail: 'muthuvel.farmer@gmail.com',
    quantity: 150,
    days: 30,
    totalPrice: 4500,
    status: 'accepted',
    location: 'Thanjavur Bypass, Thanjavur',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'demo_bk_2',
    warehouseId: 'wh_erode_kongu',
    warehouseName: 'Kongu Agro Spices & Turmeric Warehouse',
    farmerId: 'farmer_demo_2',
    farmerName: 'S. Ramanathan',
    farmerEmail: 'ramanathan.farmer@gmail.com',
    quantity: 200,
    days: 45,
    totalPrice: 7200,
    status: 'requested',
    location: 'Perundurai Road, Erode',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'demo_bk_3',
    warehouseId: 'wh_dindigul_shallot',
    warehouseName: 'Dindigul Shallot & Vegetable Controlled Atmosphere Storage',
    farmerId: 'farmer_demo_3',
    farmerName: 'M. Chinnasamy',
    farmerEmail: 'chinnasamy.farmer@gmail.com',
    quantity: 120,
    days: 20,
    totalPrice: 3800,
    status: 'stored',
    location: 'Vedasandur Road, Dindigul',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
];

export const DEMO_VEHICLES: Vehicle[] = ${JSON.stringify(SEED_VEHICLES, null, 2)};

export const DEMO_TRANSPORT_ORDERS: TransportOrder[] = [
  {
    id: 'demo_ord_trip_1',
    type: 'transport',
    vehicleId: 'veh_namakkal_dost_01',
    vehicleName: 'Ashok Leyland Bada Dost i4',
    vehicleType: 'Pickup Truck',
    transporterId: 'transporter_namakkal_hub',
    requestedById: 'farmer_muthu_tny',
    requestedByName: 'K. Muthuvel (Farmer)',
    requestedByEmail: 'muthuvel.farmer@gmail.com',
    pickup: 'Lalgudi Primary Paddy Yard, Trichy',
    drop: 'Dindigul Wholesale Regulated Market',
    distanceKm: 142,
    weightTons: 2.2,
    price: 3408,
    status: 'on_trip',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'demo_ord_trip_2',
    type: 'transport',
    vehicleId: 'veh_erode_tata_intra',
    vehicleName: 'Tata Intra V30 Smart Loading Deck',
    vehicleType: 'Mini Truck',
    transporterId: 'transporter_kumar_erd',
    requestedById: 'farmer_ram_erd',
    requestedByName: 'S. Ramanathan (Farmer)',
    requestedByEmail: 'ramanathan.farmer@gmail.com',
    pickup: 'Perundurai Turmeric Santhai',
    drop: 'Chennai Koyambedu Wholesale Market',
    distanceKm: 395,
    weightTons: 1.5,
    price: 7110,
    status: 'requested',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'demo_ord_trip_3',
    type: 'transport',
    vehicleId: 'veh_eicher_pro_coimbatore',
    vehicleName: 'Eicher Pro 2049 Closed Cargo Bay',
    vehicleType: 'Medium LCV',
    transporterId: 'transporter_velu_cbe',
    requestedById: 'farmer_chinnasamy_mdu',
    requestedByName: 'M. Chinnasamy (Farmer)',
    requestedByEmail: 'chinnasamy.farmer@gmail.com',
    pickup: 'Dindigul Vegetable Yard',
    drop: 'Coimbatore Thiyagi Kumaran Market',
    distanceKm: 168,
    weightTons: 4.8,
    price: 5376,
    status: 'accepted',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
];

export const DEMO_BUYER_ORDERS = [
  {
    id: 'demo_buyer_ord_1',
    type: 'crop',
    cropName: 'Organic Ponni Paddy (Grade A)',
    farmerName: 'K. Muthuvel',
    farmerId: 'farmer_muthu_tny',
    rate: 34,
    quantity: 500,
    unit: 'kg',
    totalAmount: 17000,
    location: 'Trichy Mandi Hub',
    status: 'accepted',
    createdAt: { seconds: 1729980000, nanoseconds: 0 },
    isDemo: true,
  },
  {
    id: 'demo_buyer_ord_2',
    type: 'crop',
    cropName: 'Erode Double Polish Turmeric',
    farmerName: 'S. Ramanathan',
    farmerId: 'farmer_ram_erd',
    rate: 135,
    quantity: 200,
    unit: 'kg',
    totalAmount: 27000,
    location: 'Erode Regulated Market',
    status: 'placed',
    createdAt: { seconds: 1730000000, nanoseconds: 0 },
    isDemo: true,
  },
  {
    id: 'demo_buyer_ord_3',
    type: 'crop',
    cropName: 'Shivam Hybrid Red Tomato',
    farmerName: 'M. Chinnasamy',
    farmerId: 'farmer_chinnasamy_mdu',
    rate: 38,
    quantity: 350,
    unit: 'kg',
    totalAmount: 13300,
    location: 'Madurai Central Market',
    status: 'completed',
    createdAt: { seconds: 1729900000, nanoseconds: 0 },
    isDemo: true,
  },
];

export const DEMO_ALERTS = ${JSON.stringify(SEED_ALERTS, null, 2)};

export const DEMO_CROP_MANDI_PRICES: Record<string, { min: number; max: number; modal: number; variety: string }> = {
  Paddy: { min: 21.5, max: 24.5, modal: 23.0, variety: 'Ponni / Samba' },
  Tomato: { min: 34.0, max: 46.0, modal: 40.0, variety: 'Hybrid / Shivam' },
  Onion: { min: 42.0, max: 54.0, modal: 48.0, variety: 'Bellary / Shallots' },
  Chilli: { min: 110.0, max: 145.0, modal: 125.0, variety: 'G4 Long Spicy' },
  Brinjal: { min: 22.0, max: 32.0, modal: 27.0, variety: 'Salem Green Round' },
  Banana: { min: 26.0, max: 36.0, modal: 31.0, variety: 'Grand Naine Robusta' },
  Groundnut: { min: 72.0, max: 86.0, modal: 79.0, variety: 'TMV-7 Pods' },
  Sugarcane: { min: 3.2, max: 4.0, modal: 3.6, variety: 'Co-86032 Thick' },
  Cotton: { min: 66.0, max: 78.0, modal: 72.0, variety: 'MCU-5 Medium Staple' },
};
`;

fs.writeFileSync(targetPath, content, 'utf-8');
console.log(`Synced demoDatasets.ts successfully to: ${targetPath}`);
console.log(`- 53 Crops, 30 Vehicles, 15 Warehouses, ${SEED_ALERTS.length} Alerts.`);
