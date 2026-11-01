import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { FarmToolProduct } from '../../types/farmtools';
import { fetchFarmToolById } from '../../services/farmToolsService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmToolDetail'>;

export const FarmToolDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { toolId } = route.params;
  const [tool, setTool] = useState<FarmToolProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTamil, setIsTamil] = useState(false);

  useEffect(() => {
    loadToolDetail();
  }, [toolId]);

  const loadToolDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchFarmToolById(toolId);
      setTool(data);
    } catch (err) {
      console.warn('[FarmToolDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallSeller = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Unable to Call', `Please dial ${phone} directly on your device.`);
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading equipment details...</Text>
      </View>
    );
  }

  if (!tool) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color={Colors.error} />
        <Text style={styles.notFoundTitle}>Equipment Not Found</Text>
        <Text style={styles.notFoundSub}>
          The requested farm tool or equipment listing is currently unavailable.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Return to Tools Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.brandRow}>
            <View style={styles.brandPill}>
              <Text style={styles.brandPillText}>{tool.brand}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsTamil((prev) => !prev)}>
              <Text style={styles.langToggleText}>{isTamil ? 'English' : 'தமிழ் வடிவம்'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.toolTitle}>{isTamil ? tool.nameTa : tool.name}</Text>
          <Text style={styles.subCategoryText}>{tool.subCategory}</Text>

          {tool.isGovtSubsidized && (
            <View style={styles.subsidyCard}>
              <MaterialCommunityIcons name="seal" size={18} color="#1B5E20" />
              <View style={styles.subsidyContent}>
                <Text style={styles.subsidyTitle}>Government Mechanization Subsidy</Text>
                <Text style={styles.subsidySub}>
                  {tool.subsidySchemeName || 'Eligible under Agricultural Engineering Department subsidies.'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Pricing & Size Card */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Direct Retail Price</Text>
              <Text style={styles.priceMain}>₹{tool.price.toFixed(2)}</Text>
              {tool.mrp > tool.price && (
                <Text style={styles.mrpText}>MRP: ₹{tool.mrp.toFixed(2)}</Text>
              )}
            </View>
            <View style={styles.sizeBadge}>
              <MaterialCommunityIcons name="weight" size={16} color={Colors.primary} />
              <Text style={styles.sizeBadgeText}>{tool.quantityOrSize}</Text>
            </View>
          </View>

          <View style={styles.unitRow}>
            <Text style={styles.unitLabel}>Unit Economics:</Text>
            <Text style={styles.unitVal}>{tool.unitPrice}</Text>
          </View>

          <View style={styles.sellerRow}>
            <MaterialCommunityIcons name="storefront" size={16} color={Colors.primary} />
            <Text style={styles.sellerText}>
              Supplied by {tool.sellerName} ({tool.location})
            </Text>
          </View>
        </View>

        {/* Tractor Compatibility Section (Requirement B) */}
        {tool.isTractorPart && (
          <View
            style={[
              styles.compatibilityCard,
              tool.isCompatibilityVerified
                ? styles.compatCardVerified
                : styles.compatCardUnverified,
            ]}
          >
            <View style={styles.compatHeader}>
              <MaterialCommunityIcons
                name={tool.isCompatibilityVerified ? 'tractor' : 'alert-circle-outline'}
                size={22}
                color={tool.isCompatibilityVerified ? '#1565C0' : '#E65100'}
              />
              <View style={styles.compatHeaderContent}>
                <Text
                  style={[
                    styles.compatTitle,
                    { color: tool.isCompatibilityVerified ? '#1565C0' : '#E65100' },
                  ]}
                >
                  {tool.isCompatibilityVerified
                    ? 'Verified OEM Tractor Compatibility'
                    : 'Compatibility Not Verified by OEM'}
                </Text>
                <Text style={styles.compatSub}>
                  {tool.isCompatibilityVerified
                    ? 'Engineered to exact OEM factory fit specifications.'
                    : 'Verify mounting and dimensions with a mechanic before installation.'}
                </Text>
              </View>
            </View>

            <View style={styles.compatDetailsGrid}>
              <View style={styles.compatDetailItem}>
                <Text style={styles.compatKey}>Compatible Brand:</Text>
                <Text style={styles.compatVal}>{tool.tractorBrand || 'Universal Fit'}</Text>
              </View>

              <View style={styles.compatDetailItem}>
                <Text style={styles.compatKey}>Supported Models:</Text>
                <Text style={styles.compatVal}>{tool.tractorModel || 'Check dimensions'}</Text>
              </View>

              {tool.partNumber && (
                <View style={styles.compatDetailItem}>
                  <Text style={styles.compatKey}>OEM Part Number:</Text>
                  <Text style={styles.compatVal}>{tool.partNumber}</Text>
                </View>
              )}

              {tool.compatibilityNotes && (
                <View style={styles.compatDetailItem}>
                  <Text style={styles.compatKey}>Compatibility Notes:</Text>
                  <Text style={styles.compatVal}>{tool.compatibilityNotes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description & Technical Role */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Product Description & Field Application</Text>
          <Text style={styles.descText}>{isTamil ? tool.descriptionTa : tool.description}</Text>
        </View>

        {/* Technical Specifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Technical Specifications</Text>
          {Object.entries(tool.specifications).map(([key, val]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{key}:</Text>
              <Text style={styles.specVal}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Warranty & Guarantee */}
        <View style={styles.warrantyCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#2E7D32" />
          <View style={styles.warrantyContent}>
            <Text style={styles.warrantyTitle}>Warranty & Support</Text>
            <Text style={styles.warrantyDesc}>{tool.warranty}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.callSellerBtn}
          onPress={() => handleCallSeller(tool.sellerPhone)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />
          <Text style={styles.callSellerBtnText}>Call Seller ({tool.sellerPhone})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compareBtn}
          onPress={() => navigation.navigate('ToolCompare', { toolIds: [tool.id] })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="scale-balance" size={18} color={Colors.white} />
          <Text style={styles.compareBtnText}>Compare Tool</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
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
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  notFoundSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  heroBanner: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  subCategoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  subsidyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  subsidyContent: {
    flex: 1,
  },
  subsidyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
  subsidySub: {
    fontSize: 11,
    color: '#2E7D32',
    marginTop: 1,
  },
  pricingCard: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceMain: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  mrpText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  sizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  sizeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
  },
  unitLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  unitVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sellerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  compatibilityCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  compatCardVerified: {
    backgroundColor: '#EBF3FB',
    borderColor: '#90CAF9',
  },
  compatCardUnverified: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  compatHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  compatHeaderContent: {
    flex: 1,
  },
  compatTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  compatSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  compatDetailsGrid: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  compatDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  compatKey: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 130,
  },
  compatVal: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  specKey: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  specVal: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  warrantyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 10,
  },
  warrantyContent: {
    flex: 1,
  },
  warrantyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  warrantyDesc: {
    fontSize: 11,
    color: '#388E3C',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  callSellerBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  callSellerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  compareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  compareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
