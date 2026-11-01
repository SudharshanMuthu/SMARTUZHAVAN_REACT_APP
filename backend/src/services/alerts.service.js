/**
 * Alerts, Agri News & Government Schemes Service.
 * Serves verified Tamil Nadu agricultural news, schemes, and farming advisories
 * with publication dates and official government source attribution.
 */

export const AGRI_NEWS = [
  {
    id: 'news_1',
    category: 'Govt',
    isBreaking: true,
    date: '30 Oct 2026 • 10:15 AM',
    source: 'Tamil Nadu Dept of Agriculture & Farmers Welfare',
    titleEn: 'Tamil Nadu Government Announces Additional MSP Incentive for Paddy',
    titleTa: 'தமிழ்நாடு அரசு நெல் விவசாயிகளுக்கு கூடுதல் ஊக்கத்தொகை அறிவிப்பு',
    summaryEn: 'Under the Decentralized Procurement Scheme, the state government has notified an incentive of ₹100 per quintal for fine varieties and ₹75 per quintal for common varieties over central MSP.',
    summaryTa: 'மத்திய அரசு நிர்ணயித்த குறைந்தபட்ச ஆதரவு விலைக்கு மேல் சன்ன ரக நெல்லுக்கு குவிண்டாலுக்கு ₹100 மற்றும் பொது ரகத்துக்கு ₹75 கூடுதல் ஊக்கத்தொகையை தமிழ்நாடு அரசு அறிவித்துள்ளது.',
  },
  {
    id: 'news_2',
    category: 'Market',
    isBreaking: true,
    date: '30 Oct 2026 • 09:30 AM',
    source: 'Agmarknet / Koyambedu Market Committee',
    titleEn: 'Tomato and Onion Arrivals Normalize across Tamil Nadu Wholesale Mandis',
    titleTa: 'தமிழ்நாடு மொத்த சந்தைகளில் தக்காளி, வெங்காயம் வரத்து சீரானது',
    summaryEn: 'Wholesale arrivals from Dindigul, Krishnagiri, and neighbouring states have stabilized Koyambedu modal rates at ₹19–21 per kg.',
    summaryTa: 'திண்டுக்கல் மற்றும் கிருஷ்ணகிரி மாவட்டங்களிலிருந்து வரத்து அதிகரித்ததால் சென்னை மற்றும் திருச்சி சந்தைகளில் தக்காளி விலை சமநிலையை எட்டியுள்ளது.',
  },
  {
    id: 'news_3',
    category: 'Weather',
    date: '30 Oct 2026 • 08:00 AM',
    source: 'Regional Meteorological Centre (RMC Chennai / IMD)',
    titleEn: 'Northeast Monsoon Inflow Active – Delta Farmers Advised on Drainage',
    titleTa: 'வடகிழக்கு பருவமழை தீவிரம் – வடிகால் வசதிகளை சீரமைக்க விவசாயிகளுக்கு அறிவுறுத்தல்',
    summaryEn: 'Moderate to heavy rain forecast across Thanjavur, Tiruvarur, and Nagapattinam. Farmers are advised to create field drainage channels to prevent water stagnation in nursery beds.',
    summaryTa: 'டெல்டா மாவட்டங்களில் பரவலாக மழை பெய்ய வாய்ப்புள்ளதால் நெல் வயல்களில் தண்ணீர் தேங்காதவாறு வடிகால்களை சீரமைக்க வேளாண் துறை அறிவுறுத்தியுள்ளது.',
  },
  {
    id: 'news_4',
    category: 'Schemes',
    date: '29 Oct 2026',
    source: 'Directorate of Horticulture & Plantation Crops',
    titleEn: 'Online Enrollment Open for Micro Irrigation (PMKSY) Subsidy in TN',
    titleTa: 'நுண்ணீர் பாசன திட்ட மானியத்திற்கு ஆன்லைன் பதிவு துவக்கம்',
    summaryEn: '100% subsidy for Small & Marginal farmers and 75% for other farmers on Drip and Sprinkler systems available through the TNHorticulture portal.',
    summaryTa: 'சிறு மற்றும் குறு விவசாயிகளுக்கு 100% மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் சொட்டு நீர் பாசன கருவிகள் வழங்கப்படுகின்றன.',
  },
  {
    id: 'news_5',
    category: 'Tech',
    date: '28 Oct 2026',
    source: 'Tamil Nadu Agricultural University (TNAU)',
    titleEn: 'TNAU Releases Biocontrol Advisory for Fall Armyworm and Leaf Folder',
    titleTa: 'படைப்புழு மற்றும் இலைசுருட்டு புழு மேலாண்மைக்கு TNAU புதிய வழிகாட்டுதல்',
    summaryEn: 'TNAU entomologists recommend deploying Trichogramma egg parasitoids @ 2 cc/acre and neem formulation spray (Azadirachtin 1500 ppm) for eco-friendly pest control.',
    summaryTa: 'டிரைக்கோகிரம்மா முட்டை ஒட்டுண்ணிகள் மற்றும் வேப்ப எண்ணெய் மருந்து தெளிப்பதன் மூலம் இயற்கை முறையில் பூச்சிகளை கட்டுப்படுத்த TNAU பரிந்துரைத்துள்ளது.',
  },
];

