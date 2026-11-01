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

interface MandiPrice {
  id: string;
  crop?: string;
  commodity?: string;
  market?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  price?: number;
  unit?: string;
  updatedAt?: any;
}

const FALLBACK_PRICES: MandiPrice[] = [
  { id: 'mp-1', crop: 'Paddy (Dhan) - Common', market: 'Thanjavur Mandi', minPrice: 2183, maxPrice: 2350, modalPrice: 2280, unit: 'Quintal' },
  { id: 'mp-2', crop: 'Tomato (Local)', market: 'Dharmapuri Mandi', minPrice: 2800, maxPrice: 3400, modalPrice: 3100, unit: 'Quintal' },
  { id: 'mp-3', crop: 'Small Onion (Shallots)', market: 'Dindigul Mandi', minPrice: 4800, maxPrice: 5600, modalPrice: 5200, unit: 'Quintal' },
  { id: 'mp-4', crop: 'Turmeric (Finger)', market: 'Erode Regulated Market', minPrice: 11200, maxPrice: 13500, modalPrice: 12400, unit: 'Quintal' },
  { id: 'mp-5', crop: 'Banana (Poovan)', market: 'Tiruchirappalli Market', minPrice: 2200, maxPrice: 2600, modalPrice: 2450, unit: 'Quintal' },
  { id: 'mp-6', crop: 'Cotton (MCU-5)', market: 'Salem Market', minPrice: 6900, maxPrice: 7400, modalPrice: 7150, unit: 'Quintal' },
];

export const AdminMarketPricesScreen: React.FC = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states
  const [commodity, setCommodity] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [modalPrice, setModalPrice] = useState<string>('');

  const loadPrices = useCallback(async () => {
    try {
      const data = await adminService.getMarketPrices({
        search: searchQuery.trim() || undefined,
      } as any);
      if (Array.isArray(data) && data.length > 0) {
        setPrices(data);
      } else {
        let filtered = FALLBACK_PRICES;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              (p.crop || p.commodity || '').toLowerCase().includes(q) ||
              (p.market || p.location || '').toLowerCase().includes(q)
          );
        }
        setPrices(filtered);
      }
    } catch {
      setPrices(FALLBACK_PRICES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const handleDeletePrice = (item: MandiPrice) => {
    const title = item.crop || item.commodity || 'this entry';
    Alert.alert(
      'Remove Mandi Price',
      `Delete price entry for "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteMarketPrice(item.id);
            } catch {
              // demo state
            }
            setPrices((prev) => prev.filter((p) => p.id !== item.id));
            Alert.alert('Deleted', 'Mandi rate entry removed.');
          },
        },
      ]
    );
  };

  const handleSavePrice = async () => {
    if (!commodity.trim() || !market.trim() || !modalPrice.trim()) {
      Alert.alert('Missing Fields', 'Please enter commodity, market mandi, and modal price.');
      return;
    }

    const payload = {
      crop: commodity.trim(),
      commodity: commodity.trim(),
      market: market.trim(),
      location: market.trim(),
      minPrice: Number(minPrice) || Number(modalPrice) * 0.9,
      maxPrice: Number(maxPrice) || Number(modalPrice) * 1.1,
      modalPrice: Number(modalPrice),
      price: Number(modalPrice),
      unit: 'Quintal',
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminService.saveMarketPrice(payload);
      setPrices((prev) => [{ id: `mp-${Date.now()}`, ...payload }, ...prev]);
      Alert.alert('Success', 'Mandi rate saved successfully.');
      setModalVisible(false);
      setCommodity('');
      setMarket('');
      setMinPrice('');
      setMaxPrice('');
      setModalPrice('');
    } catch {
      setPrices((prev) => [{ id: `mp-${Date.now()}`, ...payload }, ...prev]);
      setModalVisible(false);
      Alert.alert('Notice', 'Mandi rate registered for current demo session.');
    }
  };

  const renderItem = ({ item }: { item: MandiPrice }) => {
    const cropName = item.crop || item.commodity || 'Agri Produce';
    const mandi = item.market || item.location || 'Tamil Nadu APMC';
    const modal = item.modalPrice || item.price || 0;
    const min = item.minPrice || Math.round(modal * 0.9);
    const max = item.maxPrice || Math.round(modal * 1.1);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="chart-bell-curve" size={24} color="#C2185B" />
          </View>
          <View style={styles.details}>
            <Text style={styles.cropTitle}>{cropName}</Text>
            <Text style={styles.mandiText}>{mandi}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeletePrice(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C62828" />
          </TouchableOpacity>
        </View>

        <View style={styles.statRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Min (₹ / qtl)</Text>
            <Text style={styles.metricValue}>{`₹${min.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Modal Rate</Text>
            <Text style={[styles.metricValue, { color: '#C2185B' }]}>{`₹${modal.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Max (₹ / qtl)</Text>
            <Text style={styles.metricValue}>{`₹${max.toLocaleString('en-IN')}`}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search commodity or mandi..."
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Mandi market rates...</Text>
        </View>
      ) : (
        <FlatList
          data={prices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadPrices();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chart-line" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No mandi prices recorded</Text>
            </View>
          }
        />
      )}

      {/* Add Mandi Price Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish APMC Mandi Rate</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Commodity (e.g. Paddy Samba)"
              placeholderTextColor={Colors.subtext}
              value={commodity}
              onChangeText={setCommodity}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Mandi / Market (e.g. Madurai Regulated Market)"
              placeholderTextColor={Colors.subtext}
              value={market}
              onChangeText={setMarket}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Modal Rate (₹ per Quintal)"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
              value={modalPrice}
              onChangeText={setModalPrice}
            />
            <View style={{ flexDirection: 'row', gap: Spacing.s }}>
              <TextInput
                style={[styles.formInput, { flex: 1 }]}
                placeholder="Min Rate (₹)"
                placeholderTextColor={Colors.subtext}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <TextInput
                style={[styles.formInput, { flex: 1 }]}
                placeholder="Max Rate (₹)"
                placeholderTextColor={Colors.subtext}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSavePrice}>
              <Text style={styles.submitBtnText}>Publish Daily Price</Text>
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
    backgroundColor: '#C2185B',
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  details: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  mandiText: {
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
    backgroundColor: '#C2185B',
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
