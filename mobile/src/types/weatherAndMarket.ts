export interface ForecastDay {
  date: string;
  day: string;
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;
  rainProbability: number;
  conditionEn: string;
  conditionTa: string;
  icon: string;
}

export interface WeatherAdvisory {
  titleEn: string;
  titleTa: string;
  detailEn: string;
  detailTa: string;
  severity: 'High' | 'Medium' | 'Low';
  category: string;
  icon: string;
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  source: string;
  timestamp: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    conditionEn: string;
    conditionTa: string;
    icon: string;
    precipitation: number;
    rainProbability: number;
  };
  forecast: ForecastDay[];
  advisories: WeatherAdvisory[];
}

export interface MandiPriceData {
  crop: string;
  location: string;
  variety: string;
  date: string;
  prices: {
    minPricePerKg: string;
    maxPricePerKg: string;
    modalPricePerKg: string;
    minPricePerQuintal: string;
    maxPricePerQuintal: string;
    modalPricePerQuintal: string;
  };
  unitNote: string;
  modalPriceDefinition: string;
  source: string;
  isLiveFeed: boolean;
  timestamp: string;
}

export interface MandiComparison {
  crop: string;
  mandi1: MandiPriceData;
  mandi2: MandiPriceData;
  comparison: {
    higherMandi: string;
    modalDifferencePerKg: string;
    percentVariance: string;
  };
  timestamp: string;
}

export interface AgriNewsItem {
  id: string;
  category: string;
  isBreaking?: boolean;
  date: string;
  source: string;
  titleEn: string;
  titleTa: string;
  summaryEn: string;
  summaryTa: string;
}

export interface GovtScheme {
  id: string;
  category: string;
  titleEn: string;
  titleTa: string;
  eligibilityEn: string;
  eligibilityTa: string;
  benefitEn: string;
  benefitTa: string;
  officialPortal: string;
}