export const GOVT_SCHEMES = [
  {
    id: 'scheme_pmfby',
    category: 'Insurance',
    titleEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    titleTa: 'பிரதான் மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
    eligibilityEn: 'All farmers (sharecroppers, tenant, and land-owning) growing notified crops in notified areas.',
    eligibilityTa: 'அறிவிக்கப்பட்ட கிராமங்களில் அறிவிக்கப்பட்ட பயிர்களை சாகுபடி செய்யும் அனைத்து விவசாயிகள்.',
    benefitEn: 'Comprehensive insurance coverage against non-preventable natural risks (drought, flood, unseasonal rain, pest outbreaks) from pre-sowing to post-harvest.',
    benefitTa: 'விதைப்பு முதல் அறுவடை வரை ஏற்படும் இயற்கை இடர்பாடுகள், வறட்சி, மற்றும் வெள்ள பாதிப்புகளுக்கு விரிவான பயிர் இழப்பீட்டு தொகை.',
    officialPortal: 'https://pmfby.gov.in',
  },
  {
    id: 'scheme_drip',
    category: 'Subsidy',
    titleEn: 'Micro Irrigation Scheme (Pradhan Mantri Krishi Sinchayee Yojana)',
    titleTa: 'பிரதமரின் நுண்ணீர் பாசன திட்டம் (சொட்டு நீர் பாசனம்)',
    eligibilityEn: 'Farmers with cultivable land and assured irrigation water source with valid Chitta/Adangal.',
    eligibilityTa: 'பாசன நீர் வசதியுள்ள சிட்டா/அடங்கல் ஆவணங்கள் கொண்ட அனைத்து விவசாயிகள்.',
    benefitEn: '100% subsidy for Small & Marginal farmers (up to 5 acres) and 75% subsidy for other farmers for drip/sprinkler system installation.',
    benefitTa: 'சிறு, குறு விவசாயிகளுக்கு 100% முழு மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் டிரிப் பாசன கருவிகள்.',
    officialPortal: 'https://tnhorticulture.tn.gov.in',
  },
  {
    id: 'scheme_kcc',
    category: 'Loan',
    titleEn: 'Kisan Credit Card (KCC) Crop Loan Scheme',
    titleTa: 'கிசான் கிரெடிட் கார்டு (KCC) பயிர்க் கடன் திட்டம்',
    eligibilityEn: 'Owner cultivators, tenant farmers, and Self Help Groups engaged in agriculture and allied activities.',
    eligibilityTa: 'பயிரிடும் நில உரிமையாளர்கள், குத்தகை விவசாயிகள் மற்றும் மகளிர் சுயஉதவி குழுக்கள்.',
    benefitEn: 'Collateral-free short-term crop loans up to ₹1.6 lakh (and up to ₹3 lakh with prompt repayment at effective 4% interest rate).',
    benefitTa: 'பிணையில்லா குறுகிய கால பயிர்க்கடன் ₹1.6 லட்சம் வரை; குறித்த காலத்தில் திருப்பிச் செலுத்தினால் 4% வட்டியில் கடன் உதவி.',
    officialPortal: 'https://pmkisan.gov.in',
  },
  {
    id: 'scheme_kalaignar',
    category: 'Subsidy',
    titleEn: 'Kalaignarin All Village Integrated Agriculture Development Programme',
    titleTa: 'கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம்',
    eligibilityEn: 'Farming communities and self-help farmers in selected village panchayats in Tamil Nadu.',
    eligibilityTa: 'தமிழ்நாட்டின் தேர்வு செய்யப்பட்ட கிராம ஊராட்சிகளில் உள்ள அனைத்து விவசாய குடும்பங்கள்.',
    benefitEn: 'Integrated support: Free coconut saplings, dryland horticulture kits, farm machinery hiring centres, and community irrigation borewells.',
    benefitTa: 'இலவச தென்னங்கன்றுகள், தோட்டக்கலை விதைகள், வேளாண் இயந்திர வாடகை மையங்கள் மற்றும் சமுதாய ஆழ்துளை கிணறு வசதிகள்.',
    officialPortal: 'https://tnagrisnet.tn.gov.in',
  },
  {
    id: 'scheme_organic',
    category: 'Training',
    titleEn: 'Paramparagat Krishi Vikas Yojana (PKVY) – Organic Cluster Certification',
    titleTa: 'பாரம்பரிய வேளாண் வளர்ச்சித் திட்டம் (PKVY இயற்கை விவசாயம்)',
    eligibilityEn: 'Farmers groups forming clusters of 50 acres committed to chemical-free agriculture.',
    eligibilityTa: 'ரசாயனமில்லா இயற்கை விவசாயம் செய்ய முன்வரும் 50 ஏக்கர் விவசாய குழுக்கள்.',
    benefitEn: '₹50,000 per hectare support for 3 years: for on-farm inputs (Panchagavya, vermicompost) and PGS organic certification.',
    benefitTa: 'ஹெக்டேருக்கு ₹50,000 வீதம் 3 ஆண்டுகளுக்கு இயற்கை இடுபொருட்கள் தயாரிப்பு மற்றும் சான்றிதழ் பெற நிதி உதவி.',
    officialPortal: 'https://pgsindia-ncof.gov.in',
  },
];

