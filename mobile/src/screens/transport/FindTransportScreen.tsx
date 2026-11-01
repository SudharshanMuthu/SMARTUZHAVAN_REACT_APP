import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Vehicle } from '../../types/transport';
import {
  subscribeToAvailableVehicles,
  createTransportOrder,
} from '../../services/transportService';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BASE_LOCATIONS = ['All', 'Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore'];

export const FindTransportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [pickup, setPickup] = useState('Trichy APMC Market');
  const [drop, setDrop] = useState('Chennai Koyambedu Terminal');
  const [distanceKm, setDistanceKm] = useState('320');
  const [weightTons, setWeightTons] = useState('3.5');
  const [selectedBaseLoc, setSelectedBaseLoc] = useState('All');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingVehicleId, setBookingVehicleId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAvailableVehicles(
      selectedBaseLoc,
      (data) => {
        setVehicles(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching available vehicles:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedBaseLoc]);

  const handleBookVehicle = async (vehicle: Vehicle) => {
    if (!pickup.trim()) {
      Alert.alert('Required', 'Please enter a pickup location.');
      return;
    }
    if (!drop.trim()) {
      Alert.alert('Required', 'Please enter a drop destination.');
      return;
    }
    const distNum = Number(distanceKm);
    if (!distNum || distNum <= 0) {
      Alert.alert('Required', 'Please enter a valid transit distance in km.');
      return;
    }
    const weightNum = Number(weightTons);
    if (!weightNum || weightNum <= 0) {
      Alert.alert('Required', 'Please enter cargo weight in tons.');
      return;
    }

    if (vehicle.capacity > 0 && weightNum > vehicle.capacity) {
      Alert.alert(
        'Overweight Warning',
        `Your cargo weight (${weightNum}T) exceeds this vehicle's maximum rated capacity (${vehicle.capacity}T). Would you still like to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed Anyway',
            onPress: () => submitBooking(vehicle, distNum, weightNum),
          },
        ]
      );
      return;
    }

    submitBooking(vehicle, distNum, weightNum);
  };

  const submitBooking = async (
    vehicle: Vehicle,
    distNum: number,
    weightNum: number
  ) => {
    const estimatedPrice = Math.round(distNum * vehicle.ratePerKm);

    try {
      setBookingVehicleId(vehicle.id);
      await createTransportOrder({
        vehicleId: vehicle.id,
        transporterId: vehicle.ownerId,
        pickup: pickup.trim(),
        drop: drop.trim(),
        distanceKm: distNum,
        weightTons: weightNum,
        price: estimatedPrice,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
      });

      setBookingVehicleId(null);
      Alert.alert(
        'Transport Requested',
        `Booking request sent to transporter for ₹${estimatedPrice}. You can track this trip in My Transport Bookings.`,
        [
          {
            text: 'View My Trips',
            onPress: () => navigation.navigate('FarmerTransportBookings'),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      setBookingVehicleId(null);
      showFirestoreErrorAlert('Booking Error', err, 'Failed to submit transport order.');
    }
  };

  const distNum = Number(distanceKm) || 0;
  const weightNum = Number(weightTons) || 0;

  return (
    <View style={styles.container}>
      {/* Search Route Card */}
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <MaterialCommunityIcons name="circle-slice-8" size={16} color={Colors.primary} />
          <TextInput
            style={styles.routeInput}
            placeholder="Pickup Location (e.g. Trichy APMC)"
            placeholderTextColor={Colors.textSecondary}
            value={pickup}
            onChangeText={setPickup}
          />
        </View>

        <View style={styles.routeConnector}>
          <View style={styles.connectorLine} />
        </View>

        <View style={styles.routeRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#D32F2F" />
          <TextInput
            style={styles.routeInput}
            placeholder="Drop Destination (e.g. Chennai Koyambedu)"
            placeholderTextColor={Colors.textSecondary}
            value={drop}
            onChangeText={setDrop}
          />
        </View>

        <View style={styles.specRow}>
          <View style={styles.specCol}>
            <Text style={styles.specLabel}>Estimated Distance</Text>
            <View style={styles.specInputContainer}>
              <TextInput
                style={styles.specInput}
                keyboardType="numeric"
                value={distanceKm}
                onChangeText={setDistanceKm}
              />
              <Text style={styles.specUnit}>km</Text>
            </View>
          </View>

          <View style={styles.specColSpacing} />

          <View style={styles.specCol}>
            <Text style={styles.specLabel}>Cargo Weight</Text>
            <View style={styles.specInputContainer}>
              <TextInput
                style={styles.specInput}
                keyboardType="numeric"
                value={weightTons}
                onChangeText={setWeightTons}
              />
              <Text style={styles.specUnit}>Tons</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Header bar for Location Filter & My Trips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {BASE_LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[
                styles.locFilterChip,
                selectedBaseLoc === loc && styles.locFilterChipActive,
              ]}
              onPress={() => setSelectedBaseLoc(loc)}
            >
              <Text
                style={[
                  styles.locFilterText,
                  selectedBaseLoc === loc && styles.locFilterTextActive,
                ]}
              >
                {loc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.myTripsBtn}
          onPress={() => navigation.navigate('FarmerTransportBookings')}
        >
          <MaterialCommunityIcons name="truck-fast" size={18} color={Colors.white} />
          <Text style={styles.myTripsBtnText}>My Trips</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Results List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => {}}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="truck-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Vehicles Available</Text>
              <Text style={styles.emptySub}>
                No verified transporters found for location "{selectedBaseLoc}". Try selecting "All" or another district.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const estimatedFare = Math.round(distNum * item.ratePerKm);
          const isOverCapacity = item.capacity > 0 && weightNum > item.capacity;
          const isBusy = bookingVehicleId === item.id;

          return (
            <View style={styles.vehicleCard}>
              <View style={styles.cardHeader}>
                <View style={styles.vehicleIconCircle}>
                  <MaterialCommunityIcons name="truck" size={26} color="#1565C0" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  <Text style={styles.vehicleType}>
                    {item.type} {item.number ? `• ${item.number}` : ''}
                  </Text>
                  <View style={styles.locationBadge}>
                    <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.locationBadgeText}>Base: {item.baseLocation}</Text>
                  </View>
                  {item.isDemo && <DemoDataBadge isDemo={true} compact />}
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.estPriceVal}>₹{estimatedFare}</Text>
                  <Text style={styles.estPriceSub}>₹{item.ratePerKm}/km</Text>
                </View>
              </View>

              <View style={styles.capacityBar}>
                <View style={styles.capCol}>
                  <Text style={styles.capLabel}>Capacity</Text>
                  <Text style={styles.capVal}>{item.capacity} Tons</Text>
                </View>
                <View style={styles.capCol}>
                  <Text style={styles.capLabel}>Cargo</Text>
                  <Text
                    style={[
                      styles.capVal,
                      isOverCapacity ? { color: '#C62828' } : { color: '#2E7D32' },
                    ]}
                  >
                    {weightNum} Tons
                  </Text>
                </View>
                <View style={styles.capCol}>
                  <Text style={styles.capLabel}>Est. Distance</Text>
                  <Text style={styles.capVal}>{distNum} km</Text>
                </View>
              </View>

              {isOverCapacity && (
                <View style={styles.overCapacityAlert}>
                  <MaterialCommunityIcons name="alert-circle" size={14} color="#C62828" />
                  <Text style={styles.overCapacityText}>
                    Warning: Cargo ({weightNum}T) exceeds rated vehicle capacity ({item.capacity}T).
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.bookBtn, isBusy && { opacity: 0.7 }]}
                onPress={() => handleBookVehicle(item)}
                disabled={isBusy}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={16} color={Colors.white} />
                    <Text style={styles.bookBtnText}>Book Freight Transport</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  routeCard: {
    backgroundColor: Colors.white,
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeInput: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: Spacing.s,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  routeConnector: {
    paddingLeft: 7,
    marginVertical: 2,
  },
  connectorLine: {
    width: 2,
    height: 12,
    backgroundColor: '#BDBDBD',
  },
  specRow: {
    flexDirection: 'row',
    marginTop: Spacing.s,
  },
  specCol: {
    flex: 1,
  },
  specColSpacing: {
    width: Spacing.s,
  },
  specLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  specInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: Spacing.s,
    height: 38,
  },
  specInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterScroll: {
    flex: 1,
  },
  locFilterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  locFilterChipActive: {
    backgroundColor: Colors.primary,
  },
  locFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  locFilterTextActive: {
    color: Colors.white,
  },
  myTripsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: Spacing.s,
    gap: 4,
  },
  myTripsBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.m,
  },
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  vehicleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  estPriceVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  estPriceSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  capacityBar: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: Spacing.s,
    marginVertical: Spacing.xs,
  },
  capCol: {
    flex: 1,
    alignItems: 'center',
  },
  capLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  capVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  overCapacityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 6,
    gap: 4,
    marginVertical: 4,
  },
  overCapacityText: {
    fontSize: 11,
    color: '#C62828',
    flex: 1,
  },
  bookBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.s,
  },
  bookBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: Spacing.l,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.m,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
