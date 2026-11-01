export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  source?: string;
  isError?: boolean;
}

export interface CropHealthResult {
  crop: string;
  detectedIssue: string;
  severity: 'Low' | 'Medium' | 'High';
  confidence: string;
  symptoms: string[];
  causes: string[];
  recommendedTreatment: string[];
  preventiveMeasures: string[];
  isInformationalNotice?: boolean;
  disclaimer?: string;
}

export interface IrrigationPlanResult {
  crop: string;
  soilType: string;
  fieldSize: number;
  growthStage?: string;
  dailyWaterRequirement: string;
  recommendedInterval: string;
  recommendedMethod: string;
  soilRetention: string;
  conservationTip: string;
}

export interface YieldPredictionResult {
  crop: string;
  landSize: number;
  soilType: string;
  fertilizerUsage: string;
  season: string;
  estimatedYield: string;
  estimatedYieldRange: string;
  expectedMarketDemand: string;
  suggestedHarvestWindow: string;
  disclaimer: string;
}

export interface CropRecommendationItem {
  crop: string;
  reason: string;
  fertilizer: string;
  practice: string;
}

export interface CropRecommendationResult {
  recommendations: CropRecommendationItem[];
}
