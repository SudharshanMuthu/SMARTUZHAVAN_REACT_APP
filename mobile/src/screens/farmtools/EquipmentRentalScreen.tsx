import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { MachineryRentalItem, EquipmentType } from '../../types/farmtools';
import {
  fetchMachineryRentals,
  submitRentalBooking,
} from '../../services/farmToolsService';
import { useAuth } from '../../context/AuthContext';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentRental'>;

const DISTRICTS = ['All', 'Trichy', 'Thanjavur', 'Madurai', 'Erode', 'Coimbatore', 'Salem'];

const EQUIPMENT_TYPES: { id: EquipmentType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'all', label: 'All Equipment', icon: 'view-grid-outline' },
  { id: 'tractor', label: 'Tractor + Rotavator', icon: 'tractor' },
  { id: 'harvester', label: 'Combined Harvester', icon: 'grain' },
  { id: 'rotavator', label: 'Rotavators', icon: 'cog-outline' },
  { id: 'leveler', label: 'Laser Leveler', icon: 'ray-start-arrow' },
  { id: 'power_weeder', label: 'Power Weeder', icon: 'engine-outline' },
];

export const EquipmentRentalScreen: React.FC<Props> = () => {
  const { user } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState<EquipmentType>('all');
  const [rentals, setRentals] = useState<MachineryRentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeRental, setActiveRental] = useState<MachineryRentalItem | null>(null);
  const [requestedDate, setRequestedDate] = useState('2026-11-05');
  const [duration, setDuration] = useState('4 Hours');
  const [farmLocation, setFarmLocation] = useState('');
  const [acreage, setAcreage] = useState('2 Acres');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRentals();
  }, [selectedDistrict, selectedType]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const data = await fetchMachineryRentals(selectedDistrict, selectedType);
      setRentals(data);
    } catch (err) {
      console.warn('[EquipmentRental] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = (rental: MachineryRentalItem) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to submit machinery rental requests.');
      return;
    }
    setActiveRental(rental);
    setFarmLocation('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSubmitBooking = async () => {
    if (!activeRental) return;

    if (!farmLocation.trim()) {
      Alert.alert('Location Required', 'Please specify your farm village or field address.');
      return;
    }

    setSubmitting(true);
    try {
      const docId = await submitRentalBooking({
        rentalId: activeRental.id,
        equipmentTitle: activeRental.title,
        farmerId: user?.uid || '',
        farmerName: user?.displayName || 'Farmer',
        farmerEmail: user?.email || '',
        farmerPhone: user?.phoneNumber || '',
        requestedDate,
        duration,
        farmLocation: farmLocation.trim(),
        acreage: acreage.trim(),
        notes: notes.trim(),
      });

      setModalVisible(false);
      setSubmitting(false);

      Alert.alert(
        'Rental Request Submitted 🚜',
        `Your request #${docId.slice(0, 6)} for "${activeRental.title}" on ${requestedDate} has been sent to ${activeRental.ownerName}.\n\nStatus: Pending Provider Confirmation. The provider will call to confirm dispatch.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      setSubmitting(false);
      showFirestoreErrorAlert('Submission Failed', err, 'Could not submit rental request.');
    }
  };

  const handleCallOwner = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Unable to Call', `Please dial ${phone} directly.`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Info Banner */}
      <View style={styles.infoBanner}>
        <MaterialCommunityIcons name="information" size={18} color="#E65100" />
        <Text style={styles.infoBannerText}>
          Custom Hiring Centre (CHC) Equipment: Pay only upon confirmed field operation.
        </Text>
      </View>

      {/* Equipment Type Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={EQUIPMENT_TYPES}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedType === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedType(item.id)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={16}
                  color={isSelected ? Colors.white : Colors.textPrimary}
                />
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* District Selector Chips */}
      <View style={styles.districtSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DISTRICTS}
          keyExtractor={(d) => d}
          contentContainerStyle={styles.districtList}
          renderItem={({ item }) => {
            const isSelected = selectedDistrict === item;
            return (
              <TouchableOpacity
                style={[styles.districtChip, isSelected && styles.districtChipActive]}
                onPress={() => setSelectedDistrict(item)}
              >
                <Text style={[styles.districtText, isSelected && styles.districtTextActive]}>
                  {item === 'All' ? 'All Districts' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Rentals List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Locating available machinery in your district...</Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="tractor" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Machinery Available</Text>
              <Text style={styles.emptySub}>
                No verified custom hiring providers registered in {selectedDistrict} for this category.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.providerBadge}>
                  <MaterialCommunityIcons name="account-group" size={14} color="#1565C0" />
                  <Text style={styles.providerText}>{item.ownerName}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#2E7D32" />
                  <Text style={styles.statusText}>Verified CHC</Text>
                </View>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.titleTa}>{item.titleTa}</Text>

              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>
                  {item.location} ({item.district} District)
                </Text>
              </View>

              {/* Rate & Inclusion Badges */}
              <View style={styles.rateCard}>
                <View style={styles.rateMainRow}>
                  <Text style={styles.rateLabel}>Hiring Tariff:</Text>
                  <Text style={styles.rateValue}>{item.rateDisplay}</Text>
                </View>

                <View style={styles.inclusionsRow}>
                  <View style={styles.inclusionBadge}>
                    <MaterialCommunityIcons
                      name={item.operatorIncluded ? 'check-bold' : 'close'}
                      size={12}
                      color={item.operatorIncluded ? '#2E7D32' : '#757575'}
                    />
                    <Text style={styles.inclusionText}>Operator Included</Text>
                  </View>

                  <View style={styles.inclusionBadge}>
                    <MaterialCommunityIcons
                      name={item.fuelIncluded ? 'check-bold' : 'close'}
                      size={12}
                      color={item.fuelIncluded ? '#2E7D32' : '#757575'}
                    />
                    <Text style={styles.inclusionText}>Diesel in Tariff</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.specsText}>{item.specifications}</Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallOwner(item.ownerPhone)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="phone" size={16} color={Colors.primary} />
                  <Text style={styles.callBtnText}>Call Provider</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => handleOpenBookingModal(item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="calendar-plus" size={16} color={Colors.white} />
                  <Text style={styles.requestBtnText}>Request Rental</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Rental Booking Request Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Request Machinery Rental</Text>
                <Text style={styles.modalSub}>{activeRental?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Tariff Card */}
              <View style={styles.tariffBanner}>
                <Text style={styles.tariffLabel}>Selected Tariff:</Text>
                <Text style={styles.tariffValue}>{activeRental?.rateDisplay}</Text>
              </View>

              {/* Date Input */}
              <Text style={styles.inputLabel}>Requested Operation Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={requestedDate}
                onChangeText={setRequestedDate}
                placeholder="e.g. 2026-11-05"
              />

              {/* Duration Options */}
              <Text style={styles.inputLabel}>Estimated Operation Duration</Text>
              <View style={styles.chipsRow}>
                {['2 Hours', '4 Hours', '8 Hours / 1 Day', '2 Days', '3+ Days'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chipOption, duration === d && styles.chipOptionActive]}
                    onPress={() => setDuration(d)}
                  >
                    <Text
                      style={[
                        styles.chipOptionText,
                        duration === d && styles.chipOptionTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Farm Location */}
              <Text style={styles.inputLabel}>Farm Address / Village Name *</Text>
              <TextInput
                style={styles.textInput}
                value={farmLocation}
                onChangeText={setFarmLocation}
                placeholder="e.g. Melur Village, Lalgudi Taluk"
              />

              {/* Field Acreage */}
              <Text style={styles.inputLabel}>Field Area / Acreage to be worked</Text>
              <View style={styles.chipsRow}>
                {['1 Acre', '2 Acres', '3-5 Acres', '5+ Acres'].map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chipOption, acreage === a && styles.chipOptionActive]}
                    onPress={() => setAcreage(a)}
                  >
                    <Text
                      style={[
                        styles.chipOptionText,
                        acreage === a && styles.chipOptionTextActive,
                      ]}
                    >
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Special Instructions / Notes */}
              <Text style={styles.inputLabel}>Field Notes / Soil Condition (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Wet clay soil; cage wheels required for paddy field."
                multiline
                numberOfLines={2}
              />

              {/* Terms Warning */}
              <View style={styles.termsBox}>
                <MaterialCommunityIcons name="shield-alert-outline" size={16} color="#00796B" />
                <Text style={styles.termsText}>
                  Your booking request is logged directly in Cloud Firestore. The custom hiring provider will inspect field access and confirm the schedule.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleSubmitBooking}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={18} color={Colors.white} />
                    <Text style={styles.submitBtnText}>Submit Rental Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#E65100',
    fontWeight: '600',
    lineHeight: 15,
  },
  filterSection: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  districtSection: {
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  districtList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  districtChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  districtText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  districtTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  providerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  titleTa: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
    marginBottom: 6,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rateCard: {
    backgroundColor: '#F9FBE7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6EE9C',
    marginBottom: 10,
  },
  rateMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rateLabel: {
    fontSize: 12,
    color: '#33691E',
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B5E20',
  },
  inclusionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  inclusionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inclusionText: {
    fontSize: 11,
    color: '#558B2F',
    fontWeight: '600',
  },
  specsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  requestBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  requestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: Spacing.md,
    paddingBottom: 30,
  },
  tariffBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  tariffLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tariffValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B5E20',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  chipOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipOptionTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F2F1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: '#004D40',
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
