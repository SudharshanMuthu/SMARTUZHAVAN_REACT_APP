export interface CropPost {
  id: string;
  userId: string;
  userName: string;
  farmerName?: string;
  cropName: string;
  capacity: string;
  rate: string | number;
  quality?: string;
  location: string;
  district?: string;
  category?: string;
  variety?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  status?: string;
  imageUrl?: string | null;
  createdAt?: any;
  isDemo?: boolean;
}

export interface CreateCropPostInput {
  cropName: string;
  capacity: string;
  rate: string;
  quality?: string;
  location: string;
  imageUrl?: string | null;
}
