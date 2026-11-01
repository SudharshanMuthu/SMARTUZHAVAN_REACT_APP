import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { AgriShop, SellerType } from '../../types/agristore';
import { fetchNearbyShops } from '../../services/agriStoreService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyShops'>;

const DISTRICTS = [
  'All',
  'Trichy',
  'Thanjavur',
  'Madurai',
  'Erode',
  'Salem',
  'Coimbatore',
  'Chennai',
];

export const NearbyShopsScreen: React.FC<Props> = ({ route }) => {
  const initialDistrict = route.params?.selectedDistrict || 'All';
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [shops, setShops] = useState<AgriShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    requestGpsAndLoad();
  }, [selectedDistrict]);

  const requestGpsAndLoad = async () => {
    setLoading(true);
    let coords: { latitude: number; longitude: number } | undefined = undefined;

    try {
      setGpsStatus('requesting');
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setGpsStatus('granted');
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserCoords(coords);
      } else {
        setGpsStatus('denied');
      }
    } catch (gpsErr) {
      console.warn('[NearbyShops] GPS lookup failed or simulated, falling back to manual district:', gpsErr);
      setGpsStatus('denied');
    }

    try {
      const data = await fetchNearbyShops(selectedDistrict, coords);
      setShops(data);
    } catch (err) {
      console.warn('[NearbyShops] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Unable to Call', `Please dial ${phone} directly on your device.`);
    });
  };

  const handleDirections = (shop: AgriShop) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to Open Maps', `Address: ${shop.address}`);
    });
  };

  const getSellerBadge = (type: SellerType) => {
    switch (type) {
      case 'cooperative':
        return { label: 'PACCS Cooperative Depot', bg: '#E8F5E9', text: '#2E7D32', icon: 'account-group' as const };
      case 'government_depot':
        return { label: 'Govt Extension Center', bg: '#E3F2FD', text: '#1565C0', icon: 'bank' as const };
      case 'authorized_dealer':
        return { label: 'Authorized Input Dealer', bg: '#FFF3E0', text: '#E65100', icon: 'check-decagram' as const };
      default:
        return { label: 'Agri Store', bg: '#F5F5F5', text: '#616161', icon: 'storefront' as const };
    }
  };

  return (
    <View style={styles.container}>
      {/* GPS Status Banner */}
      <View style={[styles.gpsBanner, gpsStatus === 'granted' ? styles.gpsBannerActive : styles.gpsBannerNotice]}>
        <MaterialCommunityIcons
          name={gpsStatus === 'granted' ? 'crosshairs-gps' : 'map-marker-question-outline'}
          size={18}
          color={gpsStatus === 'granted' ? '#2E7D32' : '#E65100'}
        />
        <Text style={styles.gpsBannerText}>
          {gpsStatus === 'granted'
            ? 'Live GPS enabled: Depots sorted by closest distance to your farm.'
            : 'GPS location not active. Displaying certified input depots for selected district.'}
        </Text>
      </View>

      {/* District Selector Chips */}
      <View style={styles.districtContainer}>
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
                  {item === 'All' ? 'All Tamil Nadu' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Shop Cards List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Locating certified agricultural input depots...</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="storefront-remove" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Depots Listed</Text>
              <Text style={styles.emptySub}>
                No verified agricultural depots registered in {selectedDistrict} district yet.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getSellerBadge(item.type);

            return (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                    <MaterialCommunityIcons name={badge.icon} size={14} color={badge.text} />
                    <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>

                  {item.distanceKm !== undefined && (
                    <View style={styles.distanceBadge}>
                      <MaterialCommunityIcons name="navigation" size={12} color="#1565C0" />
                      <Text style={styles.distanceText}>{item.distanceKm} km away</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.shopName}>{item.name}</Text>
                <Text style={styles.shopNameTa}>{item.nameTa}</Text>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>{item.address}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>{item.timing}</Text>
                </View>

                {/* Subsidized stock status */}
                <View style={styles.stockRow}>
                  <View style={styles.stockItem}>
                    <MaterialCommunityIcons
                      name={item.subsidizedUreaAvailable ? 'check-circle' : 'close-circle'}
                      size={16}
                      color={item.subsidizedUreaAvailable ? '#2E7D32' : '#C62828'}
                    />
                    <Text style={styles.stockText}>
                      Urea (₹266.50): {item.subsidizedUreaAvailable ? 'In Stock' : 'Awaiting Quota'}
                    </Text>
                  </View>

                  <View style={styles.stockItem}>
                    <MaterialCommunityIcons
                      name={item.subsidizedDapAvailable ? 'check-circle' : 'close-circle'}
                      size={16}
                      color={item.subsidizedDapAvailable ? '#2E7D32' : '#C62828'}
                    />
                    <Text style={styles.stockText}>
                      DAP (₹1350): {item.subsidizedDapAvailable ? 'In Stock' : 'Awaiting Quota'}
                    </Text>
                  </View>
                </View>

                {/* Authorized brands */}
                <View style={styles.brandsRow}>
                  <Text style={styles.brandsLabel}>Authorized:</Text>
                  {item.authorizedBrands.map((brand, i) => (
                    <View key={i} style={styles.brandChip}>
                      <Text style={styles.brandChipText}>{brand}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(item.phone)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="phone" size={16} color={Colors.primary} />
                    <Text style={styles.callBtnText}>Call Depot ({item.phone})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => handleDirections(item)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="directions" size={16} color={Colors.white} />
                    <Text style={styles.directionsBtnText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  gpsBannerActive: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#C8E6C9',
  },
  gpsBannerNotice: {
    backgroundColor: '#FFF3E0',
    borderBottomColor: '#FFE0B2',
  },
  gpsBannerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textPrimary,
    lineHeight: 15,
  },
  districtContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  districtList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  districtChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  districtText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  districtTextActive: {
    color: Colors.white,
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  shopNameTa: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
    marginBottom: 8,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  stockRow: {
    backgroundColor: '#FAFAFA',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  brandsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  brandsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  brandChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  callBtn: {
    flex: 1.2,
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
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  directionsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
});
