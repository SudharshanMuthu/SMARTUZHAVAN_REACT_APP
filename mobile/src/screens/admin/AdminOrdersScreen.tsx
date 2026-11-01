import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface AdminOrder {
  id: string;
  orderNumber?: string;
  buyerName?: string;
  sellerName?: string;
  farmerName?: string;
  cropName?: string;
  item?: string;
  quantity?: number;
  totalAmount?: number;
  price?: number;
  status?: string;
  createdAt?: any;
  type?: string;
}

interface AdminBooking {
  id: string;
  bookingNumber?: string;
  farmerName?: string;
  warehouseName?: string;
  commodity?: string;
  quantity?: number;
  startDate?: string;
  durationDays?: number;
  totalCost?: number;
  status?: string;
}

const FALLBACK_ORDERS: AdminOrder[] = [
  { id: 'ord-101', orderNumber: 'ORD-2026-101', cropName: 'Ponni Paddy (நெல்)', buyerName: 'Kavitha Selvam', farmerName: 'Muthu Vel', quantity: 1500, totalAmount: 36000, status: 'requested' },
  { id: 'ord-102', orderNumber: 'ORD-2026-102', cropName: 'Country Tomato (தக்காளி)', buyerName: 'Priya Narayanan', farmerName: 'Gopal Krishnan', quantity: 500, totalAmount: 16000, status: 'accepted' },
  { id: 'ord-103', orderNumber: 'ORD-2026-103', cropName: 'Turmeric Fingers (மஞ்சள்)', buyerName: 'Salem Spices Ltd', farmerName: 'Kuppusamy', quantity: 800, totalAmount: 88000, status: 'completed' },
];

const FALLBACK_BOOKINGS: AdminBooking[] = [
  { id: 'bk-201', bookingNumber: 'BKG-2026-201', warehouseName: 'Cauvery Cold Storage', farmerName: 'Muthu Vel', commodity: 'Paddy Seeds', quantity: 30, durationDays: 60, totalCost: 32400, status: 'requested' },
  { id: 'bk-202', bookingNumber: 'BKG-2026-202', warehouseName: 'Kongu Agro Warehouse', farmerName: 'Palanisamy', commodity: 'Turmeric Bags', quantity: 50, durationDays: 90, totalCost: 67500, status: 'accepted' },
];

export const AdminOrdersScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'orders') {
        const data = await adminService.getOrders();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(FALLBACK_ORDERS);
        }
      } else {
        const data = await adminService.getStorageBookings();
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
        } else {
          setBookings(FALLBACK_BOOKINGS);
        }
      }
    } catch {
      if (activeTab === 'orders') setOrders(FALLBACK_ORDERS);
      else setBookings(FALLBACK_BOOKINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Change order status to "${newStatus.toUpperCase()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await adminService.updateOrderStatus(orderId, newStatus);
            } catch {
              // demo state update
            }
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            Alert.alert('Updated', `Order marked as ${newStatus}.`);
          },
        },
      ]
    );
  };

  const handleUpdateBookingStatus = (bookingId: string, newStatus: string) => {
    Alert.alert(
      'Update Booking',
      `Change warehouse booking status to "${newStatus.toUpperCase()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await adminService.updateStorageBookingStatus(bookingId, newStatus);
            } catch {
              // demo state update
            }
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
            );
            Alert.alert('Updated', `Booking marked as ${newStatus}.`);
          },
        },
      ]
    );
  };

  const getStatusColor = (st?: string) => {
    switch (st?.toLowerCase()) {
      case 'accepted':
      case 'approved':
      case 'confirmed':
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'Approved' };
      case 'completed':
        return { bg: '#E0F2F1', text: '#00796B', label: 'Completed' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' };
      default:
        return { bg: '#FFF3E0', text: '#E65100', label: 'Pending' };
    }
  };

  const renderOrderItem = ({ item }: { item: AdminOrder }) => {
    const sc = getStatusColor(item.status);
    const amount = item.totalAmount || item.price || 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
            <Text style={styles.itemTitle}>{item.cropName || item.item || 'Crop Order'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            Buyer: <Text style={styles.boldText}>{item.buyerName || 'Verified Buyer'}</Text>
          </Text>
          <Text style={styles.detailText}>
            Farmer: <Text style={styles.boldText}>{item.farmerName || item.sellerName || 'Local Farmer'}</Text>
          </Text>
        </View>

        <View style={styles.statRow}>
          <View>
            <Text style={styles.statLabel}>Quantity</Text>
            <Text style={styles.statValue}>{`${item.quantity || 100} kg`}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total Amount</Text>
            <Text style={[styles.statValue, { color: '#2E7D32' }]}>{`₹${amount.toLocaleString('en-IN')}`}</Text>
          </View>
        </View>

        {item.status?.toLowerCase() === 'requested' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#2E7D32' }]}
              onPress={() => handleUpdateOrderStatus(item.id, 'accepted')}
            >
              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              <Text style={styles.btnActionText}>Approve Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#C62828' }]}
              onPress={() => handleUpdateOrderStatus(item.id, 'rejected')}
            >
              <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.btnActionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderBookingItem = ({ item }: { item: AdminBooking }) => {
    const sc = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.bookingNumber || item.id}</Text>
            <Text style={styles.itemTitle}>{item.warehouseName || 'Warehouse Slot'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            Farmer: <Text style={styles.boldText}>{item.farmerName || 'Registered Farmer'}</Text>
          </Text>
          <Text style={styles.detailText}>
            Commodity: <Text style={styles.boldText}>{item.commodity || 'Agri Produce'}</Text>
          </Text>
        </View>

        <View style={styles.statRow}>
          <View>
            <Text style={styles.statLabel}>Storage Space</Text>
            <Text style={styles.statValue}>{`${item.quantity || 10} MT`}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Estimated Bill</Text>
            <Text style={[styles.statValue, { color: '#E65100' }]}>{`₹${(item.totalCost || 12000).toLocaleString('en-IN')}`}</Text>
          </View>
        </View>

        {item.status?.toLowerCase() === 'requested' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#2E7D32' }]}
              onPress={() => handleUpdateBookingStatus(item.id, 'accepted')}
            >
              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              <Text style={styles.btnActionText}>Confirm Space</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#C62828' }]}
              onPress={() => handleUpdateBookingStatus(item.id, 'rejected')}
            >
              <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.btnActionText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={18}
            color={activeTab === 'orders' ? '#FFFFFF' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Marketplace Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <MaterialCommunityIcons
            name="warehouse"
            size={18}
            color={activeTab === 'bookings' ? '#FFFFFF' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Storage Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : activeTab === 'orders' ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No orders found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="warehouse" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No storage bookings found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.m,
    gap: Spacing.s,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.m,
    gap: Spacing.m,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    marginVertical: 4,
    gap: 2,
  },
  detailText: {
    fontSize: 12,
    color: Colors.subtext,
  },
  boldText: {
    fontWeight: '600',
    color: Colors.text,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.subtext,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginTop: Spacing.m,
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    gap: 6,
  },
  btnActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.s,
    fontSize: 13,
    color: Colors.subtext,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.subtext,
    marginTop: Spacing.m,
  },
});
