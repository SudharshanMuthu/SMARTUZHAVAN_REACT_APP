import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Warehouse, WarehouseBooking } from '../../types/warehouse';
import {
  subscribeToMyWarehouses,
  subscribeToOwnerWarehouseBookings,
  updateWarehouseBookingStatus,
} from '../../services/warehouseService';
import { useAuth } from '../../context/AuthContext';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { RoleGuard } from '../../components/RoleGuard';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'OwnerWarehouse'>;

export const OwnerWarehouseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'facilities' | 'bookings'>(
    route.params?.initialTab || 'facilities'
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
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

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    const unsubWh = subscribeToMyWarehouses(
      user.uid,
      (data) => {
        setWarehouses(data);
        setLoading(false);
        clearTimeout(timeout);
      },
      (err) => {
        console.warn('Error fetching owner warehouses:', err.message);
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    const unsubBookings = subscribeToOwnerWarehouseBookings(
      user.uid,
      (data) => {
        setBookings(data);
        clearTimeout(timeout);
      },
      (err) => {
        console.warn('Error fetching owner bookings:', err.message);
        clearTimeout(timeout);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubWh();
      unsubBookings();
    };
  }, [user, authLoading]);

  // Aggregate metrics
  const totalCapacity = warehouses.reduce((acc, w) => acc + (w.capacity || 0), 0);
  const totalAvailable = warehouses.reduce((acc, w) => acc + (w.availableSpace || 0), 0);
  const totalOccupied = Math.max(0, totalCapacity - totalAvailable);
  const pendingRequestsCount = bookings.filter((b) => b.status === 'requested').length;

  const handleStatusChange = async (
    booking: WarehouseBooking,
    newStatus: 'accepted' | 'rejected' | 'stored'
  ) => {
    try {
      setActionLoadingId(booking.id);
      await updateWarehouseBookingStatus(booking.id, newStatus, booking);
      setActionLoadingId(null);
      Alert.alert(
        'Status Updated',
        `Booking marked as ${newStatus.toUpperCase()}.${
          newStatus === 'accepted' ? ' Warehouse available space has been updated.' : ''
        }`
      );
    } catch (err: any) {
      setActionLoadingId(null);
      showFirestoreErrorAlert('Update Failed', err, 'Could not update status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#1565C0';
      case 'stored':
        return '#2E7D32';
      case 'rejected':
        return '#C62828';
      default:
        return '#E65100';
    }
  };

  return (
    <RoleGuard allowedRoles={['Warehouse']} screenTitle="Warehouse Management">
      <View style={styles.container}>
      {/* Metric Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{totalCapacity} T</Text>
            <Text style={styles.summaryLabel}>Total Capacity</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#E65100' }]}>{totalOccupied} T</Text>
            <Text style={styles.summaryLabel}>Occupied</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#2E7D32' }]}>{totalAvailable} T</Text>
            <Text style={styles.summaryLabel}>Available</Text>
          </View>
        </View>

        {/* Space Occupancy Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${
                  totalCapacity > 0
                    ? Math.min(100, (totalOccupied / totalCapacity) * 100)
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'facilities' && styles.tabBtnActive]}
          onPress={() => setActiveTab('facilities')}
        >
          <MaterialCommunityIcons
            name="warehouse"
            size={18}
            color={activeTab === 'facilities' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'facilities' && styles.tabBtnTextActive]}
          >
            My Facilities ({warehouses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={18}
            color={activeTab === 'bookings' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'bookings' && styles.tabBtnTextActive]}
          >
            Booking Requests ({bookings.length})
          </Text>
          {pendingRequestsCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab 1: Facilities */}
      {activeTab === 'facilities' && (
        <FlatList
          data={warehouses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {}}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="warehouse" size={60} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No Storage Facilities Added</Text>
                <Text style={styles.emptySub}>
                  Register your first warehouse slot to accept booking requests from local farmers.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const occupied = Math.max(0, item.capacity - item.availableSpace);
            const occupancyPct =
              item.capacity > 0 ? Math.round((occupied / item.capacity) * 100) : 0;

            return (
              <View style={styles.facilityCard}>
                <View style={styles.facilityHeader}>
                  <View style={styles.facilityIconCircle}>
                    <MaterialCommunityIcons name="office-building" size={24} color="#6A1B9A" />
                  </View>
                  <View style={styles.facilityHeaderText}>
                    <Text style={styles.facilityName}>{item.warehouseName}</Text>
                    <Text style={styles.facilityLoc}>{item.location}</Text>
                    {item.isDemo && <DemoDataBadge isDemo={true} compact />}
                  </View>
                  <View style={styles.rateBadge}>
                    <Text style={styles.rateBadgeText}>₹{item.ratePerDay}/T</Text>
                  </View>
                </View>

                {/* Capacity breakdown */}
                <View style={styles.capacityRow}>
                  <Text style={styles.capacityText}>
                    Occupancy: <Text style={{ fontWeight: '700' }}>{occupancyPct}%</Text> ({occupied}T / {item.capacity}T)
                  </Text>
                  <Text style={styles.availableText}>
                    {item.availableSpace}T Remaining
                  </Text>
                </View>

                <View style={styles.facilityProgressBar}>
                  <View
                    style={[
                      styles.facilityProgressBarFill,
                      { width: `${Math.min(100, occupancyPct)}%` },
                    ]}
                  />
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Tab 2: Bookings */}
      {activeTab === 'bookings' && (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Booking Requests</Text>
              <Text style={styles.emptySub}>
                When farmers submit storage bookings for your facility, they will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPending = item.status === 'requested';
            const isAccepted = item.status === 'accepted';
            const isBusy = actionLoadingId === item.id;

            return (
              <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View>
                    <Text style={styles.farmerName}>{item.farmerName}</Text>
                    <Text style={styles.facilitySub}>{item.warehouseName || 'Warehouse'}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(item.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Storage Load</Text>
                    <Text style={styles.detailVal}>{item.quantity} Tons</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailVal}>{item.days} Days</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Total Revenue</Text>
                    <Text style={[styles.detailVal, { color: Colors.primary }]}>
                      ₹{item.totalPrice}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                {isPending && (
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
                      <Text style={styles.acceptBtnText}>Approve & Reserve</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isAccepted && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.storeBtn, isBusy && { opacity: 0.6 }]}
                      onPress={() => handleStatusChange(item, 'stored')}
                      disabled={isBusy}
                    >
                      <MaterialCommunityIcons name="package-variant-closed" size={16} color={Colors.white} />
                      <Text style={styles.storeBtnText}>Mark Harvest Stored</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Floating Action Button for Adding Warehouse */}
      {activeTab === 'facilities' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddWarehouse')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={26} color={Colors.white} />
          <Text style={styles.fabText}>Add Facility</Text>
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
    backgroundColor: Colors.white,
    margin: Spacing.m,
    borderRadius: 12,
    padding: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E65100',
    borderRadius: 3,
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
  pendingBadge: {
    backgroundColor: '#E65100',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  pendingBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.m,
    paddingBottom: 80,
  },
  facilityCard: {
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
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  facilityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  facilityHeaderText: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  facilityLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  capacityText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  facilityProgressBar: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  facilityProgressBarFill: {
    height: '100%',
    backgroundColor: '#6A1B9A',
    borderRadius: 3,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  facilitySub: {
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
  bookingDetailsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: Spacing.s,
    marginBottom: Spacing.s,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  storeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  storeBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
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
