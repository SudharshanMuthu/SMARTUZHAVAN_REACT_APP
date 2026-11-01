import * as farmToolsService from '../services/farmtools.service.js';

export const getTools = async (req, res, next) => {
  try {
    const { category, query, brand, tractorBrand } = req.query;
    const result = await farmToolsService.getTools({
      category,
      query,
      brand,
      tractorBrand,
    });
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getToolById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tool = await farmToolsService.getToolById(id);
    return res.status(200).json({
      status: 'success',
      data: tool,
    });
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const getRentals = async (req, res, next) => {
  try {
    const { district, type } = req.query;
    const result = await farmToolsService.getRentals({
      district,
      type,
    });
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getRentalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await farmToolsService.getRentalById(id);
    return res.status(200).json({
      status: 'success',
      data: rental,
    });
  } catch (err) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};

export const compareTools = async (req, res, next) => {
  try {
    const { toolIds } = req.body;
    const result = await farmToolsService.compareTools(toolIds);
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

export const getMetadata = async (req, res, next) => {
  try {
    const categories = [
      { id: 'all', labelEn: 'All Tools & Tech', labelTa: 'அனைத்தும்', icon: 'tools' },
      { id: 'hand_tools', labelEn: 'Hand Tools', labelTa: 'கைக்கருவிகள்', icon: 'shovel' },
      { id: 'tractor_parts', labelEn: 'Tractor Spares', labelTa: 'டிராக்டர் உதிரிபாகங்கள்', icon: 'tractor' },
      { id: 'irrigation', labelEn: 'Irrigation & Pumps', labelTa: 'பாசன உபகரணங்கள்', icon: 'water-pump' },
      { id: 'machinery', labelEn: 'Machinery & Sprayers', labelTa: 'விவசாய இயந்திரங்கள்', icon: 'engine' },
      { id: 'hardware', labelEn: 'Hardware & Tarpaulins', labelTa: 'வன்பொருள் & தார்பாய்', icon: 'hammer-wrench' },
      { id: 'smart_tech', labelEn: 'Smart Farming IoT', labelTa: 'ஸ்மார்ட் சென்சார்கள்', icon: 'access-point-network' },
    ];

    const tractorBrands = [
      'All',
      'Mahindra',
      'TAFE / Massey Ferguson',
      'John Deere',
      'Sonalika',
      'Eicher',
      'Kubota',
    ];

    const rentalTypes = [
      { id: 'all', labelEn: 'All Machinery', labelTa: 'அனைத்து இயந்திரங்கள்' },
      { id: 'tractor', labelEn: 'Tractor + Rotavator', labelTa: 'டிராக்டர் + ரோட்டாவேட்டர்' },
      { id: 'harvester', labelEn: 'Paddy Combined Harvester', labelTa: 'நெல் அறுவடை இயந்திரம்' },
      { id: 'rotavator', labelEn: 'Rotavator Attachment', labelTa: 'ரோட்டாவேட்டர் கருவி' },
      { id: 'leveler', labelEn: 'Laser Land Leveler', labelTa: 'லேசர் நில சமன் கருவி' },
      { id: 'power_weeder', labelEn: 'Power Weeder / Tiller', labelTa: 'களை எடுக்கும் இயந்திரம்' },
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
        tractorBrands,
        rentalTypes,
        districts,
        rentalNotice: {
          titleEn: 'Custom Hiring Centre (CHC) Rental Terms',
          titleTa: 'விவசாய இயந்திரங்கள் வாடகை விதிமுறைகள்',
          detailEn: 'Machinery rental requests require provider confirmation. Booking rates include operator or diesel only where explicitly specified. No payment is charged until confirmed by the owner/CHC.',
          detailTa: 'இயந்திர வாடகை உரிமையாளர் அல்லது கூட்டுறவு சங்கம் உறுதிசெய்த பிறகே பதிவு செய்யப்படும். உறுதிசெய்யப்படும் வரை எவ்வித கட்டணமும் வசூலிக்கப்படாது.',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
