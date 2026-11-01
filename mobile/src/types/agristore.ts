export type AgriCategory =
  | 'all'
  | 'fertilizer'
  | 'organic'
  | 'crop_protection'
  | 'crop_care'
  | 'seeds';

export type ToxicityBand = 'green' | 'blue' | 'yellow' | 'red' | 'bio' | 'none';

export type SellerType = 'cooperative' | 'authorized_dealer' | 'government_depot';

export interface AgriProduct {
  id: string;
  name: string;
  nameTa: string;
  brand: string;
  category: AgriCategory;
  subCategory: string;
  price: number;
  mrp: number;
  packSize: string;
  unitPrice: string;
  rating: number;
  reviewsCount: number;
  sellerName: string;
  sellerType: SellerType;
  availability: 'in_stock' | 'limited_stock' | 'out_of_stock';
  description: string;
  descriptionTa: string;
  activeIngredients: string;
  targetCrops: string[];
  targetPestsOrNutrients: string[];
  dosageGuidance: string;
  toxicityBand: ToxicityBand;
  waitingPeriodDays?: number; // Pre-harvest interval (PHI)
  safetyWarnings: string[];
  disclaimer: string;
  isSubsidized?: boolean;
  isVerifiedGovtApproved: boolean;
  imageUrl?: string;
}

export interface AgriShop {
  id: string;
  name: string;
  nameTa: string;
  type: SellerType;
  district: string;
  address: string;
  phone: string;
  timing: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  authorizedBrands: string[];
  subsidizedUreaAvailable: boolean;
  subsidizedDapAvailable: boolean;
  isVerified: boolean;
}
