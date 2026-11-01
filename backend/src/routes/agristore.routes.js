import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getNearbyShops,
  compareProducts,
  getStoreMetadata,
} from '../controllers/agristore.controller.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/shops', getNearbyShops);
router.post('/compare', compareProducts);
router.get('/metadata', getStoreMetadata);

export default router;
