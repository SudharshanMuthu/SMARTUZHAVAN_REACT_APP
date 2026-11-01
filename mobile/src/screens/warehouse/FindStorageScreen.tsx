import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Warehouse } from '../../types/warehouse';
import {
  subscribeToWarehouses,
  createWarehouseBooking,
} from '../../services/warehouseService';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FindStorageScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Booking Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [days, setDays] = useState<number>(7);

  // Map simulation toggle
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const unsub = subscribeToWarehouses(
      (data) => {
        setWarehouses(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching warehouses:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredWarehouses = warehouses.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.warehouseName.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q)
    );
  });

  const handleOpenBooking = (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setQuantity(1);
    setDays(7);
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedWarehouse) return;
    if (quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a quantity greater than 0.');
      return;
    }
    if (quantity > selectedWarehouse.availableSpace && selectedWarehouse.availableSpace > 0) {
      Alert.alert(
        'Exceeds Capacity',
        `Available capacity is only ${selectedWarehouse.availableSpace} Tons.`
      );
      return;
    }

    try {
      setSubmitting(true);
      await createWarehouseBooking({
        warehouseId: selectedWarehouse.id,
        ownerId: selectedWarehouse.ownerId,
        quantity,
        days,
        warehouseName: selectedWarehouse.warehouseName,
        location: selectedWarehouse.location,
      });

      setSubmitting(false);
      setModalVisible(false);
      Alert.alert(
        'Booking Requested',
        'Your storage booking request was sent to the warehouse owner. You can track status in My Bookings.',
        [
          {
            text: 'View My Bookings',
            onPress: () => navigation.navigate('FarmerStorageBookings'),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      setSubmitting(false);
      showFirestoreErrorAlert('Booking Error', err, 'Failed to submit booking.');
    }
  };

  const calculatedTotal = selectedWarehouse
    ? selectedWarehouse.ratePerDay * quantity * days
    : 0;

  return (
    <View style={styles.container}>
      {/* Header bar actions */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search warehouse or district..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.viewToggleBtn}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <MaterialCommunityIcons
            name={viewMode === 'list' ? 'map-marker-radius' : 'format-list-bulleted'}
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.myBookingsHeaderBtn}
          onPress={() => navigation.navigate('FarmerStorageBookings')}
        >
          <MaterialCommunityIcons name="clipboard-text-clock" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Map simulation view */}
      {viewMode === 'map' ? (
        <View style={styles.mapSimContainer}>
          <View style={styles.mapHeader}>
            <MaterialCommunityIcons name="map" size={24} color={Colors.primary} />
            <Text style={styles.mapTitle}>Tamil Nadu Storage Facilities</Text>
          </View>
          <Text style={styles.mapSubtitle}>
            Showing GPS facility nodes across agricultural corridors. Tap any facility to reserve.
          </Text>

          <ScrollView style={styles.mapNodeList}>
            {filteredWarehouses.map((wh) => (
              <TouchableOpacity
                key={wh.id}
                style={styles.mapMarkerCard}
                onPress={() => handleOpenBooking(wh)}
                activeOpacity={0.8}
              >
                <View style={styles.markerPin}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#D32F2F" />
                </View>
                <View style={styles.markerInfo}>
                  <Text style={styles.markerName}>{wh.warehouseName}</Text>
                  <Text style={styles.markerCoords}>
                    {wh.location} • Lat: {wh.latitude.toFixed(2)}, Lng: {wh.longitude.toFixed(2)}
                  </Text>
                  <View style={styles.markerBadges}>
                    <Text style={styles.badgeTextGreen}>
                      {wh.availableSpace} T Available
                    </Text>
                    <Text style={styles.badgeTextRate}>₹{wh.ratePerDay}/day</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        /* List view */
        <FlatList
          data={filteredWarehouses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {}}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="warehouse" size={64} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No Warehouses Found</Text>
                <Text style={styles.emptySub}>
                  No cold storage facilities matched your search. Check back soon or try another location.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="warehouse" size={26} color="#6A1B9A" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.warehouseName}>{item.warehouseName}</Text>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={15} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                  {item.isDemo && <DemoDataBadge isDemo={true} compact />}
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Capacity</Text>
                  <Text style={styles.metricVal}>{item.capacity} Tons</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Available Space</Text>
                  <Text
                    style={[
                      styles.metricVal,
                      { color: item.availableSpace > 0 ? '#2E7D32' : '#C62828' },
                    ]}
                  >
                    {item.availableSpace} Tons
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Daily Rate</Text>
                  <Text style={[styles.metricVal, { color: Colors.primary }]}>
                    ₹{item.ratePerDay}/T
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[
                    styles.bookButton,
                    item.availableSpace <= 0 && styles.bookButtonDisabled,
                  ]}
                  onPress={() => handleOpenBooking(item)}
                  disabled={item.availableSpace <= 0}
                >
                  <MaterialCommunityIcons name="calendar-check" size={18} color={Colors.white} />
                  <Text style={styles.bookButtonText}>
                    {item.availableSpace > 0 ? 'Book Storage Slot' : 'Full (No Space)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Booking Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reserve Storage Slot</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedWarehouse?.warehouseName} • {selectedWarehouse?.location}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedWarehouse && (
              <ScrollView style={styles.modalBody}>
                {/* Available Capacity Info */}
                <View style={styles.modalInfoBox}>
                  <MaterialCommunityIcons name="information-outline" size={20} color="#1565C0" />
                  <Text style={styles.modalInfoText}>
                    Available Space: <Text style={{ fontWeight: '700' }}>{selectedWarehouse.availableSpace} Tons</Text> • Rate: ₹{selectedWarehouse.ratePerDay} per ton/day
                  </Text>
                </View>

                {/* Quantity Input */}
                <Text style={styles.fieldLabel}>Quantity to Store (Metric Tons)</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepperInput}
                    keyboardType="numeric"
                    value={String(quantity)}
                    onChangeText={(txt) => setQuantity(Number(txt) || 1)}
                  />
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Days Input */}
                <Text style={styles.fieldLabel}>Duration (Days)</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setDays(Math.max(1, days - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepperInput}
                    keyboardType="numeric"
                    value={String(days)}
                    onChangeText={(txt) => setDays(Number(txt) || 1)}
                  />
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setDays(days + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Price Breakdown */}
                <View style={styles.priceSummaryBox}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Daily Rate per Ton</Text>
                    <Text style={styles.priceVal}>₹{selectedWarehouse.ratePerDay}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      Calculation ({quantity} Tons × {days} Days)
                    </Text>
                    <Text style={styles.priceVal}>
                      ₹{selectedWarehouse.ratePerDay} × {quantity * days}
                    </Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.totalPriceLabel}>Total Estimated Price</Text>
                    <Text style={styles.totalPriceVal}>₹{calculatedTotal}</Text>
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleConfirmBooking}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check" size={20} color={Colors.white} />
                      <Text style={styles.confirmBtnText}>Submit Booking Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: Spacing.s,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.xs,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  viewToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.s,
  },
  myBookingsHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  cardHeaderText: {
    flex: 1,
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FBE7',
    borderRadius: 8,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.s,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardFooter: {
    marginTop: Spacing.m,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  bookButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  mapSimContainer: {
    flex: 1,
    padding: Spacing.m,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: Spacing.xs,
  },
  mapNodeList: {
    marginTop: Spacing.s,
  },
  mapMarkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.m,
    marginBottom: Spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  markerPin: {
    marginRight: Spacing.s,
  },
  markerInfo: {
    flex: 1,
  },
  markerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markerCoords: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  markerBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  badgeTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextRate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: Spacing.l,
  },
  emptyTitle: {
    fontSize: 17,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: Spacing.m,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCCCCC',
    alignSelf: 'center',
    marginBottom: Spacing.s,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: Spacing.s,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    paddingVertical: Spacing.m,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: Spacing.s,
    borderRadius: 8,
    gap: 8,
    marginBottom: Spacing.m,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#0D47A1',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginHorizontal: Spacing.s,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceSummaryBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: Spacing.m,
    marginVertical: Spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 6,
  },
  totalPriceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalPriceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.l,
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
