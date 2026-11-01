import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MarketplaceScreen } from '../screens/buyer/MarketplaceScreen';
import { CropDetailScreen } from '../screens/buyer/CropDetailScreen';
import { CreateListingScreen } from '../screens/farmer/CreateListingScreen';
import { FarmerListingsScreen } from '../screens/farmer/FarmerListingsScreen';
import { AiDashboardScreen } from '../screens/ai/AiDashboardScreen';
import { AiAssistantScreen } from '../screens/ai/AiAssistantScreen';
import { CropHealthScannerScreen } from '../screens/ai/CropHealthScannerScreen';
import { SmartIrrigationScreen } from '../screens/ai/SmartIrrigationScreen';
import { YieldPredictionScreen } from '../screens/ai/YieldPredictionScreen';
import { CropRecommendationScreen } from '../screens/ai/CropRecommendationScreen';
import { VoiceAssistantScreen } from '../screens/ai/VoiceAssistantScreen';
import { WeatherScreen } from '../screens/weather/WeatherScreen';
import { MarketPricesScreen } from '../screens/market/MarketPricesScreen';
import { AgriculturalAlertsScreen } from '../screens/alerts/AgriculturalAlertsScreen';
import { FindStorageScreen } from '../screens/warehouse/FindStorageScreen';
import { AddWarehouseScreen } from '../screens/warehouse/AddWarehouseScreen';
import { OwnerWarehouseScreen } from '../screens/warehouse/OwnerWarehouseScreen';
import { SpaceOccupancyScreen } from '../screens/warehouse/SpaceOccupancyScreen';
import { FarmerStorageBookingsScreen } from '../screens/warehouse/FarmerStorageBookingsScreen';
import { FindTransportScreen } from '../screens/transport/FindTransportScreen';
import { AddVehicleScreen } from '../screens/transport/AddVehicleScreen';
import { TransporterTripsScreen } from '../screens/transport/TransporterTripsScreen';
import { TransportRequestsScreen } from '../screens/transport/TransportRequestsScreen';
import { FarmerTransportBookingsScreen } from '../screens/transport/FarmerTransportBookingsScreen';
import { TransportTripScreen } from '../screens/transport/TransportTripScreen';
import { BuyerOrdersScreen } from '../screens/buyer/BuyerOrdersScreen';
import { BuyerCartScreen } from '../screens/buyer/BuyerCartScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AgriStoreHomeScreen } from '../screens/agristore/AgriStoreHomeScreen';
import { AgriProductDetailScreen } from '../screens/agristore/AgriProductDetailScreen';
import { ProductCompareScreen } from '../screens/agristore/ProductCompareScreen';
import { NearbyShopsScreen } from '../screens/agristore/NearbyShopsScreen';
import { FarmToolsHomeScreen } from '../screens/farmtools/FarmToolsHomeScreen';
import { FarmToolDetailScreen } from '../screens/farmtools/FarmToolDetailScreen';
import { EquipmentRentalScreen } from '../screens/farmtools/EquipmentRentalScreen';
import { ToolCompareScreen } from '../screens/farmtools/ToolCompareScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminCropsScreen } from '../screens/admin/AdminCropsScreen';
import { AdminWarehousesScreen } from '../screens/admin/AdminWarehousesScreen';
import { AdminVehiclesScreen } from '../screens/admin/AdminVehiclesScreen';
import { AdminOrdersScreen } from '../screens/admin/AdminOrdersScreen';
import { AdminMarketPricesScreen } from '../screens/admin/AdminMarketPricesScreen';
import { AdminAlertsScreen } from '../screens/admin/AdminAlertsScreen';
import { AdminContentScreen } from '../screens/admin/AdminContentScreen';
import { AdminServicesScreen } from '../screens/admin/AdminServicesScreen';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      {user ? (
        // Authenticated Stack: Protected Screens
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Smart Uzhavan',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="Marketplace"
            component={MarketplaceScreen}
            options={{
              title: 'Crop Marketplace',
            }}
          />
          <Stack.Screen
            name="CropDetail"
            component={CropDetailScreen}
            options={{
              title: 'Produce Details',
            }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={({ route }) => ({
              title: route.params?.postToEdit ? 'Edit Crop' : 'List Harvest',
            })}
          />
          <Stack.Screen
            name="FarmerListings"
            component={FarmerListingsScreen}
            options={{
              title: 'My Crop Listings',
            }}
          />
          <Stack.Screen
            name="AiDashboard"
            component={AiDashboardScreen}
            options={{
              title: 'AI Agriculture Hub',
            }}
          />
          <Stack.Screen
            name="AiAssistant"
            component={AiAssistantScreen}
            options={{
              title: 'AI Farming Assistant',
            }}
          />
          <Stack.Screen
            name="CropHealthScanner"
            component={CropHealthScannerScreen}
            options={{
              title: 'Crop Health Scanner',
            }}
          />
          <Stack.Screen
            name="SmartIrrigation"
            component={SmartIrrigationScreen}
            options={{
              title: 'Smart Irrigation Advisor',
            }}
          />
          <Stack.Screen
            name="YieldPrediction"
            component={YieldPredictionScreen}
            options={{
              title: 'Crop Yield Prediction',
            }}
          />
          <Stack.Screen
            name="CropRecommendation"
            component={CropRecommendationScreen}
            options={{
              title: 'Crop Recommendations',
            }}
          />
          <Stack.Screen
            name="VoiceAssistant"
            component={VoiceAssistantScreen}
            options={{
              title: 'Voice Assistant',
            }}
          />
          <Stack.Screen
            name="Weather"
            component={WeatherScreen}
            options={{
              title: 'Weather & Forecast',
            }}
          />
          <Stack.Screen
            name="MarketPrices"
            component={MarketPricesScreen}
            options={{
              title: 'Mandi Market Prices',
            }}
          />
          <Stack.Screen
            name="AgriculturalAlerts"
            component={AgriculturalAlertsScreen}
            options={{
              title: 'Agri Alerts & News',
            }}
          />
          <Stack.Screen
            name="FindStorage"
            component={FindStorageScreen}
            options={{
              title: 'Storage Facilities',
            }}
          />
          <Stack.Screen
            name="AddWarehouse"
            component={AddWarehouseScreen}
            options={{
              title: 'Register Storage Slot',
            }}
          />
          <Stack.Screen
            name="OwnerWarehouse"
            component={OwnerWarehouseScreen}
            options={{
              title: 'Warehouse Hub',
            }}
          />
          <Stack.Screen
            name="WarehouseBookings"
            component={OwnerWarehouseScreen}
            options={{
              title: 'Booking Approvals',
            }}
          />
          <Stack.Screen
            name="SpaceOccupancy"
            component={SpaceOccupancyScreen}
            options={{
              title: 'Space Occupancy',
            }}
          />
          <Stack.Screen
            name="FarmerStorageBookings"
            component={FarmerStorageBookingsScreen}
            options={{
              title: 'My Storage Bookings',
            }}
          />
          <Stack.Screen
            name="FindTransport"
            component={FindTransportScreen}
            options={{
              title: 'Transport Booking',
            }}
          />
          <Stack.Screen
            name="AddVehicle"
            component={AddVehicleScreen}
            options={{
              title: 'Add Vehicle',
            }}
          />
          <Stack.Screen
            name="TransporterTrips"
            component={TransporterTripsScreen}
            options={{
              title: 'Vehicle Fleet',
            }}
          />
          <Stack.Screen
            name="TransportRequests"
            component={TransportRequestsScreen}
            options={{
              title: 'Transport Requests',
            }}
          />
          <Stack.Screen
            name="FarmerTransportBookings"
            component={FarmerTransportBookingsScreen}
            options={{
              title: 'My Transport Bookings',
            }}
          />
          <Stack.Screen
            name="TransportTrip"
            component={TransportTripScreen}
            options={{
              title: 'Trip Tracking',
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              title: 'Notifications & Alerts',
            }}
          />
          <Stack.Screen
            name="BuyerOrders"
            component={BuyerOrdersScreen}
            options={{
              title: 'Procurement Orders',
            }}
          />
          <Stack.Screen
            name="BuyerCart"
            component={BuyerCartScreen}
            options={{
              title: 'Active Cart',
            }}
          />
          <Stack.Screen
            name="AgriStoreHome"
            component={AgriStoreHomeScreen}
            options={{
              title: 'Agri Care Store',
            }}
          />
          <Stack.Screen
            name="AgriProductDetail"
            component={AgriProductDetailScreen}
            options={{
              title: 'Product Specifications',
            }}
          />
          <Stack.Screen
            name="ProductCompare"
            component={ProductCompareScreen}
            options={{
              title: 'Input Comparison',
            }}
          />
          <Stack.Screen
            name="NearbyShops"
            component={NearbyShopsScreen}
            options={{
              title: 'Nearby Agri Depots & PACCS',
            }}
          />
          <Stack.Screen
            name="FarmToolsHome"
            component={FarmToolsHomeScreen}
            options={{
              title: 'Farm Tools & Tech',
            }}
          />
          <Stack.Screen
            name="FarmToolDetail"
            component={FarmToolDetailScreen}
            options={{
              title: 'Equipment Specifications',
            }}
          />
          <Stack.Screen
            name="EquipmentRental"
            component={EquipmentRentalScreen}
            options={{
              title: 'Machinery Rental Hub',
            }}
          />
          <Stack.Screen
            name="ToolCompare"
            component={ToolCompareScreen}
            options={{
              title: 'Tool & Equipment Comparison',
            }}
          />
          <Stack.Screen
            name="AdminUsers"
            component={AdminUsersScreen}
            options={{
              title: 'User Management',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminCrops"
            component={AdminCropsScreen}
            options={{
              title: 'Marketplace Moderate',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminWarehouses"
            component={AdminWarehousesScreen}
            options={{
              title: 'Warehouse Control',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminVehicles"
            component={AdminVehiclesScreen}
            options={{
              title: 'Transport Fleet Control',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminOrders"
            component={AdminOrdersScreen}
            options={{
              title: 'Orders & Bookings',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminMarketPrices"
            component={AdminMarketPricesScreen}
            options={{
              title: 'Mandi Rate Broadcast',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminAlerts"
            component={AdminAlertsScreen}
            options={{
              title: 'Agri Alerts & Schemes',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminContent"
            component={AdminContentScreen}
            options={{
              title: 'App Content & Categories',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
          <Stack.Screen
            name="AdminServices"
            component={AdminServicesScreen}
            options={{
              title: 'Service Health & Audit',
              headerStyle: { backgroundColor: '#0F172A' },
            }}
          />
        </>
      ) : (
        // Unauthenticated Stack: Auth & Onboarding Screens
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Sign In',
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: 'Register',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
