import {
  isGeminiConfigured,
  chatWithAssistant,
  analyzeCropHealth,
  calculateIrrigationPlan,
  calculateYieldPrediction,
  getCropRecommendations,
} from '../services/ai.service.js';

/**
 * GET /api/ai/status
 * Returns current configuration status of AI services without leaking secrets.
 */
export const getAiStatus = async (req, res, next) => {
  try {
    const configured = isGeminiConfigured();
    return res.status(200).json({
      status: 'success',
      configured,
      model: configured ? 'gemini-1.5-flash' : 'agronomy-rules-fallback',
      features: {
        chatAssistant: true,
        cropHealthScanner: true,
        smartIrrigation: true,
        yieldPrediction: true,
        cropRecommendations: true,
      },
      message: configured
        ? 'Gemini AI is configured and operational.'
        : 'Backend is operating in domain agronomy mode. Set GEMINI_API_KEY in .env for generative intelligence.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/chat
 * Agricultural Chatbot conversation.
 */
export const handleChat = async (req, res, next) => {
  try {
    const { message, history, language } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Request body must include a non-empty "message" string.',
      });
    }

    const result = await chatWithAssistant({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      language: language || 'en',
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/crop-health
 * Crop Health & Plant Disease diagnosis.
 */
export const handleCropHealth = async (req, res, next) => {
  try {
    const { imageBase64, mimeType, cropName, language } = req.body;

    const result = await analyzeCropHealth({
      imageBase64,
      mimeType,
      cropName,
      language: language || 'en',
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/irrigation-advice
 * Smart irrigation calculations.
 */
export const handleIrrigationAdvice = async (req, res, next) => {
  try {
    const { crop, soilType, fieldSize, growthStage, language } = req.body;

    const result = calculateIrrigationPlan({
      crop,
      soilType,
      fieldSize,
      growthStage,
      language: language || 'en',
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/yield-prediction
 * Yield prediction and estimation.
 */
export const handleYieldPrediction = async (req, res, next) => {
  try {
    const { crop, landSize, soilType, fertilizerUsage, season, language } = req.body;

    const result = calculateYieldPrediction({
      crop,
      landSize,
      soilType,
      fertilizerUsage,
      season,
      language: language || 'en',
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/crop-recommendation
 * Multi-crop recommendations based on field parameters.
 */
export const handleCropRecommendation = async (req, res, next) => {
  try {
    const { soilType, waterAvailability, season, farmingType, language } = req.body;

    const result = getCropRecommendations({
      soilType,
      waterAvailability,
      season,
      farmingType,
      language: language || 'en',
    });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
