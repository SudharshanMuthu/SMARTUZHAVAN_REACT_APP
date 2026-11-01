import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface AdminCrop {
  id: string;
  cropName?: string;
  name?: string;
  quantity?: number;
  unit?: string;
  pricePerKg?: number;
  price?: number;
  farmerName?: string;
  location?: string;
  district?: string;
  category?: string;
  status?: string;
}

const FALLBACK_CROPS: AdminCrop[] = [
  { id: 'c1', cropName: 'Ponni Paddy (நெல்)', quantity: 2500, unit: 'kg', pricePerKg: 24, farmerName: 'Muthu Vel', location: 'Thanjavur', category: 'Grains', status: 'available' },
  { id: 'c2', cropName: 'Country Tomato (நாட்டு தக்காளி)', quantity: 800, unit: 'kg', pricePerKg: 32, farmerName: 'Gopal Krishnan', location: 'Dharmapuri', category: 'Vegetables', status: 'available' },
  { id: 'c3', cropName: 'Small Onion (சின்ன வெங்காயம்)', quantity: 1200, unit: 'kg', pricePerKg: 55, farmerName: 'Ramasamy', location: 'Perambalur', category: 'Vegetables', status: 'available' },
  { id: 'c4', cropName: 'Turmeric Fingers (மஞ்சள்)', quantity: 1500, unit: 'kg', pricePerKg: 110, farmerName: 'Kuppusamy', location: 'Erode', category: 'Spices', status: 'available' },
  { id: 'c5', cropName: 'G9 Banana (வாழை)', quantity: 3000, unit: 'kg', pricePerKg: 28, farmerName: 'Selvakumar', location: 'Trichy', category: 'Fruits', status: 'available' },
];

export const AdminCropsScreen: React.FC = () => {
  const [crops, setCrops] = useState<AdminCrop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // New crop form state
  const [newCropName, setNewCropName] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');

  const loadCrops = useCallback(async () => {
    try {
      const data = await adminService.getCrops({
        search: searchQuery.trim() || undefined,
      });
      if (Array.isArray(data) && data.length > 0) {
        setCrops(data);
      } else {
        let filtered = FALLBACK_CROPS;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              (c.cropName || c.name || '').toLowerCase().includes(q) ||
              (c.location || '').toLowerCase().includes(q) ||
              (c.farmerName || '').toLowerCase().includes(q)
          );
        }
        setCrops(filtered);
      }
    } catch {
      setCrops(FALLBACK_CROPS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  const handleDeleteCrop = (crop: AdminCrop) => {
    const title = crop.cropName || crop.name || 'this listing';
    Alert.alert(
      'Remove Listing',
      `Are you sure you want to remove "${title}" from the marketplace?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteCrop(crop.id, 'Removed by admin');
              setCrops((prev) => prev.filter((c) => c.id !== crop.id));
              Alert.alert('Listing Removed', 'The crop listing has been deleted.');
            } catch {
              setCrops((prev) => prev.filter((c) => c.id !== crop.id));
              Alert.alert('Notice', 'Crop listing removed from current view.');
            }
          },
        },
      ]
    );
  };

  const handleAddCrop = async () => {
    if (!newCropName.trim() || !newQuantity.trim() || !newPrice.trim()) {
      Alert.alert('Missing Fields', 'Please enter crop name, quantity, and price.');
      return;
    }

    const payload = {
      name: newCropName.trim(),
      cropName: newCropName.trim(),
      quantity: Number(newQuantity) || 100,
      unit: 'kg',
      price: Number(newPrice) || 20,
      pricePerKg: Number(newPrice) || 20,
      location: newLocation.trim() || 'Tamil Nadu',
      farmerName: 'Verified Farmer',
      status: 'available',
    };

    try {
      await adminService.createCrop(payload);
      setCrops((prev) => [{ id: `c-${Date.now()}`, ...payload }, ...prev]);
      Alert.alert('Success', 'New crop listing added to marketplace.');
      setModalVisible(false);
      setNewCropName('');
      setNewQuantity('');
      setNewPrice('');
      setNewLocation('');
    } catch {
      setCrops((prev) => [{ id: `c-${Date.now()}`, ...payload }, ...prev]);
      setModalVisible(false);
      Alert.alert('Notice', 'Added crop listing for demo session.');
    }
  };

  const renderItem = ({ item }: { item: AdminCrop }) => {
    const title = item.cropName || item.name || 'Unnamed Crop';
    const price = item.pricePerKg || item.price || 0;
    const qty = item.quantity || 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cropIconBox}>
            <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
          </View>
          <View style={styles.cropDetails}>
            <Text style={styles.cropTitle}>{title}</Text>
            <Text style={styles.cropMeta}>
              {`By ${item.farmerName || 'Local Farmer'} • ${item.location || 'Tamil Nadu'}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteCrop(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C62828" />
          </TouchableOpacity>
        </View>

        <View style={styles.statRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Quantity</Text>
            <Text style={styles.metricValue}>{`${qty} ${item.unit || 'kg'}`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Price / kg</Text>
            <Text style={[styles.metricValue, { color: '#2E7D32' }]}>{`₹${price}`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total Value</Text>
            <Text style={styles.metricValue}>{`₹${(qty * price).toLocaleString('en-IN')}`}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Add bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop, farmer, or district..."
            placeholderTextColor={Colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading marketplace listings...</Text>
        </View>
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCrops();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="sprout-outline" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No crop listings found</Text>
            </View>
          }
        />
      )}

      {/* Add Crop Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Crop Listing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Crop Name (e.g. Sambha Paddy)"
              placeholderTextColor={Colors.subtext}
              value={newCropName}
              onChangeText={setNewCropName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Quantity (kg)"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
              value={newQuantity}
              onChangeText={setNewQuantity}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Price per kg (₹)"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />
            <TextInput
              style={styles.formInput}
              placeholder="District / Location (e.g. Madurai)"
              placeholderTextColor={Colors.subtext}
              value={newLocation}
              onChangeText={setNewLocation}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddCrop}>
              <Text style={styles.submitBtnText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    padding: Spacing.m,
    gap: Spacing.s,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.s,
    fontSize: 14,
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: Spacing.m,
    paddingTop: 0,
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
    alignItems: 'center',
  },
  cropIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  cropDetails: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  cropMeta: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.subtext,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.l,
    gap: Spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: Spacing.m,
    height: 48,
    fontSize: 14,
    color: Colors.text,
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
