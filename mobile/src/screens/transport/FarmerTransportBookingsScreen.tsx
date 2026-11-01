import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { TransportOrder } from '../../types/transport';
import { subscribeToFarmerTransportOrders } from '../../services/transportService';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FarmerTransportBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToFarmerTransportOrders(
      user.uid,
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching farmer transport orders:', err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          bg: '#E3F2FD',
          color: '#1565C0',
          label: 'Accepted by Transporter',
          icon: 'check-circle-outline' as const,
        };
      case 'on_trip':
        return {
          bg: '#FFF3E0',
          color: '#E65100',
          label: 'In Transit / On Trip',
          icon: 'truck-fast' as const,
        };
      case 'completed':
        return {
          bg: '#E8F5E9',
          color: '#2E7D32',
          label: 'Delivered Successfully',
          icon: 'check-all' as const,
        };
      case 'rejected':
        return {
          bg: '#FFEBEE',
          color: '#C62828',
          label: 'Declined',
          icon: 'close-circle-outline' as const,
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
          label: 'Pending Response',
          icon: 'clock-outline' as const,
        };
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
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
              <Text style={styles.emptyTitle}>No Transport Bookings</Text>
              <Text style={styles.emptySub}>
                You haven't booked any freight vehicles yet. Search available trucks for harvest transit.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('FindTransport')}
              >
                <Text style={styles.exploreBtnText}>Find Freight Transport</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const isOnTrip = item.status === 'on_trip';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="truck" size={24} color="#1565C0" />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.vehicleName}>
                    {item.vehicleName || item.vehicleType || 'Freight Vehicle'}
                  </Text>
                  <Text style={styles.fareText}>Estimated Fare: ₹{item.price}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <MaterialCommunityIcons name={badge.icon} size={14} color={badge.color} />
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeBox}>
                <View style={styles.routeRow}>
                  <MaterialCommunityIcons name="circle-slice-8" size={14} color={Colors.primary} />
                  <Text style={styles.routeText}>{item.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#D32F2F" />
                  <Text style={styles.routeText}>{item.drop}</Text>
                </View>
              </View>

              {/* Specs */}
              <View style={styles.specsRow}>
                <View style={styles.col}>
                  <Text style={styles.label}>Distance</Text>
                  <Text style={styles.val}>{item.distanceKm} km</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Cargo Weight</Text>
                  <Text style={styles.val}>{item.weightTons} Tons</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Price</Text>
                  <Text style={[styles.val, { color: Colors.primary }]}>₹{item.price}</Text>
                </View>
              </View>

              {/* Track button if active trip */}
              {isOnTrip && (
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() =>
                    navigation.navigate('TransportTrip', {
                      order: item,
                    })
                  }
                >
                  <MaterialCommunityIcons name="map-marker-path" size={18} color={Colors.white} />
                  <Text style={styles.trackBtnText}>Track Live Dispatch & Journey</Text>
                </TouchableOpacity>
              )}
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
  listContent: {
    padding: Spacing.m,
  },
  card: {
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  headerInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fareText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: Spacing.s,
    marginBottom: Spacing.s,
  },
  routeRow: {
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
  specsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: Spacing.s,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  val: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trackBtn: {
    flexDirection: 'row',
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.s,
  },
  trackBtnText: {
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
  exploreBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.m,
    paddingVertical: 10,
    marginTop: Spacing.m,
  },
  exploreBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
