/**
 * Farm Tools & Tech Service for Smart Uzhavan Backend.
 * Serves hand tools, tractor spare parts with verified OEM compatibility,
 * micro-irrigation kits, farm machinery, hardware, smart IoT sensors,
 * and certified custom hiring centre (CHC) machinery rentals across Tamil Nadu.
 */

export const FARM_TOOLS_PRODUCTS = [
  // 1. Hand Tools
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
    description: 'High-carbon forged steel shovel blade tempered for soil canal digging, wet paddy bund preparation, and weed scraping with reinforced socket.',
    descriptionTa: 'உயர் கார்பன் எஃகால் செய்யப்பட்ட உறுதியான மண்வெட்டி. வரப்பு வெட்டவும், பாசன வாய்க்கால் அமைக்கவும் சிறந்தது.',
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
    id: 'tool_bellary_sickle_paddy',
    name: 'Falcon Serrated Paddy Harvest Sickle / Arivaal',
    nameTa: 'பால்கன் நெல் அறுவடை பல்வரிசை அரிவாள்',
    brand: 'Falcon Agritech',
    category: 'hand_tools',
    subCategory: 'Cereal Harvest Hand Tool',
    price: 185.0,
    mrp: 220.0,
    quantityOrSize: 'Pack of 1 (180 grams)',
    unitPrice: '₹185 / unit',
    rating: 4.8,
    reviewsCount: 88,
    sellerName: 'Thanjavur Uzhavan Tools Cooperative',
    sellerPhone: '04362-234811',
    sellerType: 'cooperative',
    location: 'Thanjavur',
    availability: 'in_stock',
    description: 'Micro-serrated high tensile steel blade engineered for rapid, clean cutting of mature paddy straw without shattering grain panicles.',
    descriptionTa: 'கூர்மையான பற்கள் கொண்ட உறுதியான அறுவடை அரிவாள். நெல் மணிகள் உதிராமல் அறுவடை செய்ய உதவும்.',
    specifications: {
      BladeType: 'Fine Serrated Curved Blade',
      SteelGrade: 'Hardened Spring Steel 52 HRC',
      Handle: 'Ergonomic Seasoned Wood with Riveted Shank',
      BladeLength: '210 mm',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '6 Months against edge deformation',
    isGovtSubsidized: false,
  },

  // 2. Tractor Spare Parts (Requirement B: Compatibility)
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
    description: 'Original equipment manufacturer (OEM) micro-glass engine lubrication filter element that prevents abrasive metal wear in heavy tillage cycles.',
    descriptionTa: 'டிராக்டர் என்ஜின் பாகங்களை தேய்மானத்தில் இருந்து பாதுகாக்கும் அசல் ஆயில் பில்டர்.',
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
    compatibilityNotes: 'Verified OEM fit for 4-Cylinder and 3-Cylinder Mahindra DI engines (35 to 50 HP). Not compatible with Yuvraj 215 mini-tractor.',
    isCompatibilityVerified: true,
    warranty: '6 Months Genuine OEM Warranty against leakage',
    isGovtSubsidized: false,
  },
  {
    id: 'part_tafe_mf_fan_belt',
    name: 'TAFE / Massey Ferguson Heavy Duty Cogged Alternator Fan Belt',
    nameTa: 'டாபே / மேசி பெர்குசன் கூலிங் ஃபேன் பெல்ட்',
    brand: 'TAFE Spares',
    category: 'tractor_parts',
    subCategory: 'Engine Cooling & Drive Belt',
    price: 320.0,
    mrp: 360.0,
    quantityOrSize: 'Single Cogged V-Belt',
    unitPrice: '₹320 / unit',
    rating: 4.7,
    reviewsCount: 95,
    sellerName: 'Perundurai Tractor Spares Center',
    sellerPhone: '04294-221890',
    sellerType: 'authorized_dealer',
    location: 'Erode',
    availability: 'in_stock',
    description: 'Heat-resistant, raw-edge cogged cooling fan and water pump drive belt designed to withstand high thermal loads during summer rotavator tilling.',
    descriptionTa: 'டிராக்டர் வாட்டர் பம்ப் மற்றும் கூலிங் ஃபேனுக்கான வெப்பத்தை தாங்கும் உயர்ரக பெல்ட்.',
    specifications: {
      BeltProfile: 'Raw Edge Cogged V-Belt (AVX 13 x 1175)',
      Material: 'EPDM Synthetic Rubber with Kevlar cord reinforcement',
      TemperatureRange: '-40°C to +120°C',
    },
    isTractorPart: true,
    tractorBrand: 'TAFE / Massey Ferguson',
    tractorModel: 'MF 1035 DI (Maha Shakti), MF 241 DI (Dynatrack)',
    partNumber: 'MF-BELT-AVX13-1175',
    compatibilityNotes: 'Verified factory fit for Simpson S324 and S325 3-Cylinder diesel engines. Check pulley profile before ordering for older 1990s models.',
    isCompatibilityVerified: true,
    warranty: '1 Year Warranty against premature cracking',
    isGovtSubsidized: false,
  },
  {
    id: 'part_cultivator_reversible_shovel',
    name: 'Duckfoot Reversible Cultivator Shovels (Set of 9 Points)',
    nameTa: '9 கொழு கலப்பை கொழு முனைகள் (செட்)',
    brand: 'Shaktiman',
    category: 'tractor_parts',
    subCategory: 'Tillage Ground Engaging Tool',
    price: 1850.0,
    mrp: 2100.0,
    quantityOrSize: 'Pack of 9 Shovel Blades with High-Tensile Bolts',
    unitPrice: '₹205.50 / point',
    rating: 4.8,
    reviewsCount: 64,
    sellerName: 'Madurai Agri Implements Depot',
    sellerPhone: '0452-2439120',
    sellerType: 'authorized_dealer',
    location: 'Madurai',
    availability: 'in_stock',
    description: 'Forged manganese-boron steel reversible cultivator shovel points heat-treated to 48 HRC for deep penetration in red hardpan and black cotton soils.',
    descriptionTa: 'கடினமான மண்ணிலும் தேயாமல் உழவு செய்யக்கூடிய 9 கொழு கலப்பைக்கான பிரத்யேக முனைகள்.',
    specifications: {
      PointType: 'Double-Ended Reversible Spear Tip',
      SteelChemistry: '30MnB5 Boron Alloy Steel',
      HoleSpacing: 'Standard 45 mm two-hole mounting',
      Hardness: '46-50 HRC through-hardened',
    },
    isTractorPart: true,
    tractorBrand: 'Universal 9-Tyne Cultivators',
    tractorModel: 'Fits standard 9-Tyne rigid and spring cultivators for 35–55 HP tractors',
    partNumber: 'SHAKTI-REV-9T',
    compatibilityNotes: 'Universal bolt pattern fits Mahindra, Shaktiman, Fieldking, and local fabrication 9-tyne cultivators. Compatibility verified for standard shanks.',
    isCompatibilityVerified: true,
    warranty: 'Guaranteed against breakage on rocky impacts',
    isGovtSubsidized: false,
  },

  // 3. Irrigation Equipment
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
    description: 'Comprehensive pressurized micro-irrigation layout saving up to 60% water while boosting fertilizer use efficiency via integrated Venturi fertigation.',
    descriptionTa: '1 ஏக்கர் தோட்டக்கலை மற்றும் பயிர்களுக்கான முழு சொட்டு நீர் பாசன கருவிகள். 60% வரை தண்ணீர் சேமிக்கும்.',
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
    subsidySchemeName: 'PM Krishi Sinchayee Yojana (PMKSY) – Up to 100% subsidy for Small/Marginal farmers',
  },
  {
    id: 'irrig_kirloskar_submersible_5hp',
    name: 'Kirloskar 5 HP Openwell / Borewell Agri Submersible Pump',
    nameTa: 'கிர்லோஸ்கர் 5 குதிரைத்திறன் விவசாய மின்மோட்டார் பம்ப்',
    brand: 'Kirloskar',
    category: 'irrigation',
    subCategory: 'Agricultural Water Lifting Machinery',
    price: 24500.0,
    mrp: 27800.0,
    quantityOrSize: 'Single 5 HP Pump Set with Control Panel',
    unitPrice: '₹24,500 / unit',
    rating: 4.8,
    reviewsCount: 78,
    sellerName: 'Salem Electric & Pump Distributors',
    sellerPhone: '0427-2314560',
    sellerType: 'authorized_dealer',
    location: 'Salem',
    availability: 'in_stock',
    description: 'High discharge stainless steel multistage agricultural pump engineered for wide voltage fluctuations (280V to 440V) common in rural Tamil Nadu grids.',
    descriptionTa: 'கிராமப்புற குறைந்த மின் அழுத்தத்திலும் சீராக இயங்கும் 5 HP விவசாய பம்ப் செட்.',
    specifications: {
      PowerRating: '5.0 HP / 3.7 kW (3-Phase, 415V, 50Hz)',
      HeadRange: '30 to 75 meters',
      DischargeCapacity: '350 to 800 Liters per minute',
      Impeller: 'Corrosion-resistant Gunmetal / SS-410',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '2 Years Comprehensive On-Site Warranty by Kirloskar Service Network',
    isGovtSubsidized: false,
  },

  // 4. Farm Machinery
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
    description: 'Ergonomic dual-operation knapsack sprayer with automatic pressure regulator, 12V 12Ah maintenance-free battery providing up to 6 hours continuous field spraying.',
    descriptionTa: '16 லிட்டர் கொள்ளளவு கொண்ட பேட்டரி தெளிப்பான். ஒரே சார்ஜில் 6 மணி நேரம் வரை மருந்து தெளிக்கலாம்.',
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
    id: 'mach_vst_power_tiller_13hp',
    name: 'VST Shakti 130 DI (13 HP) Power Tiller',
    nameTa: 'வி.எஸ்.டி சக்தி 13 குதிரைத்திறன் பவர் டில்லர்',
    brand: 'VST Tillers',
    category: 'machinery',
    subCategory: 'Small Farm Multi-Functional Tiller',
    price: 178000.0,
    mrp: 192000.0,
    quantityOrSize: 'Complete Unit with Rotary Cultivator Attachment',
    unitPrice: '₹1,78,000 / unit',
    rating: 4.9,
    reviewsCount: 45,
    sellerName: 'Tamil Nadu Agro Industries Corporation (TNAIC Depot)',
    sellerPhone: '0422-2431890',
    sellerType: 'tnaic_depot',
    location: 'Coimbatore',
    availability: 'in_stock',
    description: 'Fuel-efficient direct-injection diesel power tiller ideal for wet wetland paddy puddling, dryland weeding, sugarcane earthing-up, and small acreage tilling.',
    descriptionTa: 'நெல் சேற்று உழவு மற்றும் கரும்பு வரப்பு அமைக்க ஏற்ற 13 HP டீசல் பவர் டில்லர்.',
    specifications: {
      Engine: 'Horizontal 4-Stroke Single Cylinder DI Diesel (13.0 HP @ 2400 RPM)',
      Cooling: 'Condenser Type Water Cooled',
      Transmission: '6 Forward + 2 Reverse speeds',
      FuelConsumption: '1.2 to 1.5 Liters per hour',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '2 Years Manufacturer Warranty with free field service checks',
    isGovtSubsidized: true,
    subsidySchemeName: 'Tamil Nadu Agricultural Engineering Dept Machinery Subsidy (40-50% subsidy)',
  },

  // 5. Hardware
  {
    id: 'hard_hdpe_tarpaulin_250gsm',
    name: 'Kisan Poly Ultra Multi-Layer HDPE Tarpaulin Sheet (24 x 18 Feet, 250 GSM)',
    nameTa: 'விவசாய தானிய உலர் தார்பாய் தாள் (24 x 18 அடி, 250 GSM)',
    brand: 'Kisan Poly',
    category: 'hardware',
    subCategory: 'Crop Protection & Drying Hardware',
    price: 1850.0,
    mrp: 2300.0,
    quantityOrSize: '1 Sheet (24ft x 18ft, 250 GSM)',
    unitPrice: '₹1,850 / sheet',
    rating: 4.7,
    reviewsCount: 52,
    sellerName: 'Madurai Central Hardware Syndicate',
    sellerPhone: '0452-2349088',
    sellerType: 'authorized_dealer',
    location: 'Madurai',
    availability: 'in_stock',
    description: '100% waterproof heavy-duty laminated cross-woven polyethylene sheet with heat-sealed hem and brass eyelets every 3 feet for harvest paddy drying and storage covering.',
    descriptionTa: 'நெல் மற்றும் தானியங்களை உலர்த்தவும், மழையிலிருந்து பாதுகாக்கவும் பயன்படும் நீர்ப்புகா தார்பாய்.',
    specifications: {
      Size: '24 Feet x 18 Feet (432 Sq Ft)',
      Thickness: '250 GSM Heavy Duty Grade',
      Eyelets: 'Reinforced Aluminum eyelets on all 4 corners and borders',
      UVProtection: 'UV-Stabilized for 3+ years open sun exposure',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '1 Year Warranty against delamination',
    isGovtSubsidized: false,
  },

  // 6. Smart Farming Tech
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
    description: 'Multi-parameter soil probe measuring real-time Nitrogen (N), Phosphorus (P), Potassium (K), Soil Moisture (VWC), Temperature, and Electrical Conductivity (EC) directly in field soil.',
    descriptionTa: 'மண்ணில் உள்ள தழை, மணி, சாம்பல் சத்துக்கள் மற்றும் ஈரப்பதத்தை உடனடியாக துல்லியமாக அளவிடும் கருவி.',
    specifications: {
      ParametersMeasured: 'Soil N, P, K (mg/kg), Moisture (0-100%), EC (0-20000 us/cm), Temp (-40 to 80°C)',
      Interface: 'RS485 Modbus-RTU / BLE 5.0 wireless to Smart Uzhavan mobile app',
      ProtectionClass: 'IP68 completely waterproof and corrosion-proof resin potting',
      ResponseTime: '< 1 Second real-time reading',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '1 Year Full Replacement Warranty',
    isGovtSubsidized: false,
  },
  {
    id: 'tech_gsm_pump_controller',
    name: 'Uzhavan SIM-Based GSM Mobile Pump Controller (IVRS Voice & SMS)',
    nameTa: 'மொபைல் மூலம் மோட்டார் இயக்கும் ஜி.எஸ்.எம் ஆட்டோமேட்டிக் கருவி',
    brand: 'UzhavanTech',
    category: 'smart_tech',
    subCategory: 'Automated Irrigation Controller',
    price: 3200.0,
    mrp: 3800.0,
    quantityOrSize: '1 Controller Box with External Antenna & 3-Phase Starter Relay Wire',
    unitPrice: '₹3,200 / unit',
    rating: 4.9,
    reviewsCount: 182,
    sellerName: 'Erode Agro Electronics & Solar Depot',
    sellerPhone: '0424-2258900',
    sellerType: 'authorized_dealer',
    location: 'Erode',
    availability: 'in_stock',
    description: 'Allows farmers to turn agricultural pump sets ON and OFF from anywhere via missed call or Tamil IVRS voice response, with dry run protection and phase failure alert SMS.',
    descriptionTa: 'எங்கிருந்தும் செல்போன் மூலம் விவசாய மோட்டாரை ஆன்/ஆப் செய்யும் கருவி. மும்முனை மின்சாரம் மற்றும் மோட்டார் பழுதை போன் மூலம் தெரிவிக்கும்.',
    specifications: {
      Compatibility: 'Compatible with all 3-Phase DOL and Star-Delta starters (up to 20 HP)',
      ProtectionFeatures: 'Dry Run Protection, Single Phasing Prevention, Low/High Voltage Cutoff',
      LanguageSupport: 'Tamil and English Voice prompts',
      Network: '4G / 2G All-India SIM card support',
    },
    isTractorPart: false,
    isCompatibilityVerified: false,
    warranty: '2 Years Manufacturer Replacement Warranty',
    isGovtSubsidized: false,
  },
];

export const MACHINERY_RENTALS = [
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
    specifications: '45 HP Bhoomiputra Tractor equipped with 42-blade Shaktiman Rotavator. Wet paddy puddling cage wheels and dry deep ploughing attachments available on request.',
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
    specifications: '68 HP Rubber-track crawler capable of harvesting in waterlogged/marshy wet delta paddy fields without sinking. High grain recovery with minimal grain loss (< 1%).',
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
    specifications: '54-blade heavy duty gear drive rotavator. Fits any standard Cat-II 3-point tractor linkage with 45–60 HP PTO.',
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
    specifications: 'Precision laser leveling reduces irrigation water requirement by 25–30% and optimizes uniform fertilizer application across the field.',
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
    specifications: 'Ideal for de-weeding and soil loosening in vegetables, sugarcane inter-rows, and fruit orchards. Consumes 0.8 L/hour petrol.',
    operatorIncluded: false,
    fuelIncluded: false,
    isVerifiedProvider: true,
  },
];

