import { CropPost } from './crop';
import { TransportOrder } from './transport';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Marketplace: undefined;
  CropDetail: {
    postId: string;
    post?: CropPost;
  };
  CreateListing?: {
    postToEdit?: CropPost;
  };
  FarmerListings: undefined;
  AiDashboard: undefined;
  AiAssistant: undefined;
  CropHealthScanner: undefined;
  SmartIrrigation: undefined;
  YieldPrediction: undefined;
  CropRecommendation: undefined;
  VoiceAssistant: undefined;
  Weather: undefined;
  MarketPrices: undefined;
  AgriculturalAlerts: undefined;
  FindStorage: undefined;
  AddWarehouse: undefined;
  OwnerWarehouse?: {
    initialTab?: 'facilities' | 'bookings';
  };
  WarehouseBookings?: {
    initialTab?: 'facilities' | 'bookings';
  };
  SpaceOccupancy: undefined;
  FarmerStorageBookings: undefined;
  FindTransport: undefined;
  AddVehicle: undefined;
  TransporterTrips?: {
    initialTab?: 'fleet' | 'trips';
  };
  TransportRequests: undefined;
  FarmerTransportBookings: undefined;
  TransportTrip?: {
    order?: TransportOrder;
  };
  Notifications: undefined;
  BuyerOrders: undefined;
  BuyerCart: undefined;
  AgriStoreHome: undefined;
  AgriProductDetail: {
    productId: string;
  };
  ProductCompare: {
    productIds: string[];
  };
  NearbyShops?: {
    selectedDistrict?: string;
  };
  FarmToolsHome: undefined;
  FarmToolDetail: {
    toolId: string;
  };
  EquipmentRental: undefined;
  ToolCompare: {
    toolIds: string[];
  };
  Placeholder?: {
    title?: string;
    description?: string;
  };
  // Admin Module Screens
  AdminUsers: undefined;
  AdminCrops: undefined;
  AdminWarehouses: undefined;
  AdminVehicles: undefined;
  AdminOrders: undefined;
  AdminMarketPrices: undefined;
  AdminAlerts: undefined;
  AdminContent: undefined;
  AdminServices: undefined;
};
