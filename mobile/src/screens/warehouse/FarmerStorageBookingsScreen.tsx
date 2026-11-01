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
import { WarehouseBooking } from '../../types/warehouse';
import { subscribeToFarmerWarehouseBookings } from '../../services/warehouseService';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FarmerStorageBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToFarmerWarehouseBookings(
      user.uid,
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching farmer bookings:', err.message);
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
          label: 'Approved / Reserved',
          icon: 'check-circle-outline' as const,
        };
      case 'stored':
        return {
          bg: '#E8F5E9',
          color: '#2E7D32',
          label: 'Harvest Stored',
          icon: 'package-variant-closed' as const,
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
          bg: '#FFF3E0',
          color: '#E65100',
          label: 'Pending Approval',
          icon: 'clock-outline' as const,
        };
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
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
              <Text style={styles.emptyTitle}>No Storage Bookings</Text>
              <Text style={styles.emptySub}>
                You have not booked any warehouse storage slots yet. Explore available facilities to reserve space.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('FindStorage')}
              >
                <Text style={styles.exploreBtnText}>Find Storage Facilities</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="office-building" size={24} color="#6A1B9A" />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.facilityName}>
                    {item.warehouseName || 'Warehouse Facility'}
                  </Text>
                  {item.location ? (
                    <Text style={styles.locationText}>{item.location}</Text>
                  ) : null}
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <MaterialCommunityIcons name={badge.icon} size={14} color={badge.color} />
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.col}>
                  <Text style={styles.label}>Quantity</Text>
                  <Text style={styles.val}>{item.quantity} Tons</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Duration</Text>
                  <Text style={styles.val}>{item.days} Days</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Estimated Cost</Text>
                  <Text style={[styles.val, { color: Colors.primary }]}>₹{item.totalPrice}</Text>
                </View>
              </View>
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
    marginBottom: Spacing.m,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  headerInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationText: {
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
  detailsRow: {
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
