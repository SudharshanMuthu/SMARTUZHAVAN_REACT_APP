import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout } from '../utils/networkUtil';
import {
  FarmToolProduct,
  MachineryRentalItem,
  RentalBookingRequest,
  ToolCategory,
  EquipmentType,
} from '../types/farmtools';
import { getFirebaseFirestore, getFirebaseAuth } from './firebase';
import { sendAppNotification } from './notificationService';

const getBaseUrl = () => getApiBaseUrl();

export const FALLBACK_TOOLS: FarmToolProduct[] = [
  {
    id: 'tool_tata_manvetti',
    name: 'Tata Agrico Forged Steel Spade / Manvetti (No. 4)',
    nameTa: 'டாடா அக்ரிகோ திட எஃகு மண்வெட்டி (எண் 4)',
    brand: 'Tata Agrico',
    category: 'hand_tools',
    subCategory: 'Soil Preparation & Bunding Hand Tool',
    price: 490.0,
    mrp: 550.0,
    quantityOrSize: 'Single Unit (Weight 2.1 kg)',
    unitPrice: '₹490 / piece',
    rating: 4.9,
    reviewsCount: 164,
    sellerName: 'Trichy Agro Hardware & Tools Depot',
    sellerPhone: '0431-2741982',
    sellerType: 'authorized_dealer',
    location: 'Trichy',
    availability: 'in_stock',
    description:
      'High-carbon forged steel shovel blade tempered for soil canal digging, wet paddy bund preparation, and weed scraping with reinforced socket.',
    descriptionTa:
      'உயர் கார்பன் எஃகால் செய்யப்பட்ட உறுதியான மண்வெட்டி. வரப்பு வெட்டவும், பாசன வாய்க்கால் அமைக்கவும் சிறந்தது.',
    specifications: {
      Material: 'Drop-forged High Carbon Steel (EN-8 standard)',
      BladeWidth: '225 mm',
      BladeLength: '240 mm',
      Weight: '2.1 kg',
      SocketDiameter: '38 mm',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '2 Years Manufacturer Replacement Guarantee against forging cracks',
    isGovtSubsidized: false,
  },
  {
    id: 'part_mahindra_oil_filter',
    name: 'Mahindra OEM Spin-on Engine Oil Filter (P/N 005558491R91)',
    nameTa: 'மஹிந்திரா டிராக்டர் என்ஜின் ஆயில் பில்டர் (அசல் உதிரிபாகம்)',
    brand: 'Mahindra OEM',
    category: 'tractor_parts',
    subCategory: 'Engine Filtration & Lubrication',
    price: 385.0,
    mrp: 420.0,
    quantityOrSize: 'Single Unit Filter Canister',
    unitPrice: '₹385 / piece',
    rating: 4.9,
    reviewsCount: 142,
    sellerName: 'Kaveri Tractor Spares & Service Hub',
    sellerPhone: '0431-2551040',
    sellerType: 'authorized_dealer',
    location: 'Trichy',
    availability: 'in_stock',
    description:
      'Original equipment manufacturer (OEM) micro-glass engine lubrication filter element that prevents abrasive metal wear in heavy tillage cycles.',
    descriptionTa:
      'டிராக்டர் என்ஜின் பாகங்களை தேய்மானத்தில் இருந்து பாதுகாக்கும் அசல் ஆயில் பில்டர்.',
    specifications: {
      FilterType: 'Full-Flow Spin-on Canister',
      ThreadSize: '3/4"-16 UNF',
      FiltrationEfficiency: '99.2% at 20 microns',
      BurstPressure: '20 Bar rating',
    },
    isTractorPart: true,
    tractorBrand: 'Mahindra',
    tractorModel: '575 DI, 275 DI, 475 DI, 585 DI (Bhoomiputra / Sarpanch Series)',
    partNumber: '005558491R91',
    compatibilityNotes:
      'Verified OEM fit for 4-Cylinder and 3-Cylinder Mahindra DI engines (35 to 50 HP). Not compatible with Yuvraj 215 mini-tractor.',
    isCompatibilityVerified: true,
    warranty: '6 Months Genuine OEM Warranty against leakage',
    isGovtSubsidized: false,
  },
  {
    id: 'irrig_finolex_drip_kit',
    name: 'Finolex 2-Inch Inline Drip Irrigation System (1 Acre Complete Kit)',
    nameTa: 'பினோலெக்ஸ் சொட்டு நீர் பாசன முழு தொகுப்பு (1 ஏக்கர்)',
    brand: 'Finolex Plasson',
    category: 'irrigation',
    subCategory: 'Micro-Irrigation Water Saving System',
    price: 8400.0,
    mrp: 12500.0,
    quantityOrSize: '1 Acre Complete Installation Pack (16mm Lateral, Screen Filter, Venturi, Valves)',
    unitPrice: '₹8,400 / acre kit',
    rating: 4.9,
    reviewsCount: 112,
    sellerName: 'Tamil Nadu Agro Industries Corporation (TNAIC)',
    sellerPhone: '044-28271011',
    sellerType: 'tnaic_depot',
    location: 'Trichy',
    availability: 'in_stock',
    description:
      'Comprehensive pressurized micro-irrigation layout saving up to 60% water while boosting fertilizer use efficiency via integrated Venturi fertigation.',
    descriptionTa:
      '1 ஏக்கர் தோட்டக்கலை மற்றும் பயிர்களுக்கான முழு சொட்டு நீர் பாசன கருவிகள். 60% வரை தண்ணீர் சேமிக்கும்.',
    specifications: {
      LateralPipe: '16 mm Class-2 Virgin HDPE (400 meters)',
      EmitterSpacing: '40 cm inline pressure-compensating drippers (2.0 LPH)',
      Filtration: '2-Inch Disc Filter (120 mesh / 130 microns)',
      Fertigation: '3/4-Inch Venturi Injector with suction tube and strainer',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '5 Years Manufacturer Guarantee on Lateral Tubes against UV degradation',
    isGovtSubsidized: true,
    subsidySchemeName:
      'PM Krishi Sinchayee Yojana (PMKSY) – Up to 100% subsidy for Small/Marginal farmers',
  },
  {
    id: 'mach_aspee_battery_sprayer',
    name: 'Aspee 16-Liter Dual Motor Battery & Hand Knapsack Sprayer',
    nameTa: 'ஆஸ்பி 16 லிட்டர் பேட்டரி & கை விசை தெளிப்பான்',
    brand: 'Aspee',
    category: 'machinery',
    subCategory: 'Crop Protection Spraying Equipment',
    price: 3650.0,
    mrp: 4200.0,
    quantityOrSize: 'Complete Unit (16L Tank, 12V 12Ah Battery, Charger & 4 Nozzles)',
    unitPrice: '₹3,650 / unit',
    rating: 4.8,
    reviewsCount: 195,
    sellerName: 'PACCS Agro Service Center',
    sellerPhone: '0431-2541234',
    sellerType: 'cooperative',
    location: 'Trichy',
    availability: 'in_stock',
    description:
      'Ergonomic dual-operation knapsack sprayer with automatic pressure regulator, 12V 12Ah maintenance-free battery providing up to 6 hours continuous field spraying.',
    descriptionTa:
      '16 லிட்டர் கொள்ளளவு கொண்ட பேட்டரி தெளிப்பான். ஒரே சார்ஜில் 6 மணி நேரம் வரை மருந்து தெளிக்கலாம்.',
    specifications: {
      TankCapacity: '16 Liters UV-stabilized virgin plastic',
      BatterySpec: '12 Volt, 12 Ampere-Hour Heavy Duty Lead-Acid',
      WorkingPressure: '0.2 - 0.45 MPa (60 PSI)',
      DischargeRate: '2.5 to 3.2 L/min (Dual diaphragm pump)',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '1 Year Warranty on Battery, Motor, and Charger',
    isGovtSubsidized: true,
    subsidySchemeName: 'Sub-Mission on Agricultural Mechanization (SMAM)',
  },
  {
    id: 'tech_soil_npk_sensor_probe',
    name: 'KrishiIoT Smart Soil NPK & Moisture Digital RS485 Probe',
    nameTa: 'மண் சத்து (NPK) & ஈரப்பதம் கண்டறியும் டிஜிட்டல் சென்சார்',
    brand: 'KrishiIoT',
    category: 'smart_tech',
    subCategory: 'Precision Agriculture Sensor',
    price: 4950.0,
    mrp: 6500.0,
    quantityOrSize: 'Single Sensor Probe with 2m Cable & Bluetooth Reader',
    unitPrice: '₹4,950 / unit',
    rating: 4.8,
    reviewsCount: 39,
    sellerName: 'TNAU Agrotech Innovation Center',
    sellerPhone: '0422-6611200',
    sellerType: 'tnaic_depot',
    location: 'Coimbatore',
    availability: 'in_stock',
    description:
      'Multi-parameter soil probe measuring real-time Nitrogen (N), Phosphorus (P), Potassium (K), Soil Moisture (VWC), Temperature, and Electrical Conductivity (EC) directly in field soil.',
    descriptionTa:
      'மண்ணில் உள்ள தழை, மணி, சாம்பல் சத்துக்கள் மற்றும் ஈரப்பதத்தை உடனடியாக துல்லியமாக அளவிடும் கருவி.',
    specifications: {
      ParametersMeasured:
        'Soil N, P, K (mg/kg), Moisture (0-100%), EC (0-20000 us/cm), Temp (-40 to 80°C)',
      Interface: 'RS485 Modbus-RTU / BLE 5.0 wireless to Smart Uzhavan mobile app',
      ProtectionClass: 'IP68 completely waterproof and corrosion-proof resin potting',
      ResponseTime: '< 1 Second real-time reading',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '1 Year Full Replacement Warranty',
    isGovtSubsidized: false,
  },
];

export const FALLBACK_RENTALS: MachineryRentalItem[] = [
  {
    id: 'rent_mahindra_575_rotavator',
    title: 'Mahindra 575 DI (45 HP) Tractor + 6-Foot Rotavator',
    titleTa: 'மஹிந்திரா 575 DI (45 HP) டிராக்டர் + 6 அடி ரோட்டாவேட்டர் வாடகைக்கு',
    type: 'tractor',
    ownerName: 'Lalgudi Custom Hiring Centre (Uzhavan FPO)',
    ownerPhone: '0431-2549811',
    location: 'Lalgudi, Trichy',
    district: 'Trichy',
    rateType: 'hourly',
    rate: 900.0,
    rateDisplay: '₹900 / Hour (incl. Diesel & Operator)',
    availability: 'available',
    specifications:
      '45 HP Bhoomiputra Tractor equipped with 42-blade Shaktiman Rotavator. Wet paddy puddling cage wheels and dry deep ploughing attachments available on request.',
    operatorIncluded: true,
    fuelIncluded: true,
    isVerifiedProvider: true,
  },
  {
    id: 'rent_kubota_dc68g_harvester',
    title: 'Kubota DC-68G Rubber-Track Combined Paddy Harvester',
    titleTa: 'குபோடா அதிநவீன நெல் அறுவடை இயந்திரம் வாடகைக்கு',
    type: 'harvester',
    ownerName: 'Delta Harvester Hiring Services',
    ownerPhone: '04362-278144',
    location: 'Kumbakonam, Thanjavur',
    district: 'Thanjavur',
    rateType: 'hourly',
    rate: 2400.0,
    rateDisplay: '₹2,400 / Hour (Harvests ~1 Acre per hour)',
    availability: 'available',
    specifications:
      '68 HP Rubber-track crawler capable of harvesting in waterlogged/marshy wet delta paddy fields without sinking. High grain recovery with minimal grain loss (< 1%).',
    operatorIncluded: true,
    fuelIncluded: true,
    isVerifiedProvider: true,
  },
  {
    id: 'rent_shaktiman_rotavator_standalone',
    title: 'Shaktiman Champion 7-Foot Heavy Duty Rotavator Attachment',
    titleTa: 'சக்திமான் 7 அடி ரோட்டாவேட்டர் கருவி மட்டும் வாடகைக்கு',
    type: 'rotavator',
    ownerName: 'Perundurai Agro Implements Hiring Depot',
    ownerPhone: '04294-220145',
    location: 'Perundurai, Erode',
    district: 'Erode',
    rateType: 'daily',
    rate: 1200.0,
    rateDisplay: '₹1,200 / Day (Attachment Only - Farmer provides tractor)',
    availability: 'available',
    specifications:
      '54-blade heavy duty gear drive rotavator. Fits any standard Cat-II 3-point tractor linkage with 45–60 HP PTO.',
    operatorIncluded: false,
    fuelIncluded: false,
    isVerifiedProvider: true,
  },
  {
    id: 'rent_laser_land_leveler',
    title: 'Trimble Laser Controlled Land Leveler with Dual Slope Transmitter',
    titleTa: 'லேசர் நிலம் சமப்படுத்தும் கருவி வாடகைக்கு',
    type: 'leveler',
    ownerName: 'Madurai Precision Farming Cooperative Society',
    ownerPhone: '0452-2429011',
    location: 'Othakadai, Madurai',
    district: 'Madurai',
    rateType: 'hourly',
    rate: 1100.0,
    rateDisplay: '₹1,100 / Hour (incl. Laser Specialist Operator)',
    availability: 'available',
    specifications:
      'Precision laser leveling reduces irrigation water requirement by 25–30% and optimizes uniform fertilizer application across the field.',
    operatorIncluded: true,
    fuelIncluded: false,
    isVerifiedProvider: true,
  },
  {
    id: 'rent_power_weeder_honda',
    title: 'Honda 5.5 HP Petrol Cono-Weeder / Inter-Cultivator',
    titleTa: 'ஹோண்டா 5.5 HP களையெடுக்கும் சிறிய இயந்திரம்',
    type: 'power_weeder',
    ownerName: 'Coimbatore Small Farmers Machinery Hub',
    ownerPhone: '0422-2438765',
    location: 'Mettupalayam Road, Coimbatore',
    district: 'Coimbatore',
    rateType: 'daily',
    rate: 800.0,
    rateDisplay: '₹800 / Day (Lightweight portable machine)',
    availability: 'available',
    specifications:
      'Ideal for de-weeding and soil loosening in vegetables, sugarcane inter-rows, and fruit orchards. Consumes 0.8 L/hour petrol.',
    operatorIncluded: false,
    fuelIncluded: false,
    isVerifiedProvider: true,
  },
];

/**
 * Fetch Farm Tools & Tech items from backend or local fallback.
 */
export const fetchFarmTools = async (
  category: ToolCategory = 'all',
  searchQuery: string = ''
): Promise<FarmToolProduct[]> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      let url = `${baseUrl}/farm-tools/products?category=${category}`;
      if (searchQuery.trim()) {
        url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetchWithTimeout(url, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.tools)) {
          return json.data.tools;
        }
      }
    } catch (err) {
      console.warn('[FarmToolsService] Backend fetch failed, using verified fallback:', err);
    }
  }

  // Local fallback
  let list = [...FALLBACK_TOOLS];
  if (category !== 'all') {
    list = list.filter((t) => t.category === category);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.nameTa.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        (t.partNumber && t.partNumber.toLowerCase().includes(q)) ||
        (t.tractorModel && t.tractorModel.toLowerCase().includes(q))
    );
  }
  return list;
};

