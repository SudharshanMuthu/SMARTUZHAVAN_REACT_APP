import { Router } from 'express';
import {
  getAiStatus,
  handleChat,
  handleCropHealth,
  handleIrrigationAdvice,
  handleYieldPrediction,
  handleCropRecommendation,
} from '../controllers/ai.controller.js';

const router = Router();

/**
 * Public status check for AI capabilities
 */
router.get('/status', getAiStatus);

/**
 * AI Core Endpoints
 */
router.post('/chat', handleChat);
router.post('/crop-health', handleCropHealth);
router.post('/irrigation-advice', handleIrrigationAdvice);
router.post('/yield-prediction', handleYieldPrediction);
router.post('/crop-recommendation', handleCropRecommendation);

export default router;
