import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SEED_CROPS,
  SEED_VEHICLES,
  SEED_WAREHOUSES,
  SEED_ALERTS,
  SEED_MARKET_PRICES,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'ecosystem_data.json');

// Initial seed users for realistic demo platform experience
const SEED_USERS = [
  {
    id: 'usr_farmer_muthu',
    name: 'Muthukumar S.',
    email: 'muthu@smartuzhavan.in',
    phone: '+91 94431 82710',
    role: 'Farmer',
    location: 'Madurai, Tamil Nadu',
    farmSize: '4.5 Acres',
    cropsGrown: ['Paddy', 'Banana', 'Tomato'],
    status: 'active',
    createdAt: '2026-10-15T08:30:00Z',
  },
  {
    id: 'usr_farmer_kannan',
    name: 'Kannan R.',
    email: 'kannan@smartuzhavan.in',
    phone: '+91 98422 19340',
    role: 'Farmer',
    location: 'Thanjavur, Tamil Nadu',
    farmSize: '8 Acres',
    cropsGrown: ['Paddy (Ponni)', 'Sugarcane'],
    status: 'active',
    createdAt: '2026-10-16T09:15:00Z',
  },
  {
    id: 'usr_buyer_velan',
    name: 'Velan Traders (R. Velan)',
    email: 'buyer@velantraders.com',
    phone: '+91 98840 55120',
    role: 'Buyer',
    location: 'Koyambedu, Chennai',
    companyName: 'Velan Agro Commodities',
    status: 'active',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'usr_trans_kumar',
    name: 'Kumar Express Logistics',
    email: 'kumar@tntransport.com',
    phone: '+91 97910 44220',
    role: 'Transporter',
    location: 'Namakkal, Tamil Nadu',
    fleetCount: 6,
    status: 'active',
    createdAt: '2026-10-20T11:20:00Z',
  },
  {
    id: 'usr_wh_perumal',
    name: 'Perumal Agro Cold Storage',
    email: 'manager@perumalcold.com',
    phone: '+91 94420 33810',
    role: 'Warehouse',
    location: 'Dindigul, Tamil Nadu',
    capacityTons: 1500,
    status: 'active',
    createdAt: '2026-10-22T14:00:00Z',
  },
];

const SEED_ORDERS = [
  {
    id: 'ord_demo_101',
    type: 'crop',
    buyerId: 'usr_buyer_velan',
    buyerName: 'Velan Agro Commodities',
    buyerEmail: 'buyer@velantraders.com',
    sellerId: 'usr_farmer_muthu',
    farmerId: 'usr_farmer_muthu',
    farmerName: 'Muthukumar S.',
    cropName: 'Tomato (Hybrid Shivam)',
    variety: 'Hybrid Shivam F1',
    rate: 22,
    quantity: 500,
    unit: 'kg',
    totalAmount: 11000,
    location: 'Dindigul / Oddanchatram',
    status: 'accepted',
    createdAt: '2026-10-30T10:30:00Z',
  },
  {
    id: 'ord_demo_102',
    type: 'crop',
    buyerId: 'usr_buyer_velan',
    buyerName: 'Velan Agro Commodities',
    buyerEmail: 'buyer@velantraders.com',
    sellerId: 'usr_farmer_kannan',
    farmerId: 'usr_farmer_kannan',
    farmerName: 'Kannan R.',
    cropName: 'Paddy (Ponni Deluxe)',
    variety: 'BPT 5204 (Samba)',
    rate: 24,
    quantity: 1200,
    unit: 'kg',
    totalAmount: 28800,
    location: 'Thanjavur (Orathanadu)',
    status: 'placed',
    createdAt: '2026-10-31T09:15:00Z',
  },
  {
    id: 'ord_trans_201',
    type: 'transport',
    requestedById: 'usr_farmer_muthu',
    farmerName: 'Muthukumar S.',
    farmerPhone: '+91 94431 82710',
    transporterId: 'usr_trans_kumar',
    transporterName: 'Kumar Express Logistics',
    vehicleId: 'veh_namakkal_ashok_01',
    vehicleType: 'Heavy Truck (10-Wheeler)',
    cropName: 'Paddy & Banana',
    quantity: '8.5 Tons',
    pickupLocation: 'Oddanchatram, Dindigul',
    dropoffLocation: 'Koyambedu Wholesale Market, Chennai',
    totalPrice: 18500,
    tripDistanceKm: 420,
    status: 'on_trip',
    createdAt: '2026-10-30T14:00:00Z',
  },
];

