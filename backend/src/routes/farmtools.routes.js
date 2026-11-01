import { Router } from 'express';
import {
  getTools,
  getToolById,
  getRentals,
  getRentalById,
  compareTools,
  getMetadata,
} from '../controllers/farmtools.controller.js';

const router = Router();

router.get('/products', getTools);
router.get('/products/:id', getToolById);
router.get('/rentals', getRentals);
router.get('/rentals/:id', getRentalById);
router.post('/compare', compareTools);
router.get('/metadata', getMetadata);

export default router;
