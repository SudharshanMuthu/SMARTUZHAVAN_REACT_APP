import * as agriStoreService from '../services/agristore.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, query, brand } = req.query;
    const result = await agriStoreService.getProducts({
      category,
      query,
      brand,
    });
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await agriStoreService.getProductById(id);
    return res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const getNearbyShops = async (req, res, next) => {
  try {
    const { district, lat, lon } = req.query;
    const parsedLat = lat ? parseFloat(lat) : undefined;
    const parsedLon = lon ? parseFloat(lon) : undefined;

    const result = await agriStoreService.getNearbyShops({
      district,
      lat: parsedLat,
      lon: parsedLon,
    });
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    const result = await agriStoreService.compareProducts(productIds);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const getStoreMetadata = async (req, res, next) => {
  try {
    const categories = [
      { id: 'all', labelEn: 'All Products', labelTa: 'அனைத்தும்', icon: 'grid-large' },
      { id: 'fertilizer', labelEn: 'Fertilizers', labelTa: 'இரசாயன உரங்கள்', icon: 'sack' },
      { id: 'organic', labelEn: 'Organic & Bio', labelTa: 'இயற்கை உரம்', icon: 'leaf' },
      { id: 'crop_protection', labelEn: 'Crop Protection', labelTa: 'பூச்சி & நோய் மருந்து', icon: 'shield-bug' },
      { id: 'crop_care', labelEn: 'Crop-Care', labelTa: 'ஊட்டச்சத்து & ஊக்கிகள்', icon: 'bottle-tonic-plus' },
      { id: 'seeds', labelEn: 'Certified Seeds', labelTa: 'சான்று பெற்ற விதைகள்', icon: 'seed' },
    ];

    const districts = [
      'All',
      'Trichy',
      'Thanjavur',
      'Madurai',
      'Erode',
      'Salem',
      'Coimbatore',
      'Chennai',
    ];

    return res.status(200).json({
      status: 'success',
      data: {
        categories,
        districts,
        subsidizedNotice: {
          titleEn: 'Subsidized Fertilizer Price Guarantee',
          titleTa: 'அரசு மானிய உரம் விலை பாதுகாப்பு',
          detailEn: 'Urea (₹266.50/45kg) and DAP (₹1350/50kg) prices are legally regulated under Fertilizer Control Order (FCO). Available at PACCS with Aadhaar biometric verification.',
          detailTa: 'யூரியா மற்றும் டி.ஏ.பி உரங்கள் அரசு நிர்ணயித்த விலையில் தொடக்க வேளாண் கூட்டுறவு சங்கங்களில் ஆதார் மூலம் வழங்கப்படுகிறது.',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
