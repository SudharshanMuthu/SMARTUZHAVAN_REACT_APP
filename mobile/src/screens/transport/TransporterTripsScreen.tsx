import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Vehicle, TransportOrder } from '../../types/transport';
import {
  subscribeToMyVehicles,
  subscribeToTransporterOrders,
  updateVehicleAvailability,
  updateTransportOrderStatus,
} from '../../services/transportService';
import { useAuth } from '../../context/AuthContext';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { RoleGuard } from '../../components/RoleGuard';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'TransporterTrips'>;

export const TransporterTripsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'fleet' | 'trips'>(
    route.params?.initialTab || 'fleet'
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    // Safety timeout prevents infinite loading spinners
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    const unsubVehicles = subscribeToMyVehicles(
      user.uid,
      (data) => {
        setVehicles(data);
        setLoading(false);
        clearTimeout(timeout);
      },
      (err) => {
        console.warn('Error fetching vehicles:', err.message);
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    const unsubOrders = subscribeToTransporterOrders(
      user.uid,
      (data) => {
        setOrders(data);
        clearTimeout(timeout);
      },
      (err) => {
        console.warn('Error fetching transport orders:', err.message);
        clearTimeout(timeout);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubVehicles();
      unsubOrders();
    };
  }, [user, authLoading]);

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    try {
      await updateVehicleAvailability(vehicle.id, !vehicle.isAvailable);
    } catch (err: any) {
      showFirestoreErrorAlert('Status Error', err, 'Failed to update vehicle status.');
    }
  };

  const handleStatusChange = async (
    order: TransportOrder,
    newStatus: 'accepted' | 'rejected' | 'on_trip' | 'completed'
  ) => {
    try {
      setActionLoadingId(order.id);
      await updateTransportOrderStatus(
        order.id,
        newStatus,
        order.requestedById,
        `${order.pickup} → ${order.drop}`
      );
      setActionLoadingId(null);
      Alert.alert('Status Updated', `Trip status changed to: ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setActionLoadingId(null);
      showFirestoreErrorAlert('Update Failed', err, 'Could not update status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#1565C0';
      case 'on_trip':
        return '#E65100';
      case 'completed':
        return '#2E7D32';
      case 'rejected':
        return '#C62828';
      default:
        return '#757575';
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'requested').length;
  const onTripCount = orders.filter((o) => o.status === 'on_trip').length;

  return (
    <RoleGuard allowedRoles={['Transporter']} screenTitle="Transporter Operations">
      <View style={styles.container}>
      {/* Overview Cards */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{vehicles.length}</Text>
          <Text style={styles.summaryLabel}>Total Fleet</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: '#E65100' }]}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Requests</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: '#1565C0' }]}>{onTripCount}</Text>
          <Text style={styles.summaryLabel}>On Trip</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'fleet' && styles.tabBtnActive]}
          onPress={() => setActiveTab('fleet')}
        >
          <MaterialCommunityIcons
            name="truck"
            size={18}
            color={activeTab === 'fleet' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'fleet' && styles.tabBtnTextActive]}
          >
            My Fleet ({vehicles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'trips' && styles.tabBtnActive]}
          onPress={() => setActiveTab('trips')}
        >
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={18}
            color={activeTab === 'trips' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'trips' && styles.tabBtnTextActive]}
          >
            Bookings & Trips ({orders.length})
          </Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab 1: Fleet */}
      {activeTab === 'fleet' && (
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
                <MaterialCommunityIcons name="truck-plus-outline" size={60} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No Vehicles Registered</Text>
                <Text style={styles.emptySub}>
                  Register your first freight hauler to receive local crop transport inquiries.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconCircle}>
                  <MaterialCommunityIcons
                    name={item.type === 'Tractor' ? 'tractor' : 'truck'}
                    size={24}
                    color="#1565C0"
                  />
                </View>
                <View style={styles.vehicleHeaderText}>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  <Text style={styles.vehicleSub}>
                    {item.type} {item.number ? `• ${item.number}` : ''}
                  </Text>
                  <Text style={styles.locationText}>Base: {item.baseLocation}</Text>
                  {item.isDemo && <DemoDataBadge isDemo={true} compact />}
                </View>

                {/* Available Switch */}
                <View style={styles.switchCol}>
                  <Text
                    style={[
                      styles.switchLabel,
                      { color: item.isAvailable ? '#2E7D32' : Colors.textSecondary },
                    ]}
                  >
                    {item.isAvailable ? 'Active' : 'Offline'}
                  </Text>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={() => handleToggleAvailability(item)}
                    thumbColor={Colors.white}
                    trackColor={{ false: '#BDBDBD', true: Colors.primary }}
                  />
                </View>
              </View>

              <View style={styles.vehicleMetrics}>
                <View style={styles.vMetricItem}>
                  <Text style={styles.vMetricLabel}>Tonnage</Text>
                  <Text style={styles.vMetricVal}>{item.capacity} Tons</Text>
                </View>
                <View style={styles.vMetricItem}>
                  <Text style={styles.vMetricLabel}>Rate</Text>
                  <Text style={[styles.vMetricVal, { color: Colors.primary }]}>
                    ₹{item.ratePerKm}/km
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Tab 2: Trips & Bookings */}
      {activeTab === 'trips' && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Booking Requests</Text>
              <Text style={styles.emptySub}>
                New farmer hauling requests will appear here for review and dispatch.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isBusy = actionLoadingId === item.id;
            const statusColor = getStatusColor(item.status);

            return (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.farmerInfo}>
                    <Text style={styles.farmerName}>{item.requestedByName}</Text>
                    <Text style={styles.vehicleLabel}>
                      Vehicle: {item.vehicleName || item.vehicleType}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}
                  >
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Route Visual */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <MaterialCommunityIcons name="circle-slice-8" size={14} color={Colors.primary} />
                    <Text style={styles.routeText}>{item.pickup}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#D32F2F" />
                    <Text style={styles.routeText}>{item.drop}</Text>
                  </View>
                </View>

                {/* Specs */}
                <View style={styles.orderSpecsRow}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Distance</Text>
                    <Text style={styles.specVal}>{item.distanceKm} km</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Weight</Text>
                    <Text style={styles.specVal}>{item.weightTons} Tons</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Fare</Text>
                    <Text style={[styles.specVal, { color: Colors.primary }]}>₹{item.price}</Text>
                  </View>
                </View>

                {/* Status Lifecycles */}
                {item.status === 'requested' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, isBusy && { opacity: 0.6 }]}
                      onPress={() => handleStatusChange(item, 'rejected')}
                      disabled={isBusy}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#C62828" />
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.acceptBtn, isBusy && { opacity: 0.6 }]}
                      onPress={() => handleStatusChange(item, 'accepted')}
                      disabled={isBusy}
                    >
                      <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                      <Text style={styles.acceptBtnText}>Accept Ride</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'accepted' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.startTripBtn, isBusy && { opacity: 0.6 }]}
                      onPress={() => handleStatusChange(item, 'on_trip')}
                      disabled={isBusy}
                    >
                      <MaterialCommunityIcons name="truck-fast" size={18} color={Colors.white} />
                      <Text style={styles.startTripBtnText}>Start Trip / Dispatch</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'on_trip' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() =>
                        navigation.navigate('TransportTrip', {
                          order: item,
                        })
                      }
                    >
                      <MaterialCommunityIcons name="map-marker-path" size={16} color="#1565C0" />
                      <Text style={styles.trackBtnText}>Track Route</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.completeBtn, isBusy && { opacity: 0.6 }]}
                      onPress={() => handleStatusChange(item, 'completed')}
                      disabled={isBusy}
                    >
                      <MaterialCommunityIcons name="check-all" size={18} color={Colors.white} />
                      <Text style={styles.completeBtnText}>Complete Delivery</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* FAB to Add Vehicle */}
      {activeTab === 'fleet' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddVehicle')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={26} color={Colors.white} />
          <Text style={styles.fabText}>Add Vehicle</Text>
        </TouchableOpacity>
      )}
      </View>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    margin: Spacing.m,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  badge: {
    backgroundColor: '#E65100',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.m,
    paddingBottom: 80,
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
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  vehicleHeaderText: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switchCol: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleMetrics: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: Spacing.s,
  },
  vMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  vMetricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  vMetricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: Spacing.s,
    marginBottom: Spacing.s,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeLine: {
    width: 2,
    height: 10,
    backgroundColor: '#CCCCCC',
    marginLeft: 6,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  orderSpecsRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: Spacing.s,
    marginBottom: Spacing.s,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  rejectBtnText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  acceptBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  startTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E65100',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  startTripBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  trackBtnText: {
    color: '#1565C0',
    fontWeight: '700',
    fontSize: 13,
  },
  completeBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  completeBtnText: {
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
  fab: {
    position: 'absolute',
    right: Spacing.m,
    bottom: Spacing.m,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: Spacing.m,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
