import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { AgriProduct, ToxicityBand } from '../../types/agristore';
import { fetchAgriProducts } from '../../services/agriStoreService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductCompare'>;

export const ProductCompareScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productIds: initialIds } = route.params;
  const [productIds, setProductIds] = useState<string[]>(initialIds || []);
  const [products, setProducts] = useState<AgriProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [productIds]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const all = await fetchAgriProducts('all');
      const filtered = all.filter((p) => productIds.includes(p.id));
      setProducts(filtered);
    } catch (err) {
      console.warn('[ProductCompare] Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (id: string) => {
    setProductIds((prev) => prev.filter((item) => item !== id));
  };

  const getToxicityLabel = (band: ToxicityBand) => {
    switch (band) {
      case 'green':
        return '🟢 Slightly Toxic (Caution)';
      case 'blue':
        return '🔵 Moderately Toxic (Danger)';
      case 'yellow':
        return '🟡 Highly Toxic (Poison)';
      case 'red':
        return '🔴 Extremely Toxic (Poison)';
      case 'bio':
        return '🍃 100% Bio-Organic Safe';
      case 'none':
        return 'Non-Toxic Fertilizer';
      default:
        return 'Not Specified';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Building comparison matrix...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="scale-balance" size={60} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No Products Selected</Text>
        <Text style={styles.emptySub}>
          Select at least 2 agricultural inputs from the Agri Care Store to compare.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('AgriStoreHome')}
        >
          <Text style={styles.browseBtnText}>Browse Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const CRITERIA = [
    {
      key: 'brand',
      label: 'Brand / Manufacturer',
      render: (p: AgriProduct) => p.brand || 'N/A',
    },
    {
      key: 'subCategory',
      label: 'Class / Sub-Category',
      render: (p: AgriProduct) => p.subCategory || 'N/A',
    },
    {
      key: 'price',
      label: 'Retail Price (₹)',
      render: (p: AgriProduct) => `₹${p.price.toFixed(2)}`,
    },
    {
      key: 'packSize',
      label: 'Package Size',
      render: (p: AgriProduct) => p.packSize || 'N/A',
    },
    {
      key: 'unitPrice',
      label: 'Unit Economics',
      render: (p: AgriProduct) => p.unitPrice || 'N/A',
    },
    {
      key: 'activeIngredients',
      label: 'Active Ingredients',
      render: (p: AgriProduct) => p.activeIngredients || 'Not Specified',
    },
    {
      key: 'toxicityBand',
      label: 'Toxicity Category',
      render: (p: AgriProduct) => getToxicityLabel(p.toxicityBand),
    },
    {
      key: 'waitingPeriodDays',
      label: 'Pre-Harvest Interval (PHI)',
      render: (p: AgriProduct) =>
        p.waitingPeriodDays !== undefined ? `${p.waitingPeriodDays} Days` : 'N/A (Fertilizer)',
    },
    {
      key: 'isSubsidized',
      label: 'Govt Subsidized Rate',
      render: (p: AgriProduct) => (p.isSubsidized ? '✅ Yes (FCO Subsidized)' : '❌ Standard Retail'),
    },
    {
      key: 'targetCrops',
      label: 'Primary Target Crops',
      render: (p: AgriProduct) => (p.targetCrops || []).join(', ') || 'General Agriculture',
    },
    {
      key: 'sellerName',
      label: 'Availability & Seller',
      render: (p: AgriProduct) => p.sellerName || 'Local Cooperative',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Input Comparison Matrix</Text>
          <Text style={styles.headerSub}>
            Comparing {products.length} of 4 agricultural inputs side-by-side
          </Text>
        </View>

        {products.length < 4 && (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => navigation.navigate('AgriStoreHome')}
          >
            <MaterialCommunityIcons name="plus" size={16} color={Colors.primary} />
            <Text style={styles.addMoreText}>Add More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll Comparison Matrix */}
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.matrixContainer}>
        {/* Row Header Column */}
        <View style={styles.labelsColumn}>
          <View style={styles.labelHeaderCell}>
            <Text style={styles.labelHeaderText}>Specification</Text>
          </View>
          {CRITERIA.map((crit) => (
            <View key={crit.key} style={styles.labelCell}>
              <Text style={styles.labelText}>{crit.label}</Text>
            </View>
          ))}
        </View>

        {/* Product Columns */}
        {products.map((prod) => (
          <View key={prod.id} style={styles.productColumn}>
            {/* Header Cell with remove & title */}
            <View style={styles.productHeaderCell}>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeProduct(prod.id)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#757575" />
              </TouchableOpacity>
              <Text style={styles.productColumnTitle} numberOfLines={2}>
                {prod.name}
              </Text>
              <Text style={styles.productColumnPrice}>₹{prod.price.toFixed(2)}</Text>
            </View>

            {/* Value Cells */}
            {CRITERIA.map((crit) => (
              <View key={crit.key} style={styles.valueCell}>
                <Text style={styles.valueText}>{crit.render(prod)}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 260,
  },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  matrixContainer: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  labelsColumn: {
    width: 150,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelHeaderCell: {
    height: 90,
    padding: 10,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#EEEEEE',
    borderTopLeftRadius: 9,
  },
  labelHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  labelCell: {
    height: 70,
    padding: 10,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  productColumn: {
    width: 190,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: Colors.border,
  },
  productHeaderCell: {
    height: 90,
    padding: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FAFDF9',
  },
  removeBtn: {
    alignSelf: 'flex-end',
    padding: 2,
  },
  productColumnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productColumnPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  valueCell: {
    height: 70,
    padding: 10,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  valueText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
});