const SEED_STORAGE_BOOKINGS = [
  {
    id: 'bk_demo_301',
    warehouseId: 'wh_dindigul_cold',
    warehouseName: 'Oddanchatram Farmers Cold Storage & Logistics',
    warehouseOwnerId: 'usr_wh_perumal',
    farmerId: 'usr_farmer_muthu',
    farmerName: 'Muthukumar S.',
    farmerPhone: '+91 94431 82710',
    commodity: 'Tomato & Vegetables',
    bagsCount: 150,
    storageType: 'Cold Storage (2°C - 4°C)',
    startDate: '2026-10-25',
    endDate: '2026-11-25',
    dailyRate: 1.8,
    totalEstimatedCost: 8100,
    status: 'approved',
    createdAt: '2026-10-24T11:00:00Z',
  },
  {
    id: 'bk_demo_302',
    warehouseId: 'wh_thanjavur_paddy',
    warehouseName: 'Delta Modern Paddy Silos & Dry Warehouse',
    warehouseOwnerId: 'wh_owner_thanjavur',
    farmerId: 'usr_farmer_kannan',
    farmerName: 'Kannan R.',
    farmerPhone: '+91 98422 19340',
    commodity: 'Paddy (Ponni)',
    bagsCount: 300,
    storageType: 'Moisture Controlled Silo',
    startDate: '2026-10-28',
    endDate: '2026-12-28',
    dailyRate: 1.5,
    totalEstimatedCost: 27000,
    status: 'pending',
    createdAt: '2026-10-28T09:30:00Z',
  },
];

const SEED_APP_CONTENT = {
  cropCategories: ['Cereals', 'Pulses', 'Spices', 'Fruits', 'Vegetables', 'Oilseeds', 'Commercial Crops'],
  districts: [
    'Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore', 'Thanjavur',
    'Dindigul', 'Tirunelveli', 'Namakkal', 'Krishnagiri', 'Cuddalore', 'Theni', 'Dharmapuri', 'Vellore'
  ],
  carouselBanners: [
    {
      id: 'banner_1',
      titleEn: 'Kalaignarin All Village Integrated Agriculture Development Programme',
      titleTa: 'கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம்',
      descriptionEn: 'Explore solar pumps, drip subsidies, and soil testing labs across your block panchayat.',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1000',
      active: true,
    },
    {
      id: 'banner_2',
      titleEn: 'Direct Harvest Procurement - Transparent Fair Mandi Rates',
      titleTa: 'விவசாயிகளிடமிருந்து நேரடி விளைபொருள் கொள்முதல்',
      descriptionEn: 'Connect verified farmers directly to bulk buyers with zero middleman commissions.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000',
      active: true,
    },
  ],
  supportHelplines: [
    { label: 'Kisan Call Center', phone: '1800-180-1551', hours: '6:00 AM - 10:00 PM' },
    { label: 'TN Agri Department Helpline', phone: '044-28524894', hours: '9:30 AM - 5:30 PM' },
    { label: 'Uzhavan App Technical Support', phone: '044-28567890', hours: '24/7' },
  ],
  announcementTicker: '🌾 Kharif / Samba Procurement Stations Active in 12 Delta Districts. Register on e-Thavanai.',
};

class EcosystemStore {
  constructor() {
    this.crops = [];
    this.vehicles = [];
    this.warehouses = [];
    this.alerts = [];
    this.marketPrices = [];
    this.users = [];
    this.orders = [];
    this.storageBookings = [];
    this.auditLogs = [];
    this.appContent = SEED_APP_CONTENT;
    this.isInitialized = false;

    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);

