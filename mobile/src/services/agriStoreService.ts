import { Platform } from 'react-native';
import { getApiBaseUrl } from '../config/api';
import { fetchWithTimeout } from '../utils/networkUtil';
import { AgriProduct, AgriShop, AgriCategory } from '../types/agristore';

const getBaseUrl = () => getApiBaseUrl();

/**
 * Built-in verified offline dataset ensuring 100% reliable operation
 * even when disconnected from backend.
 */
export const FALLBACK_PRODUCTS: AgriProduct[] = [
  {
    id: 'fert_urea_iffco',
    name: 'IFFCO Neem Coated Urea (46% N)',
    nameTa: 'இப்கோ வேப்பம் பூசிய யூரியா (46% நைட்ரஜன்)',
    brand: 'IFFCO',
    category: 'fertilizer',
    subCategory: 'Nitrogenous Fertilizer (FCO Standard)',
    price: 266.5,
    mrp: 266.5,
    packSize: '45 kg Bag',
    unitPrice: '₹5.92 / kg',
    rating: 4.8,
    reviewsCount: 142,
    sellerName: 'PACCS Primary Agricultural Cooperative Depot',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description:
      'Neem-coated urea provides sustained nitrogen release, reducing leaching and volatilization loss while promoting robust vegetative tiller growth.',
    descriptionTa:
      'வேப்பம் பூசிய யூரியா பயிர்களுக்கு படிப்படியாக தழைச்சத்தை வழங்குகிறது. தூர் வெடிப்பதற்கும் பயிர் வளர்ச்சிக்கும் இன்றியமையாதது.',
    activeIngredients: 'Nitrogen 46.0% (Ammoniacal & Nitrate form), Neem extract coating',
    targetCrops: ['Paddy', 'Sugarcane', 'Maize', 'Banana', 'Cotton'],
    targetPestsOrNutrients: ['Vegetative Canopy Growth', 'Chlorophyll Synthesis', 'Tiller Multiplication'],
    dosageGuidance: 'Split application: Basal, Tillering, and Panicle Initiation as per TNAU Crop Production Guide.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Store in a dry, ventilated shed elevated on wooden pallets.',
      'Do not apply in stagnant water without field drainage.',
      'Keep away from cattle feed and direct sunlight.',
    ],
    disclaimer: 'Subsidized price subject to Aadhaar POS biometric verification at designated PACCS societies.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'fert_dap_coromandel',
    name: 'Coromandel Gromor DAP (18-46-0)',
    nameTa: 'கோரமண்டல் குரோமோர் டி.ஏ.பி (18-46-0)',
    brand: 'Coromandel',
    category: 'fertilizer',
    subCategory: 'Phosphatic Complex Fertilizer',
    price: 1350.0,
    mrp: 1350.0,
    packSize: '50 kg Bag',
    unitPrice: '₹27.00 / kg',
    rating: 4.9,
    reviewsCount: 96,
    sellerName: 'Tamil Nadu Agro Service Society',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description:
      'Di-Ammonium Phosphate with 46% water-soluble phosphate and 18% ammoniacal nitrogen, crucial for rapid root establishment and early seedling vigor.',
    descriptionTa:
      '18% தழைச்சத்து மற்றும் 46% மணிச்சத்து கொண்ட முதன்மை உரம். வேர் வளர்ச்சிக்கும் செடியின் ஆரம்ப கால உறுதிக்கும் சிறந்தது.',
    activeIngredients: 'Ammoniacal Nitrogen 18.0%, Available Phosphate (as P2O5) 46.0%',
    targetCrops: ['Paddy', 'Pulses', 'Groundnut', 'Cotton', 'Chillies'],
    targetPestsOrNutrients: ['Root Establishment', 'Early Tillering', 'Cell Division'],
    dosageGuidance: 'Apply primarily as a basal dose before transplanting or sowing for maximum phosphate uptake.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Do not mix with alkaline fertilizers like lime or calcium cyanamide.',
      'Incorporate into soil at root depth for best absorption.',
    ],
    disclaimer: 'Government subsidized rate for direct agricultural consumption.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'fert_mop_potash',
    name: 'SPIC Muriate of Potash (MOP 60% K2O)',
    nameTa: 'ஸ்பிக் பொட்டாஷ் (60% சாம்பல் சத்து)',
    brand: 'SPIC',
    category: 'fertilizer',
    subCategory: 'Potassic Fertilizer',
    price: 1650.0,
    mrp: 1700.0,
    packSize: '50 kg Bag',
    unitPrice: '₹33.00 / kg',
    rating: 4.7,
    reviewsCount: 68,
    sellerName: 'District Farmers Service Society',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description:
      'Essential potassic fertilizer containing 60% water-soluble potassium. Strengthens plant stems, resists lodging, enhances grain weight, and builds drought tolerance.',
    descriptionTa:
      '60% சாம்பல் சத்து கொண்ட உரம். பயிர் சாய்வதைத் தடுக்கும், தானியங்களின் எடையை அதிகரிக்கும், வறட்சியைத் தாங்கும் திறனைத் தரும்.',
    activeIngredients: 'Potassium (as K2O) 60.0% water soluble',
    targetCrops: ['Paddy', 'Banana', 'Sugarcane', 'Coconut', 'Vegetables'],
    targetPestsOrNutrients: ['Grain Filling', 'Lodging Resistance', 'Drought & Pest Resilience'],
    dosageGuidance: 'Apply in split doses: 50% basal and 50% at panicle initiation stage.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Keep bags tightly closed as potassium is hygroscopic.',
      'Avoid foliar application of standard MOP due to high salt index.',
    ],
    disclaimer: 'Official FCO certified input.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'org_tnau_pseudomonas',
    name: 'TNAU Pseudomonas fluorescens (1% WP)',
    nameTa: 'தமிழ்நாடு வேளாண் பல்கலைக்கழகம் சூடோமோனாஸ் (1% WP)',
    brand: 'TNAU Agronomy',
    category: 'organic',
    subCategory: 'Bio-Fungicide & Plant Probiotic',
    price: 90.0,
    mrp: 100.0,
    packSize: '1 kg Pkt',
    unitPrice: '₹90.00 / kg',
    rating: 4.9,
    reviewsCount: 184,
    sellerName: 'TNAU Farmers Service Center & KVK Depots',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description:
      'Beneficial bio-control agent that secretes natural antibiotics, inducing systemic resistance against bacterial leaf blight, sheath rot, and fungal root wilt.',
    descriptionTa:
      'பாக்டீரியா மற்றும் பூஞ்சை நோய்களை கட்டுப்படுத்தும் இயற்கை நுண்ணுயிர். இலைக்கருகல், வேரழுகல் நோய்களை கட்டுப்படுத்த சிறந்தது.',
    activeIngredients: 'Pseudomonas fluorescens strain (Min. 1x10^8 CFU/gram viable spores)',
    targetCrops: ['Paddy', 'Tomato', 'Brinjal', 'Chilli', 'Banana', 'Turmeric'],
    targetPestsOrNutrients: ['Bacterial Leaf Blight', 'Damping-Off', 'Sheath Rot', 'Root Wilt'],
    dosageGuidance: 'Seed treatment: 10g/kg of seed. Foliar spray: 5g/L water mixed with khadi soap sticker.',
    toxicityBand: 'bio',
    safetyWarnings: [
      'Do not mix with chemical copper or systemic bactericides/fungicides.',
      'Maintain an interval of at least 7 days before or after chemical spray.',
      'Store in cool, shaded conditions away from heat.',
    ],
    disclaimer: 'Organic certified bio-input suitable for PGS-India and NPOP certified farms.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'org_trichoderma_viride',
    name: 'TNAU Trichoderma Viride (1.5% WP)',
    nameTa: 'டி.என்.ஏ.யு டிரைக்கோடெர்மா விரிடி இயற்கை பூஞ்சைக் கொல்லி',
    brand: 'TNAU Agronomy',
    category: 'organic',
    subCategory: 'Antagonistic Bio-Agent',
    price: 95.0,
    mrp: 110.0,
    packSize: '1 kg Pkt',
    unitPrice: '₹95.00 / kg',
    rating: 4.8,
    reviewsCount: 75,
    sellerName: 'Agri Extension Bio-Production Centre',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description:
      'Eco-friendly fungal antagonist that colonizes rhizosphere roots and parasitizes soil-borne pathogens like Pythium, Rhizoctonia, and Fusarium.',
    descriptionTa:
      'மண்ணில் தோன்றும் பூஞ்சை நோய்களை வேரோடு அழிக்கும் நன்மை செய்யும் பூஞ்சை. நாற்று அழுகல் மற்றும் வாடல் நோய்க்கு தடுப்பு மருந்து.',
    activeIngredients: 'Trichoderma viride (Min. 2x10^6 CFU/g)',
    targetCrops: ['Pulses', 'Oilseeds', 'Cotton', 'Vegetables', 'Paddy'],
    targetPestsOrNutrients: ['Root Rot', 'Collar Rot', 'Wilt Pathogens'],
    dosageGuidance: 'Soil application: 2.5 kg mixed with 50 kg well-decomposed FYM/vermicompost per acre.',
    toxicityBand: 'bio',
    safetyWarnings: [
      'Apply to moist soil for rapid fungal mycelium colonization.',
      'Never mix directly with chemical fungicides.',
    ],
    disclaimer: '100% Residue-free biological input.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'prot_coragen_fmc',
    name: 'FMC Coragen (Chlorantraniliprole 18.5% SC)',
    nameTa: 'எப்.எம்.சி கோரஜென் பூச்சிக்கொல்லி (18.5% SC)',
    brand: 'FMC India',
    category: 'crop_protection',
    subCategory: 'Rynaxypyr Group Insecticide',
    price: 940.0,
    mrp: 990.0,
    packSize: '150 ml Bottle',
    unitPrice: '₹6.27 / ml',
    rating: 4.9,
    reviewsCount: 210,
    sellerName: 'Kaveri Agro Chemicals (Authorized Dealer)',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description:
      'Advanced anthranilic diamide insecticide providing targeted control of Lepidopteran stem borers, leaf folders, and shoot borers with low mammalian toxicity.',
    descriptionTa:
      'நெல் தண்டு துளைப்பான் மற்றும் இலை சுருட்டு புழுவை கட்டுப்படுத்தும் அதிநவீன பூச்சிக்கொல்லி. பயிரை நீண்ட நாட்கள் புழுக்களிலிருந்து பாதுகாக்கும்.',
    activeIngredients: 'Chlorantraniliprole 18.5% w/w SC',
    targetCrops: ['Paddy', 'Sugarcane', 'Tomato', 'Cabbage', 'Soybean'],
    targetPestsOrNutrients: ['Paddy Stem Borer (Scirpophaga)', 'Leaf Folder (Cnaphalocrocis)', 'Tomato Fruit Borer'],
    dosageGuidance: 'Paddy: 60 ml per acre dissolved in 200 liters of water using knapsack sprayer.',
    toxicityBand: 'green',
    waitingPeriodDays: 14,
    safetyWarnings: [
      '🟢 Statutory Toxicity: GREEN BAND (Slightly Toxic / Caution).',
      'Wear protective mask, goggles, and rubber gloves during tank mixing.',
      'Do not spray against the wind or near apiaries (beehives).',
      'Pre-Harvest Interval (PHI): Observe strictly a 14-day waiting period before crop harvest.',
      'Triple rinse and puncture empty containers; never re-use for food storage.',
    ],
    disclaimer: 'Statutory warning: Follow label recommendation. Do not exceed prescribed dosage. Consult your local agricultural officer.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'prot_contaf_plus_tata',
    name: 'Tata Rallis Contaf Plus (Hexaconazole 5% SC)',
    nameTa: 'டாடா காண்டாப் பிளஸ் பூஞ்சைக் கொல்லி (5% SC)',
    brand: 'Tata Rallis',
    category: 'crop_protection',
    subCategory: 'Systemic Triazole Fungicide',
    price: 360.0,
    mrp: 395.0,
    packSize: '500 ml Bottle',
    unitPrice: '₹0.72 / ml',
    rating: 4.8,
    reviewsCount: 115,
    sellerName: 'Lakshmi Agro Services',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description:
      'Broad-spectrum systemic triazole fungicide with protective, curative, and eradicant action against sheath blight, powdery mildew, rust, and leaf spots.',
    descriptionTa:
      'நெல் இலை உறை அழுகல், கருகல் நோய் மற்றும் சாம்பல் நோயை துல்லியமாக கட்டுப்படுத்தும் உள்வாங்கும் பூஞ்சைக் கொல்லி.',
    activeIngredients: 'Hexaconazole 5.0% SC',
    targetCrops: ['Paddy', 'Groundnut', 'Mango', 'Chilli', 'Grapes'],
    targetPestsOrNutrients: ['Sheath Blight (Rhizoctonia solani)', 'Tikka Leaf Spot', 'Powdery Mildew'],
    dosageGuidance: '2.0 ml per liter of water (400 ml per acre) as thorough foliar spray when disease symptoms first appear.',
    toxicityBand: 'blue',
    waitingPeriodDays: 30,
    safetyWarnings: [
      '🔵 Statutory Toxicity: BLUE BAND (Moderately Toxic / Danger).',
      'Use face shield, respirator mask, and chemical-resistant gloves.',
      'Pre-Harvest Interval (PHI): 30 days mandatory before harvest.',
      'Wash thoroughly with clean soap and water after handling.',
    ],
    disclaimer: 'Prescription chemical. Avoid prophylactic misuse without disease confirmation.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'care_tnau_paddy_wonder',
    name: 'TNAU Paddy Wonder (Growth & Yield Booster)',
    nameTa: 'டி.என்.ஏ.யு நெல் வொண்டர் (வளர்ச்சி & மகசூல் ஊக்கி)',
    brand: 'TNAU Agronomy',
    category: 'crop_care',
    subCategory: 'Micronutrient & Growth formulation',
    price: 240.0,
    mrp: 260.0,
    packSize: '2 kg Pkt',
    unitPrice: '₹120.00 / kg',
    rating: 4.9,
    reviewsCount: 176,
    sellerName: 'District Agriculture Extension Center',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description:
      'Specially formulated booster by TNAU containing chelated micronutrients and bio-enhancers that increases panicle length, reduces grain chaffiness by 10-15%, and boosts overall grain weight.',
    descriptionTa:
      'நெல் மணி பதராவதை தடுத்து, கதிரின் நீளத்தையும் எடையையும் 15% வரை அதிகரிக்கும் சிறப்பு ஊட்டச்சத்து கலவை.',
    activeIngredients: 'Zinc (Zn), Boron (B), Iron (Fe), Potassium, Salicylic acid derivative booster',
    targetCrops: ['Paddy'],
    targetPestsOrNutrients: ['Chaffy Grain Reduction', 'Flag Leaf Longevity', 'Panicle Exsertion'],
    dosageGuidance: '2 kg per acre dissolved in 200 liters of water sprayed at boot leaf stage.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Spray in morning before 10 AM or evening after 3 PM.',
      'Can be safely combined with mild fungicides if needed.',
    ],
    disclaimer: 'Official formulation developed and validated by Tamil Nadu Agricultural University.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'seed_co51_paddy',
    name: 'TNAU Certified Paddy Seeds - CO 51 (High Yield)',
    nameTa: 'டி.என்.ஏ.யு சான்று பெற்ற நெல் விதை - கோ 51 (குறுகிய கால ரகம்)',
    brand: 'TNAU Seed Centre',
    category: 'seeds',
    subCategory: 'Foundation / Certified Class Paddy',
    price: 980.0,
    mrp: 1050.0,
    packSize: '25 kg Bag',
    unitPrice: '₹39.20 / kg',
    rating: 4.9,
    reviewsCount: 130,
    sellerName: 'Govt. Agricultural Extension Depot',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description:
      '105–110 days short duration high-yielding fine grain variety, resistant to blast disease with exceptional cooking quality, suitable for Kuruvai/Navarai seasons.',
    descriptionTa:
      '105-110 நாட்கள் குறுகிய கால சன்ன ரக நெல். குலை நோயை எதிர்க்கும் தன்மை கொண்டது, குருவை மற்றும் நவரை பட்டத்திற்கு மிகவும் உகந்தது.',
    activeIngredients: 'Certified seed purity 99.0%, Germination capacity min 85%',
    targetCrops: ['Kuruvai Season', 'Navarai Season', 'Sornavari Season'],
    targetPestsOrNutrients: ['Blast Disease Resistance', 'Non-lodging Straw', 'High Milling Recovery'],
    dosageGuidance: 'Seed rate: 10-12 kg for Mat Nursery (SRI), 20-25 kg for traditional wet nursery per acre.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Pre-treated with Carbendazim/Pseudomonas. Not for consumption or livestock feed.',
      'Sow within the designated season for certified germination vigor.',
    ],
    disclaimer: 'State Seed Certification Agency (TSSCA) certified lot.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },
];

