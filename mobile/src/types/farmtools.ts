export type ToolCategory =
  | 'all'
  | 'hand_tools'
  | 'tractor_parts'
  | 'irrigation'
  | 'machinery'
  | 'hardware'
  | 'smart_tech';

export type EquipmentType =
  | 'all'
  | 'tractor'
  | 'harvester'
  | 'rotavator'
  | 'leveler'
  | 'power_weeder';

export type RentalStatus =
  | 'pending_confirmation'
  | 'accepted'
  | 'completed'
  | 'cancelled';

export interface FarmToolProduct {
  id: string;
  name: string;
  nameTa: string;
  brand: string;
  category: ToolCategory;
  subCategory: string;
  price: number;
  mrp: number;
  quantityOrSize: string;
  unitPrice: string;
  rating: number;
  reviewsCount: number;
  sellerName: string;
  sellerPhone: string;
  sellerType: 'authorized_dealer' | 'cooperative' | 'tnaic_depot';
  location: string;
  availability: 'in_stock' | 'limited_stock' | 'out_of_stock';
  description: string;
  descriptionTa: string;
  specifications: Record<string, string>;
  // Tractor Compatibility (Requirement B)
  isTractorPart: boolean;
  tractorBrand?: string;
  tractorModel?: string;
  partNumber?: string;
  compatibilityNotes?: string;
  isCompatibilityVerified: boolean;
  warranty: string;
  isGovtSubsidized: boolean;
  subsidySchemeName?: string;
  imageUrl?: string;
}

export interface MachineryRentalItem {
  id: string;
  title: string;
  titleTa: string;
  type: EquipmentType;
  ownerName: string;
  ownerPhone: string;
  location: string;
  district: string;
  rateType: 'hourly' | 'daily' | 'per_acre';
  rate: number;
  rateDisplay: string;
  availability: 'available' | 'busy' | 'seasonal';
  specifications: string;
  operatorIncluded: boolean;
  fuelIncluded: boolean;
  isVerifiedProvider: boolean;
  imageUrl?: string;
}

export interface RentalBookingRequest {
  id?: string;
  rentalId: string;
  equipmentTitle: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  requestedDate: string;
  duration: string;
  farmLocation: string;
  acreage?: string;
  notes?: string;
  status: RentalStatus;
  createdAt?: any;
}