/**
 * Fetch single tool by ID.
 */
export const fetchFarmToolById = async (id: string): Promise<FarmToolProduct | null> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetchWithTimeout(`${baseUrl}/farm-tools/products/${id}`, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('[FarmToolsService] Tool detail fetch failed, using fallback:', err);
    }
  }

  return FALLBACK_TOOLS.find((t) => t.id === id) || null;
};

/**
 * Fetch machinery rentals with optional filters.
 */
export const fetchMachineryRentals = async (
  district: string = 'All',
  type: EquipmentType = 'all'
): Promise<MachineryRentalItem[]> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      const url = `${baseUrl}/farm-tools/rentals?district=${encodeURIComponent(
        district
      )}&type=${type}`;
      const res = await fetchWithTimeout(url, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.rentals)) {
          return json.data.rentals;
        }
      }
    } catch (err) {
      console.warn('[FarmToolsService] Rentals fetch failed, using fallback:', err);
    }
  }

  let list = [...FALLBACK_RENTALS];
  if (type !== 'all') {
    list = list.filter((r) => r.type === type);
  }
  if (district !== 'All') {
    list = list.filter((r) => r.district.toLowerCase() === district.toLowerCase());
  }
  return list;
};

/**
 * Submit a machinery rental booking request to Firestore collection `machinery_rentals`.
 */
export const submitRentalBooking = async (
  input: Omit<RentalBookingRequest, 'id' | 'status' | 'createdAt'>
): Promise<string> => {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in to submit a machinery rental request.');
  }

  const db = getFirebaseFirestore();
  const docRef = await addDoc(collection(db, 'machinery_rentals'), {
    ...input,
    farmerId: user.uid,
    farmerEmail: user.email || '',
    status: 'pending_confirmation',
    createdAt: serverTimestamp(),
  });

  // Send an in-app notification to the farmer
  try {
    await sendAppNotification({
      userId: user.uid,
      title: 'Rental Request Submitted',
      body: `Your request for ${input.equipmentTitle} on ${input.requestedDate} has been submitted for provider confirmation.`,
      type: 'order',
    });
  } catch (notifErr) {
    console.warn('[FarmToolsService] Notification send failed:', notifErr);
  }

  return docRef.id;
};
