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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { TransportOrder } from '../../types/transport';
import {
  subscribeToTransporterOrders,
  updateTransportOrderStatus,
} from '../../services/transportService';
import { useAuth } from '../../context/AuthContext';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { RoleGuard } from '../../components/RoleGuard';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TransportRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    const unsub = subscribeToTransporterOrders(
      user.uid,
      (data) => {
        setOrders(data);
        setLoading(false);
        clearTimeout(timeout);
      },
      (err) => {
        console.warn('[TransportRequests] Error fetching orders:', err.message);
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [user, authLoading]);

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
      Alert.alert('Status Updated', `Order status changed to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setActionLoadingId(null);
      showFirestoreErrorAlert('Update Failed', err, 'Could not update status');
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

  return (
    <RoleGuard allowedRoles={['Transporter']} screenTitle="Transport Requests">
      <View style={styles.container}>
        {/* Header Notice */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="clipboard-text-clock" size={24} color="#E65100" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Farmer Freight Inquiries</Text>
            <Text style={styles.bannerSub}>
              Accept incoming transport jobs and assign freight haulers for dispatch.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading transport inquiries...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No Booking Requests</Text>
                <Text style={styles.emptySub}>
                  When farmers request produce transit from your fleet, requests will appear here.
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
                      <Text style={styles.farmerName}>{item.requestedByName || 'Farmer'}</Text>
                      <Text style={styles.vehicleLabel}>
                        Vehicle: {item.vehicleName || item.vehicleType}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
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

                  {/* Metrics */}
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
                      <Text style={styles.specLabel}>Total Fare</Text>
                      <Text style={[styles.specVal, { color: Colors.primary }]}>₹{item.price}</Text>
                    </View>
                  </View>

                  {/* Actions */}
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
                        onPress={() => navigation.navigate('TransportTrip', { order: item })}
                      >
                        <MaterialCommunityIcons name="map-marker-path" size={16} color="#1565C0" />
                        <Text style={styles.trackBtnText}>Track GPS</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.completeBtn, isBusy && { opacity: 0.6 }]}
                        onPress={() => handleStatusChange(item, 'completed')}
                        disabled={isBusy}
                      >
                        <MaterialCommunityIcons name="check-all" size={18} color={Colors.white} />
                        <Text style={styles.completeBtnText}>Mark Delivered</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeContainer: {
    backgroundColor: '#F9FBF9',
    borderRadius: 8,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: '#C8E6C9',
    marginLeft: 6,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  orderSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: Spacing.xs,
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
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
    marginTop: Spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
    gap: 4,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C62828',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  startTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E65100',
    gap: 6,
  },
  startTripBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
    backgroundColor: '#E3F2FD',
    gap: 4,
  },
  trackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1565C0',
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    gap: 4,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
