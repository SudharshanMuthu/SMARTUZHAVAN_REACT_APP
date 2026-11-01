import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Warehouse, WarehouseBooking } from '../../types/warehouse';
import {
  subscribeToMyWarehouses,
  subscribeToOwnerWarehouseBookings,
} from '../../services/warehouseService';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/RoleGuard';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SpaceOccupancyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.warn('[SpaceOccupancy] Error fetching warehouses:', err.message);
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
        console.warn('[SpaceOccupancy] Error fetching bookings:', err.message);
        clearTimeout(timeout);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubWh();
      unsubBookings();
    };
  }, [user, authLoading]);

  // Calculations
  const totalCapacity = warehouses.reduce((acc, w) => acc + (w.capacity || 0), 0);
  const totalAvailable = warehouses.reduce((acc, w) => acc + (w.availableSpace || 0), 0);
  const totalOccupied = Math.max(0, totalCapacity - totalAvailable);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const activeStoredBookings = bookings.filter((b) => b.status === 'stored' || b.status === 'accepted');

  return (
    <RoleGuard allowedRoles={['Warehouse']} screenTitle="Space Occupancy">
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Occupancy Hero Card */}
        <View style={styles.heroCard}>
          {warehouses.some((w) => w.isDemo) && (
            <View style={{ marginBottom: 8 }}>
              <DemoDataBadge isDemo={true} />
            </View>
          )}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroTitle}>Storage Utilization</Text>
              <Text style={styles.heroSubtitle}>Aggregated capacity across all registered bays</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{occupancyPercent}%</Text>
            </View>
          </View>

          {/* Bar Chart Representation */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(5, occupancyPercent))}%`,
                  backgroundColor: occupancyPercent > 85 ? '#C62828' : '#E65100',
                },
              ]}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Capacity</Text>
              <Text style={styles.metricVal}>{totalCapacity} Tons</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Occupied</Text>
              <Text style={[styles.metricVal, { color: '#E65100' }]}>{totalOccupied} Tons</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Free Space</Text>
              <Text style={[styles.metricVal, { color: '#2E7D32' }]}>{totalAvailable} Tons</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Calculating bay occupancy...</Text>
          </View>
        ) : warehouses.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="warehouse" size={54} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No Facilities Registered</Text>
            <Text style={styles.emptySub}>
              Register a storage facility to view space occupancy and retention metrics.
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddWarehouse')}
            >
              <MaterialCommunityIcons name="plus" size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Add Storage Facility</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.facilitySection}>
            <Text style={styles.sectionHeader}>Facility Breakdown ({warehouses.length})</Text>

            {warehouses.map((wh) => {
              const cap = wh.capacity || 0;
              const avail = wh.availableSpace || 0;
              const occ = Math.max(0, cap - avail);
              const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;

              return (
                <View key={wh.id} style={styles.facilityCard}>
                  <View style={styles.facilityHeader}>
                    <Text style={styles.facilityName}>{wh.warehouseName}</Text>
                    <Text style={styles.facilityLocation}>{wh.location}</Text>
                  </View>

                  <View style={styles.bayBarBg}>
                    <View
                      style={[
                        styles.bayBarFill,
                        {
                          width: `${Math.min(100, Math.max(3, pct))}%`,
                          backgroundColor: pct > 85 ? '#C62828' : Colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.bayFooter}>
                    <Text style={styles.bayStat}>
                      Occupied: <Text style={styles.bold}>{occ} T</Text>
                    </Text>
                    <Text style={styles.bayStat}>
                      Available: <Text style={styles.bold}>{avail} T</Text>
                    </Text>
                    <Text style={styles.bayStat}>
                      Utilization: <Text style={[styles.bold, { color: Colors.primary }]}>{pct}%</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Active Stored Lots Section */}
        <View style={styles.grainSection}>
          <Text style={styles.sectionHeader}>Active Stored Lots ({activeStoredBookings.length})</Text>
          {activeStoredBookings.length === 0 ? (
            <View style={styles.emptyLotCard}>
              <MaterialCommunityIcons name="package-variant" size={32} color="#BDBDBD" />
              <Text style={styles.emptyLotText}>No harvest lots currently checked into bays</Text>
            </View>
          ) : (
            activeStoredBookings.map((b) => (
              <View key={b.id} style={styles.lotCard}>
                <View style={styles.lotHeader}>
                  <Text style={styles.lotFarmer}>{b.farmerName || 'Farmer'}</Text>
                  <View style={styles.lotBadge}>
                    <Text style={styles.lotBadgeText}>{(b.status || '').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.lotSub}>
                  Facility: {b.warehouseName || 'Warehouse Bay'} • Duration: {b.days || 30} Days
                </Text>
                <Text style={styles.lotWeight}>Quantity Stored: {b.quantity} Bags</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  heroCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: Spacing.md + 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E65100',
  },
  heroSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#E65100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#FFE0B2',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  facilitySection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  facilityCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  facilityLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bayBarBg: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  bayBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bayStat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grainSection: {
    marginBottom: Spacing.lg,
  },
  emptyLotCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyLotText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  lotCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: Spacing.xs,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lotFarmer: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lotBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  lotSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lotWeight: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
});
