import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { MandiComparison, MandiPriceData } from '../../types/weatherAndMarket';
import { compareMandiPrices, fetchMandiPrice } from '../../services/weatherAndMarketService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketPrices'>;

const CROPS = [
  { id: 'Paddy', nameEn: 'Paddy', nameTa: 'நெல்' },
  { id: 'Tomato', nameEn: 'Tomato', nameTa: 'தக்காளி' },
  { id: 'Onion', nameEn: 'Onion', nameTa: 'வெங்காயம்' },
  { id: 'Chilli', nameEn: 'Chilli', nameTa: 'மிளகாய்' },
  { id: 'Brinjal', nameEn: 'Brinjal', nameTa: 'கத்தரி' },
  { id: 'Banana', nameEn: 'Banana', nameTa: 'வாழை' },
  { id: 'Groundnut', nameEn: 'Groundnut', nameTa: 'நிலக்கடலை' },
  { id: 'Sugarcane', nameEn: 'Sugarcane', nameTa: 'கரும்பு' },
  { id: 'Cotton', nameEn: 'Cotton', nameTa: 'பருத்தி' },
];

const MANDIS = ['Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore'];

export const MarketPricesScreen: React.FC<Props> = () => {
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [mandi1, setMandi1] = useState('Trichy');
  const [mandi2, setMandi2] = useState('Chennai');

  const [comparison, setComparison] = useState<MandiComparison | null>(null);
  const [allMandiPrices, setAllMandiPrices] = useState<MandiPriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTamil, setIsTamil] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const comp = await compareMandiPrices(selectedCrop, mandi1, mandi2);
      setComparison(comp);

      // Fetch all mandis for comparison list
      const promises = MANDIS.map((m) => fetchMandiPrice(selectedCrop, m));
      const allPrices = await Promise.all(promises);
      setAllMandiPrices(allPrices);
    } catch (e: any) {
      Alert.alert('Market Data Error', 'Could not retrieve APMC mandi price feeds.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCrop, mandi1, mandi2]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            loadData();
          }}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header Language Bar */}
      <View style={styles.topBar}>
        <View style={styles.sourceBadge}>
          <MaterialCommunityIcons name="check-decagram" size={14} color={Colors.primary} />
          <Text style={styles.sourceBadgeText}>OFFICIAL APMC MANDI FEEDS</Text>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <MaterialCommunityIcons name="translate" size={14} color={Colors.primary} />
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Crop Selector Chips */}
      <View style={styles.cropSection}>
        <Text style={styles.sectionLabel}>
          {isTamil ? 'பயிரைத் தேர்வு செய்யவும்:' : 'Select Produce Commodity:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.cropChip, selectedCrop === c.id && styles.cropChipActive]}
              onPress={() => setSelectedCrop(c.id)}
            >
              <Text style={[styles.chipText, selectedCrop === c.id && styles.chipTextActive]}>
                {isTamil ? c.nameTa : c.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Two Mandi Comparative Selectors */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>
          {isTamil ? 'சந்தை ஒப்பீடு (Mandi Compare)' : 'Compare 2 APMC Mandis'}
        </Text>

        <View style={styles.mandiPickersRow}>
          <View style={styles.mandiCol}>
            <Text style={styles.mandiColLabel}>{isTamil ? 'சந்தை 1' : 'Mandi 1'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MANDIS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pickerChip, mandi1 === m && styles.pickerChipActive]}
                  onPress={() => setMandi1(m)}
                >
                  <Text style={[styles.pickerChipText, mandi1 === m && styles.pickerChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.mandiCol}>
            <Text style={styles.mandiColLabel}>{isTamil ? 'சந்தை 2' : 'Mandi 2'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MANDIS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pickerChip, mandi2 === m && styles.pickerChipActive]}
                  onPress={() => setMandi2(m)}
                >
                  <Text style={[styles.pickerChipText, mandi2 === m && styles.pickerChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {isLoading && !comparison ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading latest APMC market prices...</Text>
        </View>
      ) : comparison ? (
        <>
          {/* Side-by-Side Mandi Price Cards */}
          <View style={styles.compareGrid}>
            {/* Mandi 1 Card */}
            <View style={styles.mandiCard}>
              <View style={styles.mandiCardHeader}>
                <MaterialCommunityIcons name="store" size={18} color={Colors.primary} />
                <Text style={styles.mandiCardTitle}>{comparison.mandi1.location}</Text>
              </View>
              <Text style={styles.varietyText}>{comparison.mandi1.variety}</Text>

              <View style={styles.modalPriceContainer}>
                <Text style={styles.modalLabel}>Modal Price</Text>
                <Text style={styles.modalPrice}>{comparison.mandi1.prices.modalPricePerKg}<Text style={styles.unitSuffix}>/kg</Text></Text>
                <Text style={styles.quintalRef}>{comparison.mandi1.prices.modalPricePerQuintal}/Qtl</Text>
              </View>

              <View style={styles.rangeRow}>
                <Text style={styles.rangeText}>Min: {comparison.mandi1.prices.minPricePerKg}</Text>
                <Text style={styles.rangeText}>Max: {comparison.mandi1.prices.maxPricePerKg}</Text>
              </View>
            </View>

            {/* Mandi 2 Card */}
            <View style={styles.mandiCard}>
              <View style={styles.mandiCardHeader}>
                <MaterialCommunityIcons name="store" size={18} color="#1565C0" />
                <Text style={styles.mandiCardTitle}>{comparison.mandi2.location}</Text>
              </View>
              <Text style={styles.varietyText}>{comparison.mandi2.variety}</Text>

              <View style={[styles.modalPriceContainer, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.modalLabel, { color: '#0D47A1' }]}>Modal Price</Text>
                <Text style={[styles.modalPrice, { color: '#1565C0' }]}>{comparison.mandi2.prices.modalPricePerKg}<Text style={styles.unitSuffix}>/kg</Text></Text>
                <Text style={[styles.quintalRef, { color: '#1976D2' }]}>{comparison.mandi2.prices.modalPricePerQuintal}/Qtl</Text>
              </View>

              <View style={styles.rangeRow}>
                <Text style={styles.rangeText}>Min: {comparison.mandi2.prices.minPricePerKg}</Text>
                <Text style={styles.rangeText}>Max: {comparison.mandi2.prices.maxPricePerKg}</Text>
              </View>
            </View>
          </View>

          {/* Price Difference Indicator Banner */}
          <View style={styles.differenceBanner}>
            <MaterialCommunityIcons name="swap-horizontal-bold" size={20} color="#2E7D32" />
            <Text style={styles.differenceText}>
              {comparison.comparison.higherMandi === 'Equal'
                ? 'Rates are identical across both selected mandis.'
                : `${comparison.comparison.higherMandi} is higher by ${comparison.comparison.modalDifferencePerKg}/kg (${comparison.comparison.percentVariance} variance).`}
            </Text>
          </View>

          {/* Unit & Modal Explanation Note */}
          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#E65100" />
            <View style={styles.noteCol}>
              <Text style={styles.noteHeading}>APMC Wholesale Unit Definition:</Text>
              <Text style={styles.noteBody}>
                {comparison.mandi1.unitNote}
              </Text>
              <Text style={[styles.noteBody, { marginTop: 4 }]}>
                {comparison.mandi1.modalPriceDefinition}
              </Text>
            </View>
          </View>

          {/* Mandi-Wise Summary Table */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>
              {isTamil ? 'அனைத்து சந்தை நிலவரம்' : `Tamil Nadu Mandi Rates for ${selectedCrop}`}
            </Text>

            {allMandiPrices.map((item, idx) => (
              <View key={idx} style={styles.summaryRow}>
                <View style={styles.summaryLocCol}>
                  <Text style={styles.summaryLocName}>{item.location}</Text>
                  <Text style={styles.summaryVariety}>{item.variety}</Text>
                </View>

                <View style={styles.summaryPriceCol}>
                  <Text style={styles.summaryModalRate}>{item.prices.modalPricePerKg} <Text style={styles.summaryUnit}>/kg</Text></Text>
                  <Text style={styles.summaryRange}>Min: {item.prices.minPricePerKg} • Max: {item.prices.maxPricePerKg}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Source Attribution */}
          <View style={styles.sourceFooter}>
            <Text style={styles.sourceText}>
              Source: {comparison.mandi1.source}
            </Text>
            <Text style={styles.sourceSub}>
              Official daily auction bulletin. Updated every evening after APMC closing.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  cropSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  cropChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  cropChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  mandiPickersRow: {
    gap: 10,
  },
  mandiCol: {},
  mandiColLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pickerChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerChipText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  pickerChipTextActive: {
    color: Colors.white,
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  compareGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  mandiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mandiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mandiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  varietyText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  modalPriceContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: Spacing.sm,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B5E20',
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  unitSuffix: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  quintalRef: {
    fontSize: 10,
    color: '#2E7D32',
    marginTop: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  differenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F8E9',
    padding: Spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: Spacing.md,
  },
  differenceText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF8E1',
    padding: Spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: Spacing.lg,
  },
  noteCol: {
    flex: 1,
  },
  noteHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 2,
  },
  noteBody: {
    fontSize: 11,
    color: '#5D4037',
    lineHeight: 15,
  },
  summarySection: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  summaryLocCol: {
    flex: 1,
  },
  summaryLocName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryVariety: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  summaryPriceCol: {
    alignItems: 'flex-end',
  },
  summaryModalRate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  summaryRange: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sourceFooter: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sourceSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
