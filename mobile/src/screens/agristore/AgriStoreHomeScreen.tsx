import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { AgriProduct, AgriCategory, ToxicityBand } from '../../types/agristore';
import { fetchAgriProducts } from '../../services/agriStoreService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgriStoreHome'>;

interface CategoryTab {
  id: AgriCategory;
  label: string;
  labelTa: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All Inputs', labelTa: 'அனைத்தும்', icon: 'view-grid-outline' },
  { id: 'fertilizer', label: 'Fertilizers', labelTa: 'இரசாயன உரம்', icon: 'sack' },
  { id: 'organic', label: 'Organic & Bio', labelTa: 'இயற்கை உரம்', icon: 'leaf' },
  { id: 'crop_protection', label: 'Crop Protection', labelTa: 'பூச்சி & நோய்', icon: 'shield-bug-outline' },
  { id: 'crop_care', label: 'Crop-Care', labelTa: 'ஊக்கிகள்', icon: 'bottle-tonic-plus-outline' },
  { id: 'seeds', label: 'Certified Seeds', labelTa: 'சான்று விதைகள்', icon: 'seed-outline' },
];

export const AgriStoreHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<AgriCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<AgriProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isTamil, setIsTamil] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAgriProducts(selectedCategory, searchQuery);
      setProducts(data);
    } catch (err) {
      console.warn('[AgriStoreHome] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const toggleCompare = (productId: string) => {
    if (compareList.includes(productId)) {
      setCompareList((prev) => prev.filter((id) => id !== productId));
    } else {
      if (compareList.length >= 4) {
        Alert.alert(
          'Comparison Limit Reached',
          'You can compare up to 4 agricultural products at a time.'
        );
        return;
      }
      setCompareList((prev) => [...prev, productId]);
    }
  };

  const getToxicityIndicator = (band: ToxicityBand) => {
    switch (band) {
      case 'green':
        return { color: '#2E7D32', label: 'Slightly Toxic (Caution)', icon: 'shield-check-outline' as const };
      case 'blue':
        return { color: '#1565C0', label: 'Moderately Toxic (Danger)', icon: 'alert-circle-outline' as const };
      case 'yellow':
        return { color: '#F57F17', label: 'Highly Toxic (Poison)', icon: 'alert-octagon-outline' as const };
      case 'red':
        return { color: '#C62828', label: 'Extremely Toxic (Poison)', icon: 'skull-outline' as const };
      case 'bio':
        return { color: '#2E7D32', label: '100% Bio-Organic Safe', icon: 'leaf' as const };
      default:
        return null;
    }
  };

  const renderProductItem = ({ item }: { item: AgriProduct }) => {
    const isCompared = compareList.includes(item.id);
    const toxicity = getToxicityIndicator(item.toxicityBand);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{item.brand}</Text>
          </View>
          {item.isSubsidized && (
            <View style={styles.subsidizedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={12} color="#1B5E20" />
              <Text style={styles.subsidizedText}>Govt FCO Subsidized</Text>
            </View>
          )}
        </View>

        <Text style={styles.productName}>{isTamil ? item.nameTa : item.name}</Text>
        <Text style={styles.subCategory}>{item.subCategory}</Text>

        {toxicity && (
          <View style={[styles.toxicityRow, { borderColor: toxicity.color }]}>
            <MaterialCommunityIcons name={toxicity.icon} size={14} color={toxicity.color} />
            <Text style={[styles.toxicityText, { color: toxicity.color }]}>
              {toxicity.label}
            </Text>
          </View>
        )}

        <View style={styles.specRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
            <Text style={styles.packSizeText}>/ {item.packSize}</Text>
          </View>
          <View style={styles.unitCostBadge}>
            <Text style={styles.unitCostText}>{item.unitPrice}</Text>
          </View>
        </View>

        <View style={styles.sellerRow}>
          <MaterialCommunityIcons name="store-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.sellerText} numberOfLines={1}>
            {item.sellerName}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.compareBtn, isCompared && styles.compareBtnActive]}
            onPress={() => toggleCompare(item.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isCompared ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={18}
              color={isCompared ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.compareBtnText, isCompared && styles.compareBtnTextActive]}>
              {isCompared ? 'Comparing' : 'Compare'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('AgriProductDetail', { productId: item.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View Specs</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar & District Link */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search urea, DAP, coragen, seeds, brands..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadProducts();
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.nearbyShopsPill}
            onPress={() => navigation.navigate('NearbyShops', { selectedDistrict: 'All' })}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#1565C0" />
            <Text style={styles.nearbyShopsText}>Find Nearby PACCS & Agri Depots</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#1565C0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setIsTamil((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>{isTamil ? 'ENG' : 'தமிழ்'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subsidized Fertilizer Statutory Notice */}
      <View style={styles.statutoryBanner}>
        <MaterialCommunityIcons name="shield-check" size={18} color="#2E7D32" />
        <Text style={styles.statutoryText}>
          {isTamil
            ? 'அரசு மானிய உரம் (யூரியா ₹266.50, DAP ₹1350) கூட்டுறவு சங்கங்களில் ஆதார் மூலம் பெறலாம்.'
            : 'Statutory FCO Subsidized Fertilizers (Urea ₹266.50 / DAP ₹1350) available at certified PACCS depots.'}
        </Text>
      </View>

      {/* Categories Horizontal Selector */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={16}
                  color={isSelected ? Colors.white : Colors.textPrimary}
                />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {isTamil ? item.labelTa : item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching certified agricultural inputs...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant-closed" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or selecting a different category.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Compare Action Bar */}
      {compareList.length > 0 && (
        <View style={styles.compareBar}>
          <View style={styles.compareInfo}>
            <View style={styles.compareCountBadge}>
              <Text style={styles.compareCountText}>{compareList.length}</Text>
            </View>
            <Text style={styles.compareBarLabel}>
              {compareList.length === 1
                ? 'Select 1 more to compare'
                : `${compareList.length} products selected`}
            </Text>
          </View>

          <View style={styles.compareActions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setCompareList([])}
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.compareSubmitBtn,
                compareList.length < 2 && styles.btnDisabled,
              ]}
              disabled={compareList.length < 2}
              onPress={() =>
                navigation.navigate('ProductCompare', { productIds: compareList })
              }
            >
              <MaterialCommunityIcons name="scale-balance" size={18} color={Colors.white} />
              <Text style={styles.compareSubmitText}>Compare Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  nearbyShopsPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  nearbyShopsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565C0',
    flex: 1,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  statutoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
    gap: 8,
  },
  statutoryText: {
    flex: 1,
    fontSize: 11,
    color: '#2E7D32',
    lineHeight: 15,
    fontWeight: '500',
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
  loadingContainer: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  subsidizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  subsidizedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  subCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  toxicityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  toxicityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  packSizeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  unitCostBadge: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  unitCostText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  sellerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  compareBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  compareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  compareBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailsBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // Floating Compare Action Bar
  compareBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  compareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareCountBadge: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  compareBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  compareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  compareSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  compareSubmitText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