export const FALLBACK_SHOPS: AgriShop[] = [
  {
    id: 'shop_paccs_trichy_central',
    name: 'Lalgudi Primary Agricultural Cooperative Credit Society (PACCS)',
    nameTa: 'லால்குடி தொடக்க வேளாண்மை கூட்டுறவு கடன் சங்கம் (PACCS)',
    type: 'cooperative',
    district: 'Trichy',
    address: 'Main Road, Near Bus Stand, Lalgudi, Trichy - 621601',
    phone: '0431-2541234',
    timing: '8:30 AM - 5:30 PM (Mon-Sat)',
    latitude: 10.8711,
    longitude: 78.8152,
    authorizedBrands: ['IFFCO', 'SPIC', 'KRIBHCO', 'TNAU Agronomy'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: true,
    isVerified: true,
  },
  {
    id: 'shop_depot_thanjavur_pundi',
    name: 'Thanjavur District Farmers Agro Service & Input Center',
    nameTa: 'தஞ்சாவூர் மாவட்ட விவசாயிகள் உழவர் சேவை & இடுபொருள் மையம்',
    type: 'authorized_dealer',
    district: 'Thanjavur',
    address: 'Karanthai Agri Market Road, Thanjavur - 613002',
    phone: '04362-238491',
    timing: '8:00 AM - 7:00 PM (Daily)',
    latitude: 10.7932,
    longitude: 79.1435,
    authorizedBrands: ['Coromandel', 'FMC India', 'Tata Rallis', 'Kaveri Seeds'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: false,
    isVerified: true,
  },
  {
    id: 'shop_tnau_kvk_madurai',
    name: 'TNAU Agricultural College & KVK Farmers Input Hub',
    nameTa: 'டி.என்.ஏ.யு வேளாண்மை கல்லூரி & கே.வி.கே உழவர் இடுபொருள் மையம்',
    type: 'government_depot',
    district: 'Madurai',
    address: 'Agricultural College Campus, Othakadai, Madurai - 625104',
    phone: '0452-2422956',
    timing: '9:00 AM - 5:00 PM (Mon-Fri)',
    latitude: 9.9723,
    longitude: 78.1945,
    authorizedBrands: ['TNAU Agronomy', 'TNAU Seed Centre', 'Bio-Control Agents'],
    subsidizedUreaAvailable: false,
    subsidizedDapAvailable: false,
    isVerified: true,
  },
  {
    id: 'shop_paccs_erode_perundurai',
    name: 'Perundurai Agro Cooperative Society & Fertilizer Warehouse',
    nameTa: 'பெருந்துறை தொடக்க வேளாண்மை கூட்டுறவு சங்கம் & உரக்கிடங்கு',
    type: 'cooperative',
    district: 'Erode',
    address: 'Near Perundurai Weekly Santhai, Erode - 638052',
    phone: '04294-220145',
    timing: '8:00 AM - 6:00 PM (Mon-Sat)',
    latitude: 11.2762,
    longitude: 77.5833,
    authorizedBrands: ['IFFCO', 'Coromandel', 'SPIC'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: true,
    isVerified: true,
  },
  {
    id: 'shop_coimbatore_agro_center',
    name: 'Coimbatore District Central Cooperative Agri Depot',
    nameTa: 'கோயம்புத்தூர் மாவட்ட மத்திய கூட்டுறவு வேளாண் இடுபொருள் மையம்',
    type: 'cooperative',
    district: 'Coimbatore',
    address: 'Mettupalayam Road, Near Central Bus Stand, Coimbatore - 641043',
    phone: '0422-2438765',
    timing: '8:30 AM - 6:30 PM (Mon-Sat)',
    latitude: 11.021,
    longitude: 76.958,
    authorizedBrands: ['IFFCO', 'TNAU Seed Centre', 'Syngenta', 'FMC India'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: true,
    isVerified: true,
  },
];

/**
 * Fetch products from backend or local fallback.
 */
export const fetchAgriProducts = async (
  category: AgriCategory = 'all',
  searchQuery: string = ''
): Promise<AgriProduct[]> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      let url = `${baseUrl}/agri-store/products?category=${category}`;
      if (searchQuery.trim()) {
        url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetchWithTimeout(url, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.products)) {
          return json.data.products;
        }
      }
    } catch (err) {
      console.warn('[AgriStore] Backend fetch failed, using verified fallback:', err);
    }
  }

  // Local fallback filter
  let list = [...FALLBACK_PRODUCTS];
  if (category !== 'all') {
    list = list.filter((p) => p.category === category);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameTa.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.activeIngredients.toLowerCase().includes(q)
    );
  }
  return list;
};

/**
 * Fetch a single product by ID.
 */
export const fetchAgriProductById = async (id: string): Promise<AgriProduct | null> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetchWithTimeout(`${baseUrl}/agri-store/products/${id}`, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('[AgriStore] Detail fetch failed, checking local dataset:', err);
    }
  }

  return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
};

/**
 * Fetch nearby agricultural shops by GPS or district.
 */
export const fetchNearbyShops = async (
  district: string = 'All',
  coords?: { latitude: number; longitude: number }
): Promise<AgriShop[]> => {
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    try {
      let url = `${baseUrl}/agri-store/shops?district=${encodeURIComponent(district)}`;
      if (coords) {
        url += `&lat=${coords.latitude}&lon=${coords.longitude}`;
      }

      const res = await fetchWithTimeout(url, {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.shops)) {
          return json.data.shops;
        }
      }
    } catch (err) {
      console.warn('[AgriStore] Shops fetch failed, using fallback:', err);
    }
  }

  let list = [...FALLBACK_SHOPS];
  if (district !== 'All') {
    list = list.filter((s) => s.district.toLowerCase() === district.toLowerCase());
  }
  return list;
};