/**
 * Fetch Farm Tools & Tech with optional category, search, brand, or tractor compatibility filter.
 */
export const getTools = async ({ category = 'all', query = '', brand = '', tractorBrand = '' } = {}) => {
  let list = [...FARM_TOOLS_PRODUCTS];

  if (category && category !== 'all') {
    list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }

  if (brand && brand !== 'all') {
    list = list.filter((t) => t.brand.toLowerCase() === brand.toLowerCase());
  }

  if (tractorBrand && tractorBrand !== 'all') {
    list = list.filter(
      (t) =>
        t.isTractorPart &&
        t.tractorBrand &&
        t.tractorBrand.toLowerCase().includes(tractorBrand.toLowerCase())
    );
  }

  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.nameTa.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.subCategory.toLowerCase().includes(q) ||
        (t.partNumber && t.partNumber.toLowerCase().includes(q)) ||
        (t.tractorModel && t.tractorModel.toLowerCase().includes(q))
    );
  }

  return {
    total: list.length,
    category,
    tools: list,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Fetch tool by ID.
 */
export const getToolById = async (id) => {
  const tool = FARM_TOOLS_PRODUCTS.find((t) => t.id === id);
  if (!tool) {
    throw new Error(`Tool or equipment with ID "${id}" not found.`);
  }
  return tool;
};

/**
 * Fetch machinery rentals with optional district or machinery type filter.
 */
export const getRentals = async ({ district = '', type = 'all' } = {}) => {
  let rentals = [...MACHINERY_RENTALS];

  if (type && type !== 'all') {
    rentals = rentals.filter((r) => r.type.toLowerCase() === type.toLowerCase());
  }

  if (district && district !== 'All') {
    rentals = rentals.filter((r) => r.district.toLowerCase() === district.toLowerCase());
  }

  return {
    total: rentals.length,
    district: district || 'All Tamil Nadu',
    type,
    rentals,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Fetch rental by ID.
 */
export const getRentalById = async (id) => {
  const rental = MACHINERY_RENTALS.find((r) => r.id === id);
  if (!rental) {
    throw new Error(`Rental machinery with ID "${id}" not found.`);
  }
  return rental;
};

/**
 * Compare 2 to 4 tools or tractor parts by ID.
 */
export const compareTools = async (toolIds = []) => {
  if (!Array.isArray(toolIds) || toolIds.length < 2) {
    throw new Error('Please select at least 2 tools or spare parts to compare.');
  }
  if (toolIds.length > 4) {
    throw new Error('You can compare a maximum of 4 items at a time.');
  }

  const selected = toolIds
    .map((id) => FARM_TOOLS_PRODUCTS.find((t) => t.id === id))
    .filter(Boolean);

  if (selected.length < 2) {
    throw new Error('One or more selected items were not found.');
  }

  return {
    comparisonCount: selected.length,
    tools: selected,
    criteria: [
      { key: 'brand', label: 'Brand / Manufacturer' },
      { key: 'category', label: 'Tool Category' },
      { key: 'subCategory', label: 'Classification' },
      { key: 'price', label: 'Retail Price' },
      { key: 'quantityOrSize', label: 'Size / Weight / Capacity' },
      { key: 'unitPrice', label: 'Unit Economics' },
      { key: 'isTractorPart', label: 'Tractor Spare Part' },
      { key: 'tractorCompatibility', label: 'OEM Compatibility' },
      { key: 'warranty', label: 'Warranty' },
      { key: 'isGovtSubsidized', label: 'Govt Subsidized' },
      { key: 'availability', label: 'Stock Status' },
    ],
    timestamp: new Date().toISOString(),
  };
};

/**
 * Health telemetry for Farm Tools & Tech service.
 */
export const getFarmToolsHealthStatus = () => {
  return {
    provider: 'Smart Uzhavan Farm Tools & Machinery Service',
    status: 'ACTIVE',
    configured: true,
    totalProducts: FARM_TOOLS_PRODUCTS.length,
    totalRentals: MACHINERY_RENTALS.length,
    supportedCategories: ['hand_tools', 'tractor_parts', 'irrigation', 'machinery', 'hardware', 'smart_tech'],
  };
};
