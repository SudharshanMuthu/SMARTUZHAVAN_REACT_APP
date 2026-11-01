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
import { FarmToolProduct } from '../../types/farmtools';
import { fetchFarmTools } from '../../services/farmToolsService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolCompare'>;

export const ToolCompareScreen: React.FC<Props> = ({ route, navigation }) => {
  const { toolIds: initialIds } = route.params;
  const [toolIds, setToolIds] = useState<string[]>(initialIds || []);
  const [tools, setTools] = useState<FarmToolProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTools();
  }, [toolIds]);

  const loadTools = async () => {
    setLoading(true);
    try {
      const all = await fetchFarmTools('all');
      const filtered = all.filter((t) => toolIds.includes(t.id));
      setTools(filtered);
    } catch (err) {
      console.warn('[ToolCompare] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeTool = (id: string) => {
    setToolIds((prev) => prev.filter((item) => item !== id));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Building equipment comparison matrix...</Text>
      </View>
    );
  }

  if (tools.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="scale-balance" size={60} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No Equipment Selected</Text>
        <Text style={styles.emptySub}>
          Select at least 2 farm tools or tractor parts from the catalog to compare.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('FarmToolsHome')}
        >
          <Text style={styles.browseBtnText}>Browse Farm Tools</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const CRITERIA = [
    {
      key: 'brand',
      label: 'Brand / OEM',
      render: (t: FarmToolProduct) => t.brand || 'N/A',
    },
    {
      key: 'subCategory',
      label: 'Classification',
      render: (t: FarmToolProduct) => t.subCategory || 'N/A',
    },
    {
      key: 'price',
      label: 'Direct Price (₹)',
      render: (t: FarmToolProduct) => `₹${t.price.toFixed(2)}`,
    },
    {
      key: 'quantityOrSize',
      label: 'Size / Weight / Capacity',
      render: (t: FarmToolProduct) => t.quantityOrSize || 'N/A',
    },
    {
      key: 'unitPrice',
      label: 'Unit Economics',
      render: (t: FarmToolProduct) => t.unitPrice || 'N/A',
    },
    {
      key: 'tractorCompatibility',
      label: 'Tractor Compatibility',
      render: (t: FarmToolProduct) => {
        if (!t.isTractorPart) return 'N/A (Not a Tractor Part)';
        if (t.isCompatibilityVerified) {
          return `✅ Verified OEM: ${t.tractorBrand || ''} (${t.partNumber || ''})`;
        }
        return '⚠️ Compatibility not verified by OEM';
      },
    },
    {
      key: 'warranty',
      label: 'Warranty Coverage',
      render: (t: FarmToolProduct) => t.warranty || 'No Warranty',
    },
    {
      key: 'isGovtSubsidized',
      label: 'Government Subsidy',
      render: (t: FarmToolProduct) =>
        t.isGovtSubsidized ? `✅ Eligible (${t.subsidySchemeName || 'SMAM / PMKSY'})` : '❌ Standard Retail',
    },
    {
      key: 'sellerName',
      label: 'Seller & Location',
      render: (t: FarmToolProduct) => `${t.sellerName} (${t.location})`,
    },
    {
      key: 'availability',
      label: 'Stock Availability',
      render: (t: FarmToolProduct) => (t.availability === 'in_stock' ? 'In Stock' : 'Limited Stock'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Equipment Comparison Matrix</Text>
          <Text style={styles.headerSub}>
            Comparing {tools.length} of 4 items side-by-side
          </Text>
        </View>

        {tools.length < 4 && (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => navigation.navigate('FarmToolsHome')}
          >
            <MaterialCommunityIcons name="plus" size={16} color={Colors.primary} />
            <Text style={styles.addMoreText}>Add More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll Matrix */}
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.matrixContainer}>
        {/* Specification Labels Column */}
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
        {tools.map((prod) => (
          <View key={prod.id} style={styles.productColumn}>
            <View style={styles.productHeaderCell}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeTool(prod.id)}>
                <MaterialCommunityIcons name="close" size={16} color="#757575" />
              </TouchableOpacity>
              <Text style={styles.productColumnTitle} numberOfLines={2}>
                {prod.name}
              </Text>
              <Text style={styles.productColumnPrice}>₹{prod.price.toFixed(2)}</Text>
            </View>

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
    width: 155,
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
    height: 75,
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
    width: 195,
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
    height: 75,
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
