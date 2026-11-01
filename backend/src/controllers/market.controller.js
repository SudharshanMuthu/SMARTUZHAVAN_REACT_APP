import {
  getMandiPrice,
  compareMandiPrices,
  getAllMandisForCrop,
  SUPPORTED_CROPS,
  SUPPORTED_MANDIS,
} from '../services/market.service.js';

/**
 * GET /api/market/prices?crop=Paddy&location=Trichy
 */
export const getPriceForCropAndLocation = async (req, res, next) => {
  try {
    const { crop, location } = req.query;
    const priceData = await getMandiPrice(crop || 'Paddy', location || 'Trichy');
    return res.status(200).json({ status: 'success', data: priceData });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/market/compare?crop=Tomato&loc1=Trichy&loc2=Chennai
 */
export const comparePrices = async (req, res, next) => {
  try {
    const { crop, loc1, loc2 } = req.query;
    const comparison = await compareMandiPrices(
      crop || 'Paddy',
      loc1 || 'Trichy',
      loc2 || 'Chennai'
    );
    return res.status(200).json({ status: 'success', data: comparison });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/market/summary?crop=Paddy
 */
export const getCropSummaryAcrossMandis = async (req, res, next) => {
  try {
    const { crop } = req.query;
    const summary = await getAllMandisForCrop(crop || 'Paddy');
    return res.status(200).json({ status: 'success', data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/market/metadata
 * Returns supported crops and APMC mandis.
 */
export const getMarketMetadata = (req, res) => {
  return res.status(200).json({
    status: 'success',
    crops: SUPPORTED_CROPS,
    mandis: SUPPORTED_MANDIS,
  });
};