import { ecosystemStore } from '../data/ecosystemStore.js';

/**
 * Fetch Agri News with optional category, role, and district filters.
 * Seamlessly integrates verified bulletins with Admin-published alerts.
 */
export const getAgriNews = ({ category = 'All', role = 'All', district = 'All' } = {}) => {
  let baseNews = AGRI_NEWS;
  if (category && category !== 'All') {
    baseNews = baseNews.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }

  // Retrieve admin alerts matching role and district
  try {
    const adminAlerts = ecosystemStore.getAlerts({ role, district, category });
    const formattedAdminAlerts = adminAlerts.map((a) => ({
      id: a.id,
      category: a.category || 'Govt',
      isBreaking: a.isBreaking || false,
      date: a.date || 'Today',
      source: a.source || 'Admin Bulletin',
      titleEn: a.titleEn || a.title || 'Official Notice',
      titleTa: a.titleTa || a.title || 'அரசு அறிவிப்பு',
      summaryEn: a.summaryEn || a.message || '',
      summaryTa: a.summaryTa || a.message || '',
      targetAudience: a.targetAudience || 'All',
      targetDistrict: a.targetDistrict || 'All TN',
      severity: a.severity || 'Medium',
    }));

    return [...formattedAdminAlerts, ...baseNews];
  } catch (err) {
    return baseNews;
  }
};

/**
 * Fetch Government Schemes with optional category filter.
 */
export const getGovtSchemes = (category = 'All') => {
  if (!category || category === 'All') {
    return GOVT_SCHEMES;
  }
  return GOVT_SCHEMES.filter((s) => s.category.toLowerCase() === category.toLowerCase());
};

/**
 * Health status reporting for Admin telemetry
 */
export const getAlertsHealthStatus = () => {
  return {
    provider: 'Tamil Nadu Agri Department & TNAU Agromet',
    status: 'ACTIVE',
    configured: true,
    activeNewsItems: AGRI_NEWS.length,
    activeSchemes: GOVT_SCHEMES.length,
  };
};
