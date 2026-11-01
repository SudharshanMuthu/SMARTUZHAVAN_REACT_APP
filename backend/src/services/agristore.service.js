/**
 * Agri Care Store Service for Smart Uzhavan Backend.
 * Serves verified fertilizers, bio-inputs, crop protection products, seeds,
 * and certified PACCS / Authorized agricultural input dealers in Tamil Nadu.
 *
 * Adheres strictly to Fertilizer Control Order (FCO) & CIBRC safety guidelines.
 */

export const AGRI_PRODUCTS = [
  // 1. Fertilizers (Chemical / Inorganic)
  {
    id: 'fert_urea_iffco',
    name: 'IFFCO Neem Coated Urea (46% N)',
    nameTa: 'இப்கோ வேப்பம் பூசிய யூரியா (46% நைட்ரஜன்)',
    brand: 'IFFCO',
    category: 'fertilizer',
    subCategory: 'Nitrogenous Fertilizer (FCO Standard)',
    price: 266.50,
    mrp: 266.50,
    packSize: '45 kg Bag',
    unitPrice: '₹5.92 / kg',
    rating: 4.8,
    reviewsCount: 142,
    sellerName: 'PACCS Primary Agricultural Cooperative Depot',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description: 'Neem-coated urea provides sustained nitrogen release, reducing leaching and volatilization loss while promoting robust vegetative tiller growth.',
    descriptionTa: 'வேப்பம் பூசிய யூரியா பயிர்களுக்கு படிப்படியாக தழைச்சத்தை வழங்குகிறது. தூர் வெடிப்பதற்கும் பயிர் வளர்ச்சிக்கும் இன்றியமையாதது.',
    activeIngredients: 'Nitrogen 46.0% (Ammoniacal & Nitrate form), Neem extract coating',
    targetCrops: ['Paddy', 'Sugarcane', 'Maize', 'Banana', 'Cotton'],
    targetPestsOrNutrients: ['Vegetative Canopy Growth', 'Chlorophyll Synthesis', 'Tiller Multiplication'],
    dosageGuidance: 'Split application: Basal, Tillering, and Panicle Initiation as per TNAU Crop Production Guide.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Store in a dry, ventilated shed elevated on wooden pallets.',
      'Do not apply in stagnant water without field drainage.',
      'Keep away from cattle feed and direct sunlight.'
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
    price: 1350.00,
    mrp: 1350.00,
    packSize: '50 kg Bag',
    unitPrice: '₹27.00 / kg',
    rating: 4.9,
    reviewsCount: 96,
    sellerName: 'Tamil Nadu Agro Service Society',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description: 'Di-Ammonium Phosphate with 46% water-soluble phosphate and 18% ammoniacal nitrogen, crucial for rapid root establishment and early seedling vigor.',
    descriptionTa: '18% தழைச்சத்து மற்றும் 46% மணிச்சத்து கொண்ட முதன்மை உரம். வேர் வளர்ச்சிக்கும் செடியின் ஆரம்ப கால உறுதிக்கும் சிறந்தது.',
    activeIngredients: 'Ammoniacal Nitrogen 18.0%, Available Phosphate (as P2O5) 46.0%',
    targetCrops: ['Paddy', 'Pulses', 'Groundnut', 'Cotton', 'Chillies'],
    targetPestsOrNutrients: ['Root Establishment', 'Early Tillering', 'Cell Division'],
    dosageGuidance: 'Apply primarily as a basal dose before transplanting or sowing for maximum phosphate uptake.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Do not mix with alkaline fertilizers like lime or calcium cyanamide.',
      'Incorporate into soil at root depth for best absorption.'
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
    price: 1650.00,
    mrp: 1700.00,
    packSize: '50 kg Bag',
    unitPrice: '₹33.00 / kg',
    rating: 4.7,
    reviewsCount: 68,
    sellerName: 'District Farmers Service Society',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description: 'Essential potassic fertilizer containing 60% water-soluble potassium. Strengthens plant stems, resists lodging, enhances grain weight, and builds drought tolerance.',
    descriptionTa: '60% சாம்பல் சத்து கொண்ட உரம். பயிர் சாய்வதைத் தடுக்கும், தானியங்களின் எடையை அதிகரிக்கும், வறட்சியைத் தாங்கும் திறனைத் தரும்.',
    activeIngredients: 'Potassium (as K2O) 60.0% water soluble',
    targetCrops: ['Paddy', 'Banana', 'Sugarcane', 'Coconut', 'Vegetables'],
    targetPestsOrNutrients: ['Grain Filling', 'Lodging Resistance', 'Drought & Pest Resilience'],
    dosageGuidance: 'Apply in split doses: 50% basal and 50% at panicle initiation stage.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Keep bags tightly closed as potassium is hygroscopic.',
      'Avoid foliar application of standard MOP due to high salt index.'
    ],
    disclaimer: 'Official FCO certified input.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },

  // 2. Organic & Bio-Fertilizers
  {
    id: 'org_tnau_pseudomonas',
    name: 'TNAU Pseudomonas fluorescens (1% WP)',
    nameTa: 'தமிழ்நாடு வேளாண் பல்கலைக்கழகம் சூடோமோனாஸ் (1% WP)',
    brand: 'TNAU Agronomy',
    category: 'organic',
    subCategory: 'Bio-Fungicide & Plant Probiotic',
    price: 90.00,
    mrp: 100.00,
    packSize: '1 kg Pkt',
    unitPrice: '₹90.00 / kg',
    rating: 4.9,
    reviewsCount: 184,
    sellerName: 'TNAU Farmers Service Center & KVK Depots',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description: 'Beneficial bio-control agent that secretes natural antibiotics, inducing systemic resistance against bacterial leaf blight, sheath rot, and fungal root wilt.',
    descriptionTa: 'பாக்டீரியா மற்றும் பூஞ்சை நோய்களை கட்டுப்படுத்தும் இயற்கை நுண்ணுயிர். இலைக்கருகல், வேரழுகல் நோய்களை கட்டுப்படுத்த சிறந்தது.',
    activeIngredients: 'Pseudomonas fluorescens strain (Min. 1x10^8 CFU/gram viable spores)',
    targetCrops: ['Paddy', 'Tomato', 'Brinjal', 'Chilli', 'Banana', 'Turmeric'],
    targetPestsOrNutrients: ['Bacterial Leaf Blight', 'Damping-Off', 'Sheath Rot', 'Root Wilt'],
    dosageGuidance: 'Seed treatment: 10g/kg of seed. Foliar spray: 5g/L water mixed with khadi soap sticker.',
    toxicityBand: 'bio',
    safetyWarnings: [
      'Do not mix with chemical copper or systemic bactericides/fungicides.',
      'Maintain an interval of at least 7 days before or after chemical spray.',
      'Store in cool, shaded conditions away from heat.'
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
    price: 95.00,
    mrp: 110.00,
    packSize: '1 kg Pkt',
    unitPrice: '₹95.00 / kg',
    rating: 4.8,
    reviewsCount: 75,
    sellerName: 'Agri Extension Bio-Production Centre',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description: 'Eco-friendly fungal antagonist that colonizes rhizosphere roots and parasitizes soil-borne pathogens like Pythium, Rhizoctonia, and Fusarium.',
    descriptionTa: 'மண்ணில் தோன்றும் பூஞ்சை நோய்களை வேரோடு அழிக்கும் நன்மை செய்யும் பூஞ்சை. நாற்று அழுகல் மற்றும் வாடல் நோய்க்கு தடுப்பு மருந்து.',
    activeIngredients: 'Trichoderma viride (Min. 2x10^6 CFU/g)',
    targetCrops: ['Pulses', 'Oilseeds', 'Cotton', 'Vegetables', 'Paddy'],
    targetPestsOrNutrients: ['Root Rot', 'Collar Rot', 'Wilt Pathogens'],
    dosageGuidance: 'Soil application: 2.5 kg mixed with 50 kg well-decomposed FYM/vermicompost per acre.',
    toxicityBand: 'bio',
    safetyWarnings: [
      'Apply to moist soil for rapid fungal mycelium colonization.',
      'Never mix directly with chemical fungicides.'
    ],
    disclaimer: '100% Residue-free biological input.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'org_vermicompost_premium',
    name: 'Tamil Nadu Organic Vermicompost (Nutrient Enriched)',
    nameTa: 'மண்புழு உரம் (ஊட்டமேற்றப்பட்ட இயற்கை உரம்)',
    brand: 'TN Organic Farmers Federation',
    category: 'organic',
    subCategory: 'Organic Soil Amendment',
    price: 350.00,
    mrp: 400.00,
    packSize: '40 kg Bag',
    unitPrice: '₹8.75 / kg',
    rating: 4.7,
    reviewsCount: 52,
    sellerName: 'PACCS Agro Input Outlet',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description: 'Earthworm cast processed compost packed with micro-flora, humic acid, and balanced micronutrients that restores degraded soil organic carbon (SOC).',
    descriptionTa: 'மண் வளத்தை பெருக்கும் ஊட்டமேற்றப்பட்ட மண்புழு உரம். மண்ணின் நீர்பிடிப்பு திறனை அதிகரித்து நுண்ணுயிர் பெருக்கத்திற்கு உதவுகிறது.',
    activeIngredients: 'Humus organic matter 18-20%, Organic Carbon min 14%, Total NPK 1.5-2.0%',
    targetCrops: ['All crops', 'Paddy', 'Banana', 'Coconut', 'Vegetables', 'Flowers'],
    targetPestsOrNutrients: ['Soil Organic Carbon Enrichment', 'Moisture Retention', 'Soil Aeration'],
    dosageGuidance: 'Basal application: 500 kg to 1 Ton per acre depending on soil organic matter status.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Store covered to prevent loss of beneficial microbial moisture.'
    ],
    disclaimer: '100% natural, chemical-free compost.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },

  // 3. Crop Protection (Insecticides, Fungicides, Herbicides)
  {
    id: 'prot_coragen_fmc',
    name: 'FMC Coragen (Chlorantraniliprole 18.5% SC)',
    nameTa: 'எப்.எம்.சி கோரஜென் பூச்சிக்கொல்லி (18.5% SC)',
    brand: 'FMC India',
    category: 'crop_protection',
    subCategory: 'Rynaxypyr Group Insecticide',
    price: 940.00,
    mrp: 990.00,
    packSize: '150 ml Bottle',
    unitPrice: '₹6.27 / ml',
    rating: 4.9,
    reviewsCount: 210,
    sellerName: 'Kaveri Agro Chemicals (Authorized Dealer)',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description: 'Advanced anthranilic diamide insecticide providing targeted control of Lepidopteran stem borers, leaf folders, and shoot borers with low mammalian toxicity.',
    descriptionTa: 'நெல் தண்டு துளைப்பான் மற்றும் இலை சுருட்டு புழுவை கட்டுப்படுத்தும் அதிநவீன பூச்சிக்கொல்லி. பயிரை நீண்ட நாட்கள் புழுக்களிலிருந்து பாதுகாக்கும்.',
    activeIngredients: 'Chlorantraniliprole 18.5% w/w SC',
    targetCrops: ['Paddy', 'Sugarcane', 'Tomato', 'Cabbage', 'Soybean'],
    targetPestsOrNutrients: ['Paddy Stem Borer (Scirpophaga)', 'Leaf Folder (Cnaphalocrocis)', 'Tomato Fruit Borer'],
    dosageGuidance: 'Paddy: 60 ml per acre dissolved in 200 liters of water using knapsack sprayer.',
    toxicityBand: 'green', // Slightly toxic / Caution
    waitingPeriodDays: 14,
    safetyWarnings: [
      '🟢 Statutory Toxicity: GREEN BAND (Slightly Toxic / Caution).',
      'Wear protective mask, goggles, and rubber gloves during tank mixing.',
      'Do not spray against the wind or near apiaries (beehives).',
      'Pre-Harvest Interval (PHI): Observe strictly a 14-day waiting period before crop harvest.',
      'Triple rinse and puncture empty containers; never re-use for food storage.'
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
    price: 360.00,
    mrp: 395.00,
    packSize: '500 ml Bottle',
    unitPrice: '₹0.72 / ml',
    rating: 4.8,
    reviewsCount: 115,
    sellerName: 'Lakshmi Agro Services',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description: 'Broad-spectrum systemic triazole fungicide with protective, curative, and eradicant action against sheath blight, powdery mildew, rust, and leaf spots.',
    descriptionTa: 'நெல் இலை உறை அழுகல், கருகல் நோய் மற்றும் சாம்பல் நோயை துல்லியமாக கட்டுப்படுத்தும் உள்வாங்கும் பூஞ்சைக் கொல்லி.',
    activeIngredients: 'Hexaconazole 5.0% SC',
    targetCrops: ['Paddy', 'Groundnut', 'Mango', 'Chilli', 'Grapes'],
    targetPestsOrNutrients: ['Sheath Blight (Rhizoctonia solani)', 'Tikka Leaf Spot', 'Powdery Mildew'],
    dosageGuidance: '2.0 ml per liter of water (400 ml per acre) as thorough foliar spray when disease symptoms first appear.',
    toxicityBand: 'blue', // Moderately toxic / Danger
    waitingPeriodDays: 30,
    safetyWarnings: [
      '🔵 Statutory Toxicity: BLUE BAND (Moderately Toxic / Danger).',
      'Use face shield, respirator mask, and chemical-resistant gloves.',
      'Pre-Harvest Interval (PHI): 30 days mandatory before harvest.',
      'Wash thoroughly with clean soap and water after handling.'
    ],
    disclaimer: 'Prescription chemical. Avoid prophylactic misuse without disease confirmation.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'prot_neem_oil_azadirachtin',
    name: 'TNAU Bio-Neem 10,000 PPM (Cold Pressed Azadirachtin)',
    nameTa: 'டி.என்.ஏ.யு இயற்கை வேப்பெண்ணெய் கரைசல் (10,000 PPM)',
    brand: 'TNAU Agronomy',
    category: 'crop_protection',
    subCategory: 'Botanical Insecticide & Repellent',
    price: 420.00,
    mrp: 480.00,
    packSize: '1 Liter Bottle',
    unitPrice: '₹420.00 / L',
    rating: 4.7,
    reviewsCount: 88,
    sellerName: 'PACCS Primary Agri Center',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description: 'Natural botanical pest antifeedant, repellent, and oviposition deterrent effective against whiteflies, aphids, thrips, and early caterpillar stages.',
    descriptionTa: 'அசுவினி, தத்துப்பூச்சி, இலைப்பேன் மற்றும் வெள்ளை ஈக்களை விரட்டியடிக்கும் இயற்கை மூலிகை பூச்சி விரட்டி.',
    activeIngredients: 'Azadirachtin 1% EC (10,000 PPM) with natural neem limonoids',
    targetCrops: ['Paddy', 'Cotton', 'Vegetables', 'Pulses', 'Horticulture'],
    targetPestsOrNutrients: ['Sucking Pests', 'Whitefly', 'Thrips', 'Aphids', 'Mites'],
    dosageGuidance: '2.5 to 3.0 ml per liter of water with 1 ml Teepol/khadi soap sticker during evening hours.',
    toxicityBand: 'bio',
    waitingPeriodDays: 3,
    safetyWarnings: [
      'Eco-friendly biological product safe for non-target honeybees and fish.',
      'Apply during early morning or late evening hours to avoid photo-degradation.'
    ],
    disclaimer: 'CIBRC registered bio-botanical pest management formulation.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'prot_pretilachlor_rifit',
    name: 'Syngenta Rifit (Pretilachlor 50% EC)',
    nameTa: 'சின்ஜெண்டா ரிஃபிட் களைக்கொல்லி (50% EC)',
    brand: 'Syngenta',
    category: 'crop_protection',
    subCategory: 'Pre-Emergence Selective Herbicide',
    price: 520.00,
    mrp: 560.00,
    packSize: '1 Liter Bottle',
    unitPrice: '₹520.00 / L',
    rating: 4.6,
    reviewsCount: 64,
    sellerName: 'Trichy Central Agro Agency',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description: 'Selective pre-emergence herbicide for transplanted paddy that inhibits cell division in germinating grassy weeds, sedges, and broad-leaf weeds.',
    descriptionTa: 'நெல் நடவு செய்த 2 முதல் 4 நாட்களில் தெளிக்கப்படும் முன்-முளைப்பு களைக்கொல்லி. புல், கோரை களைகளை முளையவிடாமல் தடுக்கும்.',
    activeIngredients: 'Pretilachlor 50% w/w EC',
    targetCrops: ['Transplanted Paddy', 'Direct Seeded Wet Paddy'],
    targetPestsOrNutrients: ['Echinochloa (Barnyard grass)', 'Cyperus (Sedges)', 'Broadleaved Weeds'],
    dosageGuidance: '500 ml per acre within 2-4 days of transplanting in standing water (2-3 cm depth).',
    toxicityBand: 'blue',
    waitingPeriodDays: 60,
    safetyWarnings: [
      '🔵 Statutory Toxicity: BLUE BAND (Danger).',
      'Do not drain or add flood water for 48 hours following herbicide application.',
      'Always use dedicated herbicide sprayers; do not use the same sprayer for insecticides without decontaminating.'
    ],
    disclaimer: 'Maintain standing water layer for 48 hours for herbicide seal barrier.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },

  // 4. Crop-Care & Micronutrients
  {
    id: 'care_tnau_paddy_wonder',
    name: 'TNAU Paddy Wonder (Growth & Yield Booster)',
    nameTa: 'டி.என்.ஏ.யு நெல் வொண்டர் (வளர்ச்சி & மகசூல் ஊக்கி)',
    brand: 'TNAU Agronomy',
    category: 'crop_care',
    subCategory: 'Micronutrient & Growth formulation',
    price: 240.00,
    mrp: 260.00,
    packSize: '2 kg Pkt',
    unitPrice: '₹120.00 / kg',
    rating: 4.9,
    reviewsCount: 176,
    sellerName: 'District Agriculture Extension Center',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description: 'Specially formulated booster by TNAU containing chelated micronutrients and bio-enhancers that increases panicle length, reduces grain chaffiness by 10-15%, and boosts overall grain weight.',
    descriptionTa: 'நெல் மணி பதராவதை தடுத்து, கதிரின் நீளத்தையும் எடையையும் 15% வரை அதிகரிக்கும் சிறப்பு ஊட்டச்சத்து கலவை.',
    activeIngredients: 'Zinc (Zn), Boron (B), Iron (Fe), Potassium, Salicylic acid derivative booster',
    targetCrops: ['Paddy'],
    targetPestsOrNutrients: ['Chaffy Grain Reduction', 'Flag Leaf Longevity', 'Panicle Exsertion'],
    dosageGuidance: '2 kg per acre dissolved in 200 liters of water sprayed at boot leaf stage.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Spray in morning before 10 AM or evening after 3 PM.',
      'Can be safely combined with mild fungicides if needed.'
    ],
    disclaimer: 'Official formulation developed and validated by Tamil Nadu Agricultural University.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'care_humic_acid_liquid',
    name: 'GreenField Humic Acid 12% (Root Developer)',
    nameTa: 'ஹியூமிக் அமிலம் 12% (வேர் வளர்ச்சி ஊக்கி)',
    brand: 'GreenField Agritech',
    category: 'crop_care',
    subCategory: 'Bio-Stimulant Soil Conditioner',
    price: 320.00,
    mrp: 380.00,
    packSize: '1 Liter Bottle',
    unitPrice: '₹320.00 / L',
    rating: 4.7,
    reviewsCount: 45,
    sellerName: 'Uzhavan Farmers Producer Outlet',
    sellerType: 'cooperative',
    availability: 'in_stock',
    description: 'Naturally derived leonardite humic and fulvic extract that unlocks tied-up soil phosphorus, stimulates lateral feeder roots, and optimizes fertilizer efficiency.',
    descriptionTa: 'மண்ணில் உள்ள மணிச்சத்தை விடுவித்து, பக்கவாட்டு வெள்ளை வேர்களை பெருக்கி உரம் எடுக்கும் திறனை அதிகப்படுத்தும் இயற்கை திரவம்.',
    activeIngredients: 'Potassium Humate 12.0%, Fulvic Acid 3.0%',
    targetCrops: ['All crops', 'Banana', 'Tomato', 'Turmeric', 'Paddy', 'Vegetables'],
    targetPestsOrNutrients: ['Feeder Root Stimulation', 'Nutrient Chelation', 'Transplant Shock Recovery'],
    dosageGuidance: 'Drip irrigation: 1 Liter per acre. Drenching/Foliar: 3 ml per liter.',
    toxicityBand: 'bio',
    safetyWarnings: [
      'Non-toxic bio-stimulant. Shake well before use.'
    ],
    disclaimer: 'Natural soil health enhancer.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },

  // 5. Seeds & Planting Materials
  {
    id: 'seed_co51_paddy',
    name: 'TNAU Certified Paddy Seeds - CO 51 (High Yield)',
    nameTa: 'டி.என்.ஏ.யு சான்று பெற்ற நெல் விதை - கோ 51 (குறுகிய கால ரகம்)',
    brand: 'TNAU Seed Centre',
    category: 'seeds',
    subCategory: 'Foundation / Certified Class Paddy',
    price: 980.00,
    mrp: 1050.00,
    packSize: '25 kg Bag',
    unitPrice: '₹39.20 / kg',
    rating: 4.9,
    reviewsCount: 130,
    sellerName: 'Govt. Agricultural Extension Depot',
    sellerType: 'government_depot',
    availability: 'in_stock',
    description: '105–110 days short duration high-yielding fine grain variety, resistant to blast disease with exceptional cooking quality, suitable for Kuruvai/Navarai seasons.',
    descriptionTa: '105-110 நாட்கள் குறுகிய கால சன்ன ரக நெல். குலை நோயை எதிர்க்கும் தன்மை கொண்டது, குருவை மற்றும் நவரை பட்டத்திற்கு மிகவும் உகந்தது.',
    activeIngredients: 'Certified seed purity 99.0%, Germination capacity min 85%',
    targetCrops: ['Kuruvai Season', 'Navarai Season', 'Sornavari Season'],
    targetPestsOrNutrients: ['Blast Disease Resistance', 'Non-lodging Straw', 'High Milling Recovery'],
    dosageGuidance: 'Seed rate: 10-12 kg for Mat Nursery (SRI), 20-25 kg for traditional wet nursery per acre.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Pre-treated with Carbendazim/Pseudomonas. Not for consumption or livestock feed.',
      'Sow within the designated season for certified germination vigor.'
    ],
    disclaimer: 'State Seed Certification Agency (TSSCA) certified lot.',
    isSubsidized: true,
    isVerifiedGovtApproved: true,
  },
  {
    id: 'seed_bpt5204_andhra_ponni',
    name: 'Kaveri Certified Paddy Seeds - BPT 5204 (Andhra Ponni)',
    nameTa: 'காவேரி சான்று பெற்ற நெல் விதை - பி.பி.டி 5204 (ஆந்திரா பொன்னி)',
    brand: 'Kaveri Seeds',
    category: 'seeds',
    subCategory: 'Fine Grain Super-Fine Variety',
    price: 1150.00,
    mrp: 1220.00,
    packSize: '25 kg Bag',
    unitPrice: '₹46.00 / kg',
    rating: 4.8,
    reviewsCount: 82,
    sellerName: 'Thanjavur Seed Corporation Depot',
    sellerType: 'authorized_dealer',
    availability: 'in_stock',
    description: 'Medium duration (140-145 days) premium table rice variety known for its fine slender grains, high market premium, and superior consumer acceptance in Samba season.',
    descriptionTa: '140-145 நாட்கள் மத்திய கால சூப்பர் சன்ன ரக நெல். சம்பா மற்றும் தாளடி பட்டத்திற்கு ஏற்ற அதிக சந்தை மதிப்பு கொண்ட பிரீமியம் ரகம்.',
    activeIngredients: 'Certified Genetic Purity 98.0%, Min Germination 80%',
    targetCrops: ['Samba Season', 'Thaladi Season'],
    targetPestsOrNutrients: ['Premium Market Value', 'Fine Slender Grain'],
    dosageGuidance: 'Seed rate: 15-20 kg per acre.',
    toxicityBand: 'none',
    safetyWarnings: [
      'Certified seed pre-packaged with anti-fungal barrier. Keep away from livestock.'
    ],
    disclaimer: 'High consumer demand Samba season produce.',
    isSubsidized: false,
    isVerifiedGovtApproved: true,
  },
];

export const AGRI_SHOPS = [
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
    latitude: 11.0210,
    longitude: 76.9580,
    authorizedBrands: ['IFFCO', 'TNAU Seed Centre', 'Syngenta', 'FMC India'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: true,
    isVerified: true,
  },
  {
    id: 'shop_salem_shevapet_depot',
    name: 'Salem Shevapet Agro Inputs & Seed Corporation Store',
    nameTa: 'சேலம் செவ்வாய்பேட்டை உழவர் இடுபொருள் & விதை விற்பனை மையம்',
    type: 'authorized_dealer',
    district: 'Salem',
    address: 'Agri Bazaar, Shevapet Main Road, Salem - 636002',
    phone: '0427-2210892',
    timing: '8:00 AM - 7:30 PM (Mon-Sat)',
    latitude: 11.6543,
    longitude: 78.1402,
    authorizedBrands: ['SPIC', 'Tata Rallis', 'Kaveri Seeds', 'GreenField'],
    subsidizedUreaAvailable: false,
    subsidizedDapAvailable: false,
    isVerified: true,
  },
  {
    id: 'shop_chennai_koyambedu_depot',
    name: 'Koyambedu Agricultural Produce Marketing Committee Depot',
    nameTa: 'கோயம்பேடு ஒழுங்குமுறை விற்பனைக்கூட விவசாய இடுபொருள் அங்காடி',
    type: 'government_depot',
    district: 'Chennai',
    address: 'Wholesale Market Complex, Gate 4, Koyambedu, Chennai - 600092',
    phone: '044-24791244',
    timing: '6:00 AM - 4:00 PM (Daily)',
    latitude: 13.0694,
    longitude: 80.1948,
    authorizedBrands: ['IFFCO', 'TNAU Agronomy', 'Coromandel'],
    subsidizedUreaAvailable: true,
    subsidizedDapAvailable: true,
    isVerified: true,
  },
];

/**
 * Calculates Haversine distance in km between two lat/lon points.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Fetch products with optional filtering by category, search query, or brand.
 */
export const getProducts = async ({ category = 'all', query = '', brand = '' } = {}) => {
  let list = [...AGRI_PRODUCTS];

  if (category && category !== 'all') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand && brand !== 'all') {
    list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameTa.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.activeIngredients.toLowerCase().includes(q) ||
        p.targetCrops.some((c) => c.toLowerCase().includes(q))
    );
  }

  return {
    total: list.length,
    category,
    products: list,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Fetch product by ID.
 */
export const getProductById = async (id) => {
  const product = AGRI_PRODUCTS.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Product with ID "${id}" not found.`);
  }
  return product;
};

/**
 * Fetch nearby agricultural shops.
 * Computes live distance when valid lat and lon are provided.
 */
export const getNearbyShops = async ({ district = '', lat, lon } = {}) => {
  let shops = [...AGRI_SHOPS];

  const hasGps = typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);

  if (hasGps) {
    shops = shops.map((s) => ({
      ...s,
      distanceKm: calculateDistanceKm(lat, lon, s.latitude, s.longitude),
    }));
    shops.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  } else if (district && district !== 'All') {
    shops = shops.filter((s) => s.district.toLowerCase() === district.toLowerCase());
  }

  return {
    total: shops.length,
    gpsActive: hasGps,
    selectedDistrict: district || (hasGps ? 'Nearest GPS' : 'All Tamil Nadu'),
    shops,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Compare 2 to 4 products by ID.
 */
export const compareProducts = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length < 2) {
    throw new Error('Please select at least 2 products to compare.');
  }
  if (productIds.length > 4) {
    throw new Error('You can compare a maximum of 4 products at a time.');
  }

  const selected = productIds
    .map((id) => AGRI_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  if (selected.length < 2) {
    throw new Error('One or more selected products were not found.');
  }

  return {
    comparisonCount: selected.length,
    products: selected,
    criteria: [
      { key: 'brand', label: 'Brand / Manufacturer' },
      { key: 'category', label: 'Product Category' },
      { key: 'subCategory', label: 'Sub-Category' },
      { key: 'packSize', label: 'Package Size' },
      { key: 'price', label: 'Direct Retail Price' },
      { key: 'unitPrice', label: 'Unit Economics' },
      { key: 'activeIngredients', label: 'Active Composition' },
      { key: 'toxicityBand', label: 'Statutory Toxicity Band' },
      { key: 'waitingPeriodDays', label: 'Pre-Harvest Interval (PHI Days)' },
      { key: 'isSubsidized', label: 'Govt Subsidized' },
      { key: 'availability', label: 'Availability' },
    ],
    timestamp: new Date().toISOString(),
  };
};

/**
 * Health telemetry for Agri Care Store
 */
export const getAgriStoreHealthStatus = () => {
  return {
    provider: 'Smart Uzhavan Agri Care Store Catalog (FCO & CIBRC Certified)',
    status: 'ACTIVE',
    configured: true,
    totalProducts: AGRI_PRODUCTS.length,
    totalVerifiedShops: AGRI_SHOPS.length,
    supportedCategories: ['fertilizer', 'organic', 'crop_protection', 'crop_care', 'seeds'],
  };
};
