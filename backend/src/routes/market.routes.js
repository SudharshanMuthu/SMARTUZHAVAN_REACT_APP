import { Router } from 'express';
import {
  getPriceForCropAndLocation,
  comparePrices,
  getCropSummaryAcrossMandis,
  getMarketMetadata,
} from '../controllers/market.controller.js';

const router = Router();

router.get('/prices', getPriceForCropAndLocation);
router.get('/compare', comparePrices);
router.get('/summary', getCropSummaryAcrossMandis);
router.get('/metadata', getMarketMetadata);

export default router;