        this.crops = parsed.crops?.length ? parsed.crops : [...SEED_CROPS];
        this.vehicles = parsed.vehicles?.length ? parsed.vehicles : [...SEED_VEHICLES];
        this.warehouses = parsed.warehouses?.length ? parsed.warehouses : [...SEED_WAREHOUSES];
        this.alerts = parsed.alerts?.length ? parsed.alerts : [...SEED_ALERTS];
        this.marketPrices = parsed.marketPrices?.length ? parsed.marketPrices : [...SEED_MARKET_PRICES];
        this.users = parsed.users?.length ? parsed.users : [...SEED_USERS];
        this.orders = parsed.orders?.length ? parsed.orders : [...SEED_ORDERS];
        this.storageBookings = parsed.storageBookings?.length ? parsed.storageBookings : [...SEED_STORAGE_BOOKINGS];
        this.auditLogs = parsed.auditLogs || [];
        this.appContent = {
          ...SEED_APP_CONTENT,
          ...(parsed.appContent || {}),
          cropCategories: parsed.appContent?.cropCategories || SEED_APP_CONTENT.cropCategories,
          districts: parsed.appContent?.districts || SEED_APP_CONTENT.districts,
        };
      } else {
        this.crops = [...SEED_CROPS];
        this.vehicles = [...SEED_VEHICLES];
        this.warehouses = [...SEED_WAREHOUSES];
        this.alerts = [...SEED_ALERTS];
        this.marketPrices = [...SEED_MARKET_PRICES];
        this.users = [...SEED_USERS];
        this.orders = [...SEED_ORDERS];
        this.storageBookings = [...SEED_STORAGE_BOOKINGS];
        this.auditLogs = [];
        this.appContent = SEED_APP_CONTENT;
        this.persist();
      }

      this.isInitialized = true;
      console.log(`[EcosystemStore] Initialized with ${this.crops.length} crops, ${this.vehicles.length} vehicles, ${this.warehouses.length} warehouses, ${this.alerts.length} alerts.`);
    } catch (err) {
      console.error('[EcosystemStore] Initialization error, falling back to in-memory seeds:', err.message);
      this.crops = [...SEED_CROPS];
      this.vehicles = [...SEED_VEHICLES];
      this.warehouses = [...SEED_WAREHOUSES];
      this.alerts = [...SEED_ALERTS];
      this.marketPrices = [...SEED_MARKET_PRICES];
      this.users = [...SEED_USERS];
      this.orders = [...SEED_ORDERS];
      this.storageBookings = [...SEED_STORAGE_BOOKINGS];
      this.auditLogs = [];
      this.isInitialized = true;
    }
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const state = {
        savedAt: new Date().toISOString(),
        crops: this.crops,
        vehicles: this.vehicles,
        warehouses: this.warehouses,
        alerts: this.alerts,
        marketPrices: this.marketPrices,
        users: this.users,
        orders: this.orders,
        storageBookings: this.storageBookings,
        auditLogs: this.auditLogs.slice(0, 100), // retain last 100 logs
        appContent: this.appContent,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[EcosystemStore] Persist error:', err.message);
    }
  }

  // --- CROPS (POSTS) ---
  getCrops({ crop, location, search, limit = 50 } = {}) {
    const searchLower = (search || '').trim().toLowerCase();
    return this.crops
      .filter((post) => {
        if (crop && crop !== 'all' && post.cropName?.toLowerCase() !== crop.toLowerCase()) return false;
        if (location && location !== 'all' && post.location?.toLowerCase() !== location.toLowerCase()) return false;
        if (searchLower) {
          const matchName = (post.cropName || '').toLowerCase().includes(searchLower);
          const matchUser = (post.userName || '').toLowerCase().includes(searchLower);
          const matchLoc = (post.location || '').toLowerCase().includes(searchLower);
          if (!matchName && !matchUser && !matchLoc) return false;
        }
        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  addCrop(data, adminEmail = 'admin@gmail.com') {
    const id = `post_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCrop = {
      id,
      cropName: data.cropName || 'Fresh Harvest',
      userName: data.userName || 'Tamil Nadu Farm Producer',
      userId: data.userId || 'admin_posted',
      userPhone: data.userPhone || '+91 94431 82710',
      price: Number(data.price) || 25,
      quantity: Number(data.quantity) || 100,
      unit: data.unit || 'kg',
      location: data.location || 'Tamil Nadu',
      district: data.district || data.location || 'Tamil Nadu',
      grade: data.grade || 'A Grade',
      variety: data.variety || 'Native Commercial',
      harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      organicCertified: Boolean(data.organicCertified),
      description: data.description || 'Direct farmer harvest available for wholesale order.',
      status: data.status || 'active',
      isVerifiedSeller: true,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    };
    this.crops.unshift(newCrop);
    this.persist();
    this.addAuditLog({
      action: 'POST_CREATED',
      targetId: id,
      targetType: 'post',
      details: { cropName: newCrop.cropName, price: newCrop.price, location: newCrop.location },
      performedBy: adminEmail,
    });
    return newCrop;
  }

  updateCrop(id, updates, adminEmail = 'admin@gmail.com') {
    const index = this.crops.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Crop listing with id ${id} not found.`);

    const updated = {
      ...this.crops[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    this.crops[index] = updated;
    this.persist();
    this.addAuditLog({
      action: 'POST_UPDATED',
      targetId: id,
      targetType: 'post',
      details: updates,
      performedBy: adminEmail,
    });
    return updated;
  }

  deleteCrop(id, reason = 'Admin moderation', adminEmail = 'admin@gmail.com') {
    const index = this.crops.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Crop listing with id ${id} not found.`);

    const deleted = this.crops.splice(index, 1)[0];
    this.persist();
    this.addAuditLog({
      action: 'POST_DELETED',
      targetId: id,
      targetType: 'post',
      details: { cropName: deleted.cropName, reason },
      performedBy: adminEmail,
    });
    return { success: true, deletedPostId: id };
  }

  // --- WAREHOUSES ---
  getWarehouses({ search, limit = 50 } = {}) {
    const searchLower = (search || '').trim().toLowerCase();
    return this.warehouses
      .filter((w) => {
        if (!searchLower) return true;
        const name = (w.warehouseName || w.name || '').toLowerCase();
        const loc = (w.location || '').toLowerCase();
        return name.includes(searchLower) || loc.includes(searchLower);
      })
      .slice(0, Number(limit) || 50);
  }

  addWarehouse(data, adminEmail = 'admin@gmail.com') {
    const id = `wh_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newWh = {
      id,
      name: data.name || data.warehouseName || 'Tamil Nadu Storage Hub',
      warehouseName: data.warehouseName || data.name || 'Tamil Nadu Storage Hub',
      ownerName: data.ownerName || 'State Agri Logistics',
      ownerId: data.ownerId || 'admin_created',
      contactPhone: data.contactPhone || '+91 94420 33810',
      location: data.location || 'Tamil Nadu',
      district: data.district || data.location || 'Tamil Nadu',
      capacity: Number(data.capacity) || 10000,
      availableSpace: Number(data.availableSpace !== undefined ? data.availableSpace : data.capacity) || 10000,
      occupiedSpace: Number(data.occupiedSpace) || 0,
      dailyRatePerBag: Number(data.dailyRatePerBag || data.pricePerSqFt) || 1.8,
      temperatureControlled: Boolean(data.temperatureControlled),
      cctvMonitoring: data.cctvMonitoring !== false,
      insuranceIncluded: data.insuranceIncluded !== false,
      isVerified: true,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    };
    this.warehouses.unshift(newWh);
    this.persist();
    this.addAuditLog({
      action: 'WAREHOUSE_CREATED',
      targetId: id,
      targetType: 'warehouse',
      details: { name: newWh.warehouseName, location: newWh.location, capacity: newWh.capacity },
      performedBy: adminEmail,
    });
    return newWh;
  }

  updateWarehouse(id, updates, adminEmail = 'admin@gmail.com') {
    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) throw new Error(`Warehouse with id ${id} not found.`);

    const updated = {
      ...this.warehouses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    this.warehouses[index] = updated;
    this.persist();
    this.addAuditLog({
      action: 'WAREHOUSE_UPDATED',
      targetId: id,
      targetType: 'warehouse',
      details: updates,
      performedBy: adminEmail,
    });
    return updated;
  }

  deleteWarehouse(id, adminEmail = 'admin@gmail.com') {
    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) throw new Error(`Warehouse with id ${id} not found.`);

    const deleted = this.warehouses.splice(index, 1)[0];
    this.persist();
    this.addAuditLog({
      action: 'WAREHOUSE_DELETED',
      targetId: id,
      targetType: 'warehouse',
      details: { name: deleted.warehouseName || deleted.name },
      performedBy: adminEmail,
    });
    return { success: true, deletedWarehouseId: id };
  }

  // --- VEHICLES ---
  getVehicles({ vehicleType, location, search, limit = 50 } = {}) {
    const searchLower = (search || '').trim().toLowerCase();
    return this.vehicles
      .filter((v) => {
        if (vehicleType && vehicleType !== 'all' && v.vehicleType?.toLowerCase() !== vehicleType.toLowerCase()) return false;
        if (location && location !== 'all' && v.location?.toLowerCase() !== location.toLowerCase()) return false;
        if (searchLower) {
          const matchNum = (v.vehicleNumber || '').toLowerCase().includes(searchLower);
          const matchOwner = (v.ownerName || '').toLowerCase().includes(searchLower);
          const matchType = (v.vehicleType || '').toLowerCase().includes(searchLower);
          const matchLoc = (v.location || '').toLowerCase().includes(searchLower);
          if (!matchNum && !matchOwner && !matchType && !matchLoc) return false;
        }
        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  addVehicle(data, adminEmail = 'admin@gmail.com') {
    const id = `veh_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newVeh = {
      id,
      vehicleNumber: data.vehicleNumber || `TN ${Math.floor(10 + Math.random() * 89)} AB ${Math.floor(1000 + Math.random() * 8999)}`,
      vehicleType: data.vehicleType || 'Mini Truck (Pickup)',
      ownerName: data.ownerName || 'Verified Tamil Logistics Partner',
      ownerId: data.ownerId || 'admin_created',
      driverPhone: data.driverPhone || data.phone || '+91 97910 44220',
      capacityTons: Number(data.capacityTons || data.capacity) || 2.5,
      ratePerKm: Number(data.ratePerKm) || 24,
      location: data.location || 'Tamil Nadu',
      district: data.district || data.location || 'Tamil Nadu',
      permitValidTill: data.permitValidTill || '2027-12-31',
      gpsEnabled: data.gpsEnabled !== false,
      isAvailable: data.isAvailable !== false,
      refrigerated: Boolean(data.refrigerated),
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    };
    this.vehicles.unshift(newVeh);
    this.persist();
    this.addAuditLog({
      action: 'VEHICLE_CREATED',
      targetId: id,
      targetType: 'vehicle',
      details: { vehicleNumber: newVeh.vehicleNumber, vehicleType: newVeh.vehicleType, ratePerKm: newVeh.ratePerKm },
      performedBy: adminEmail,
    });
    return newVeh;
  }

  updateVehicle(id, updates, adminEmail = 'admin@gmail.com') {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Vehicle with id ${id} not found.`);

    const updated = {
      ...this.vehicles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    this.vehicles[index] = updated;
    this.persist();
    this.addAuditLog({
      action: 'VEHICLE_UPDATED',
      targetId: id,
      targetType: 'vehicle',
      details: updates,
      performedBy: adminEmail,
    });
    return updated;
  }

  deleteVehicle(id, adminEmail = 'admin@gmail.com') {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Vehicle with id ${id} not found.`);

    const deleted = this.vehicles.splice(index, 1)[0];
    this.persist();
    this.addAuditLog({
      action: 'VEHICLE_DELETED',
      targetId: id,
      targetType: 'vehicle',
      details: { vehicleNumber: deleted.vehicleNumber },
      performedBy: adminEmail,
    });
    return { success: true, deletedVehicleId: id };
  }

  // --- ORDERS ---
  getOrders({ type, status, limit = 50 } = {}) {
    return this.orders
      .filter((o) => {
        if (type && type !== 'all' && o.type !== type) return false;
        if (status && status !== 'all' && o.status !== status) return false;
        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  updateOrderStatus(id, status, adminEmail = 'admin@gmail.com') {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Order ${id} not found.`);

    this.orders[index].status = status;
    this.orders[index].updatedAt = new Date().toISOString();
    this.orders[index].updatedBy = adminEmail;
    this.persist();
    this.addAuditLog({
      action: 'ORDER_STATUS_UPDATED',
      targetId: id,
      targetType: 'order',
      details: { newStatus: status },
      performedBy: adminEmail,
    });
    return { id, status };
  }

  // --- STORAGE BOOKINGS ---
  getStorageBookings({ status, limit = 50 } = {}) {
    return this.storageBookings
      .filter((b) => {
        if (status && status !== 'all' && b.status !== status) return false;
        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  updateStorageBookingStatus(id, status, adminEmail = 'admin@gmail.com') {
    const index = this.storageBookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Storage booking ${id} not found.`);

    this.storageBookings[index].status = status;
    this.storageBookings[index].updatedAt = new Date().toISOString();
    this.storageBookings[index].updatedBy = adminEmail;
    this.persist();
    this.addAuditLog({
      action: 'STORAGE_BOOKING_STATUS_UPDATED',
      targetId: id,
      targetType: 'warehouseBooking',
      details: { newStatus: status },
      performedBy: adminEmail,
    });
    return { id, status };
  }

  // --- ALERTS (ROLE TARGETED & DISTRICT TARGETED) ---
  getAlerts({ role, district, category, limit = 50 } = {}) {
    const roleLower = (role || 'all').toLowerCase();
    const districtLower = (district || 'all').toLowerCase();
    const categoryLower = (category || 'all').toLowerCase();

    return this.alerts
      .filter((a) => {
        // Audience filter: if alert targetAudience is 'All', everyone sees it.
        // If alert targetAudience is e.g. 'Farmer', only Farmer or role='all' sees it.
        if (roleLower !== 'all') {
          const audience = (a.targetAudience || 'All').toLowerCase();
          if (audience !== 'all' && audience !== roleLower) return false;
        }

        // District filter: if alert targetDistrict is 'All TN' or undefined, applies everywhere
        if (districtLower !== 'all' && a.targetDistrict && a.targetDistrict.toLowerCase() !== 'all tn') {
          if (!a.targetDistrict.toLowerCase().includes(districtLower)) return false;
        }

        // Category filter
        if (categoryLower !== 'all' && a.category?.toLowerCase() !== categoryLower) return false;

        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  saveAlert(alertData, adminEmail = 'admin@gmail.com') {
    const id = alertData.id || `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAlert = {
      id,
      titleEn: alertData.titleEn || alertData.title || 'Official Agricultural Notice',
      titleTa: alertData.titleTa || alertData.title || 'அரசு வேளாண்மை அறிவிப்பு',
      summaryEn: alertData.summaryEn || alertData.message || '',
      summaryTa: alertData.summaryTa || alertData.message || '',
      category: alertData.category || 'General',
      severity: alertData.severity || 'Medium',
      targetAudience: alertData.targetAudience || 'All', // 'All' | 'Farmer' | 'Buyer' | 'Transporter' | 'Warehouse'
      targetDistrict: alertData.targetDistrict || 'All TN',
      isBreaking: Boolean(alertData.isBreaking),
      source: alertData.source || 'Tamil Nadu Agri Portal',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    };

    const existingIndex = this.alerts.findIndex((a) => a.id === id);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = { ...this.alerts[existingIndex], ...newAlert };
    } else {
      this.alerts.unshift(newAlert);
    }
    this.persist();
    this.addAuditLog({
      action: 'ALERT_SAVED',
      targetId: id,
      targetType: 'alert',
      details: { title: newAlert.titleEn, targetAudience: newAlert.targetAudience, severity: newAlert.severity },
      performedBy: adminEmail,
    });
    return newAlert;
  }

  deleteAlert(id, adminEmail = 'admin@gmail.com') {
    const index = this.alerts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Alert with id ${id} not found.`);

    const deleted = this.alerts.splice(index, 1)[0];
    this.persist();
    this.addAuditLog({
      action: 'ALERT_DELETED',
      targetId: id,
      targetType: 'alert',
      details: { title: deleted.titleEn },
      performedBy: adminEmail,
    });
    return { success: true, deletedAlertId: id };
  }

  // --- MARKET PRICES ---
  getMarketPrices() {
    return this.marketPrices;
  }

  saveMarketPrice(priceData, adminEmail = 'admin@gmail.com') {
    const id = priceData.id || `${(priceData.mandi || 'TN').toLowerCase()}_${(priceData.crop || 'item').toLowerCase()}`;
    const newPrice = {
      id,
      crop: priceData.crop || 'Paddy',
      mandi: priceData.mandi || 'Trichy',
      variety: priceData.variety || 'Standard Commercial',
      minPrice: Number(priceData.minPrice || priceData.minQuintal) || 2000,
      maxPrice: Number(priceData.maxPrice || priceData.maxQuintal) || 2400,
      modalPrice: Number(priceData.modalPrice || priceData.modalQuintal) || 2200,
      trend: priceData.trend || 'stable',
      date: new Date().toISOString().split('T')[0],
      source: 'Agmarknet / TN APMC Mandi Bulletin',
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };

    const existingIndex = this.marketPrices.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      this.marketPrices[existingIndex] = { ...this.marketPrices[existingIndex], ...newPrice };
    } else {
      this.marketPrices.unshift(newPrice);
    }
    this.persist();
    this.addAuditLog({
      action: 'MARKET_PRICE_SAVED',
      targetId: id,
      targetType: 'market_price',
      details: { crop: newPrice.crop, mandi: newPrice.mandi, modalPrice: newPrice.modalPrice },
      performedBy: adminEmail,
    });
    return newPrice;
  }

  deleteMarketPrice(id, adminEmail = 'admin@gmail.com') {
    const index = this.marketPrices.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Market price record ${id} not found.`);

    const deleted = this.marketPrices.splice(index, 1)[0];
    this.persist();
    this.addAuditLog({
      action: 'MARKET_PRICE_DELETED',
      targetId: id,
      targetType: 'market_price',
      details: { crop: deleted.crop, mandi: deleted.mandi },
      performedBy: adminEmail,
    });
    return { success: true, deletedPriceId: id };
  }

  // --- APP CONTENT ---
  getAppContent() {
    return this.appContent;
  }

  saveAppContent(content, adminEmail = 'admin@gmail.com') {
    this.appContent = {
      ...this.appContent,
      ...content,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    this.persist();
    this.addAuditLog({
      action: 'APP_CONTENT_SAVED',
      targetId: 'app_config',
      targetType: 'config',
      details: { keys: Object.keys(content) },
      performedBy: adminEmail,
    });
    return this.appContent;
  }

  // --- USERS & AUDIT ---
  getUsers({ role, search, limit = 50 } = {}) {
    const searchLower = (search || '').trim().toLowerCase();
    return this.users
      .filter((u) => {
        if (role && role !== 'all' && u.role?.toLowerCase() !== role.toLowerCase()) return false;
        if (searchLower) {
          const name = (u.name || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          const phone = (u.phone || '').toLowerCase();
          if (!name.includes(searchLower) && !email.includes(searchLower) && !phone.includes(searchLower)) return false;
        }
        return true;
      })
      .slice(0, Number(limit) || 50);
  }

  toggleUserBlock(userId, blocked, adminEmail = 'admin@gmail.com') {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.blocked = Boolean(blocked);
      user.status = blocked ? 'blocked' : 'active';
      this.persist();
    }
    this.addAuditLog({
      action: blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      targetId: userId,
      targetType: 'user',
      details: { blocked },
      performedBy: adminEmail,
    });
    return { id: userId, blocked: Boolean(blocked) };
  }

  getUserDetails(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error(`User ${userId} not found.`);

    const userPosts = this.crops.filter((c) => c.userId === userId || c.userName === user.name);
    const userOrders = this.orders.filter((o) => o.buyerId === userId || o.farmerId === userId);
    const userWh = this.warehouses.filter((w) => w.ownerId === userId);
    const userVeh = this.vehicles.filter((v) => v.ownerId === userId);

    return {
      ...user,
      listingsCount: userPosts.length,
      ordersCount: userOrders.length,
      warehousesCount: userWh.length,
      vehiclesCount: userVeh.length,
    };
  }

  updateUserProfile(userId, updates, adminEmail = 'admin@gmail.com') {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error(`User ${userId} not found.`);

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    this.persist();
    this.addAuditLog({
      action: 'USER_PROFILE_UPDATED',
      targetId: userId,
      targetType: 'user',
      details: updates,
      performedBy: adminEmail,
    });
    return this.users[index];
  }

  getAuditLogs(limit = 30) {
    return this.auditLogs.slice(0, Number(limit) || 30);
  }

  addAuditLog(entry) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
  }

  // Aggregated System Stats
  getSystemStats() {
    let farmers = 0;
    let buyers = 0;
    let transporters = 0;
    let warehouseOwners = 0;
    let blockedUsers = 0;

    for (const u of this.users) {
      const role = (u.role || '').toLowerCase();
      if (role === 'farmer') farmers++;
      else if (role === 'buyer') buyers++;
      else if (role === 'transporter') transporters++;
      else if (role === 'warehouse') warehouseOwners++;
      if (u.blocked || u.status === 'blocked') blockedUsers++;
    }

    const pendingStorageBookings = this.storageBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length;
    const pendingTransportBookings = this.orders.filter((o) => o.type === 'transport' && (o.status || '').toLowerCase() === 'requested').length;

    return {
      isConfigured: true,
      stats: {
        totalUsers: this.users.length,
        farmers,
        buyers,
        transporters,
        warehouses: warehouseOwners,
        blockedUsers,
        totalPosts: this.crops.length,
        totalWarehouses: this.warehouses.length,
        totalVehicles: this.vehicles.length,
        pendingStorageBookings,
        pendingTransportBookings,
        totalOrders: this.orders.length,
        totalAlerts: this.alerts.length,
      },
    };
  }
}

export const ecosystemStore = new EcosystemStore();
