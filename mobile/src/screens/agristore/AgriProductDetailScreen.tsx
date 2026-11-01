import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { AgriProduct, ToxicityBand } from '../../types/agristore';
import { fetchAgriProductById } from '../../services/agriStoreService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgriProductDetail'>;

export const AgriProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<AgriProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTamil, setIsTamil] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [productId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchAgriProductById(productId);
      setProduct(data);
    } catch (err) {
      console.warn('[AgriProductDetail] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product specifications...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color={Colors.error} />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundSub}>
          The requested agricultural product is currently unavailable or unlisted.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Return to Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getToxicityDetails = (band: ToxicityBand) => {
    switch (band) {
      case 'green':
        return {
          color: '#2E7D32',
          bg: '#E8F5E9',
          border: '#A5D6A7',
          title: 'Slightly Toxic (Caution)',
          titleTa: 'லேசான நச்சுத்தன்மை (எச்சரிக்கை)',
          code: 'GREEN TRIANGLE',
          desc: 'Low acute toxicity to mammals under normal agricultural handling. Basic PPE required.',
        };
      case 'blue':
        return {
          color: '#1565C0',
          bg: '#E3F2FD',
          border: '#90CAF9',
          title: 'Moderately Toxic (Danger)',
          titleTa: 'மிதமான நச்சுத்தன்மை (ஆபத்து)',
          code: 'BLUE TRIANGLE',
          desc: 'Hazardous if ingested, inhaled, or absorbed through skin. Use full PPE and avoid spray drift.',
        };
      case 'yellow':
        return {
          color: '#F57F17',
          bg: '#FFFDE7',
          border: '#FFF59D',
          title: 'Highly Toxic (Poison)',
          titleTa: 'அதிக நச்சுத்தன்மை (விஷம்)',
          code: 'YELLOW TRIANGLE',
          desc: 'High acute toxicity. Strict adherence to waiting period and chemical safety required.',
        };
      case 'red':
        return {
          color: '#C62828',
          bg: '#FFEBEE',
          border: '#EF9A9A',
          title: 'Extremely Toxic (Poison)',
          titleTa: 'கடுமையான நச்சுத்தன்மை (விஷம்)',
          code: 'RED TRIANGLE',
          desc: 'Extremely dangerous. Only certified trained applicators with closed-cabin equipment.',
        };
      case 'bio':
        return {
          color: '#2E7D32',
          bg: '#E8F5E9',
          border: '#C8E6C9',
          title: '100% Bio-Organic / Eco-Friendly',
          titleTa: '100% இயற்கை உரம் / பூச்சிக் கட்டுப்பாடு',
          code: 'BIO-INPUT',
          desc: 'Zero chemical residue. Safe for pollinators, honeybees, earthworms, and soil flora.',
        };
      default:
        return null;
    }
  };

  const toxicity = getToxicityDetails(product.toxicityBand);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>{product.brand}</Text>
          </View>
          <Text style={styles.productTitle}>
            {isTamil ? product.nameTa : product.name}
          </Text>
          <Text style={styles.subCategoryText}>{product.subCategory}</Text>

          {product.isSubsidized && (
            <View style={styles.subsidizedSeal}>
              <MaterialCommunityIcons name="seal" size={16} color="#1B5E20" />
              <Text style={styles.subsidizedSealText}>
                Official Fertilizer Control Order (FCO) Subsidized Price
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.langToggle}
            onPress={() => setIsTamil((prev) => !prev)}
          >
            <Text style={styles.langToggleText}>{isTamil ? 'English' : 'தமிழ் வடிவம்'}</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing & Pack Size Grid */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Government / Retail Rate</Text>
              <Text style={styles.priceMain}>₹{product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.packSizeBadge}>
              <MaterialCommunityIcons name="package-variant" size={16} color={Colors.primary} />
              <Text style={styles.packSizeValue}>{product.packSize}</Text>
            </View>
          </View>

          <View style={styles.unitPriceRow}>
            <Text style={styles.unitPriceLabel}>Calculated Unit Rate:</Text>
            <Text style={styles.unitPriceVal}>{product.unitPrice}</Text>
          </View>

          <View style={styles.sellerInfoRow}>
            <MaterialCommunityIcons name="storefront" size={16} color={Colors.primary} />
            <Text style={styles.sellerInfoText}>
              Available at {product.sellerName}
            </Text>
          </View>
        </View>

        {/* Agronomic Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Product Description & Field Role</Text>
          <Text style={styles.descriptionText}>
            {isTamil ? product.descriptionTa : product.description}
          </Text>
        </View>

        {/* Technical & Chemical Composition */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Composition & Technical Specs</Text>

          <View style={styles.specItem}>
            <Text style={styles.specKey}>Active Ingredients:</Text>
            <Text style={styles.specValue}>{product.activeIngredients}</Text>
          </View>

          <View style={styles.specItem}>
            <Text style={styles.specKey}>Dosage & Method:</Text>
            <Text style={styles.specValue}>{product.dosageGuidance}</Text>
          </View>

          <View style={styles.specItem}>
            <Text style={styles.specKey}>Target Crops:</Text>
            <View style={styles.tagsRow}>
              {product.targetCrops.map((crop, idx) => (
                <View key={idx} style={styles.cropTag}>
                  <Text style={styles.cropTagText}>{crop}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.specItem}>
            <Text style={styles.specKey}>Focus Nutrients / Target Issues:</Text>
            <View style={styles.tagsRow}>
              {product.targetPestsOrNutrients.map((target, idx) => (
                <View key={idx} style={styles.targetTag}>
                  <Text style={styles.targetTagText}>{target}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Crop Protection & Safety Advisory (Requirement E) */}
        {toxicity && (
          <View style={[styles.safetyCard, { borderColor: toxicity.border, backgroundColor: toxicity.bg }]}>
            <View style={styles.safetyHeader}>
              <MaterialCommunityIcons name="alert-decagram" size={24} color={toxicity.color} />
              <View style={styles.safetyHeaderContent}>
                <Text style={[styles.safetyTitle, { color: toxicity.color }]}>
                  {isTamil ? toxicity.titleTa : toxicity.title}
                </Text>
                <Text style={styles.toxicityCode}>{toxicity.code}</Text>
              </View>
            </View>

            <Text style={styles.toxicityDescription}>{toxicity.desc}</Text>

            {product.waitingPeriodDays !== undefined && (
              <View style={styles.phiBox}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#E65100" />
                <View style={styles.phiTextContainer}>
                  <Text style={styles.phiTitle}>
                    Pre-Harvest Interval (PHI): {product.waitingPeriodDays} Days
                  </Text>
                  <Text style={styles.phiSub}>
                    Do not harvest or consume produce within {product.waitingPeriodDays} days of spraying.
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.warningsTitle}>Mandatory Safety & PPE Precautions:</Text>
            {product.safetyWarnings.map((warning, i) => (
              <View key={i} style={styles.warningItem}>
                <MaterialCommunityIcons name="shield-check" size={16} color={toxicity.color} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}

            <View style={styles.expertDisclaimerBox}>
              <MaterialCommunityIcons name="information" size={18} color="#D84315" />
              <Text style={styles.expertDisclaimerText}>
                {product.disclaimer}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.findShopBtn}
          onPress={() => navigation.navigate('NearbyShops', { selectedDistrict: 'All' })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={Colors.primary} />
          <Text style={styles.findShopBtnText}>Locate Nearby Depot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compareBtn}
          onPress={() =>
            navigation.navigate('ProductCompare', { productIds: [product.id] })
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="scale-balance" size={20} color={Colors.white} />
          <Text style={styles.compareBtnText}>Compare Product</Text>
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
  brandPill: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  productTitle: {
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
  subsidizedSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 6,
  },
  subsidizedSealText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  langToggle: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
    alignItems: 'center',
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
  packSizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  packSizeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  unitPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
  },
  unitPriceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  unitPriceVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sellerInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
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
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  specItem: {
    marginBottom: 10,
  },
  specKey: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  cropTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cropTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  targetTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1565C0',
  },
  safetyCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  safetyHeaderContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  toxicityCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toxicityDescription: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
    marginBottom: 10,
  },
  phiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: 10,
    marginBottom: 10,
  },
  phiTextContainer: {
    flex: 1,
  },
  phiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E65100',
  },
  phiSub: {
    fontSize: 11,
    color: '#BF360C',
    marginTop: 1,
  },
  warningsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
    marginBottom: 6,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  expertDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBE9E7',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  expertDisclaimerText: {
    fontSize: 11,
    color: '#D84315',
    flex: 1,
    lineHeight: 15,
    fontStyle: 'italic',
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
  findShopBtn: {
    flex: 1,
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
  findShopBtnText: {
    fontSize: 13,
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
