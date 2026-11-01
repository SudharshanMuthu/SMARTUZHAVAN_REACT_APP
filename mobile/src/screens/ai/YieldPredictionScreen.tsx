import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { YieldPredictionResult } from '../../types/ai';
import { getYieldPrediction } from '../../services/aiService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'YieldPrediction'>;

const CROPS = ['Paddy', 'Tomato', 'Sugarcane', 'Cotton', 'Banana', 'Groundnut', 'Chilli', 'Onion'];
const SOILS = ['Clay', 'Sandy', 'Loamy'];
const FERTILIZERS = ['Low', 'Medium', 'High'];
const SEASONS = ['Kharif', 'Rabi', 'Summer'];

export const YieldPredictionScreen: React.FC<Props> = () => {
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [landSize, setLandSize] = useState('1');
  const [selectedSoil, setSelectedSoil] = useState('Clay');
  const [fertilizerUsage, setFertilizerUsage] = useState('Medium');
  const [season, setSeason] = useState('Kharif');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionResult | null>(null);
  const [isTamil, setIsTamil] = useState(false);

  const handlePredict = async () => {
    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) {
      Alert.alert('Invalid Land Size', 'Please enter a valid acreage number (e.g., 1 or 2).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await getYieldPrediction(
        selectedCrop,
        size,
        selectedSoil,
        fertilizerUsage,
        season,
        isTamil ? 'ta' : 'en'
      );
      setResult(res);
    } catch (e: any) {
      Alert.alert('Prediction Error', e.message || 'Failed to calculate yield estimate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerSubtitle}>
          {isTamil
            ? 'மண் மற்றும் பருவத்திற்கேற்ப எதிர்பார்க்கப்படும் விளைச்சலை கணிக்கவும்'
            : 'Estimate harvest tonnage and optimal market window based on agronomy benchmarks'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Input Parameters Card */}
      <View style={styles.card}>
        {/* Crop Selection */}
        <Text style={styles.label}>{isTamil ? 'பயிரின் வகை' : 'Crop Type'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCrop === c && styles.chipActive]}
              onPress={() => setSelectedCrop(c)}
            >
              <Text style={[styles.chipText, selectedCrop === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Land Size */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'நிலத்தின் அளவு (ஏக்கர்)' : 'Land Size (Acres)'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={landSize}
          onChangeText={setLandSize}
          placeholder="e.g. 2"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Soil Type */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'மண் வகை' : 'Soil Type'}
        </Text>
        <View style={styles.selectorGrid}>
          {SOILS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.gridChip, selectedSoil === s && styles.gridChipActive]}
              onPress={() => setSelectedSoil(s)}
            >
              <Text style={[styles.chipText, selectedSoil === s && styles.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fertilizer Usage */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'உரம் பயன்பாடு' : 'Fertilizer Usage Level'}
        </Text>
        <View style={styles.selectorGrid}>
          {FERTILIZERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.gridChip, fertilizerUsage === f && styles.gridChipActive]}
              onPress={() => setFertilizerUsage(f)}
            >
              <Text style={[styles.chipText, fertilizerUsage === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Season */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'பருவ காலம்' : 'Cropping Season'}
        </Text>
        <View style={styles.selectorGrid}>
          {SEASONS.map((sn) => (
            <TouchableOpacity
              key={sn}
              style={[styles.gridChip, season === sn && styles.gridChipActive]}
              onPress={() => setSeason(sn)}
            >
              <Text style={[styles.chipText, season === sn && styles.chipTextActive]}>
                {sn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handlePredict}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <View style={styles.btnContent}>
              <MaterialCommunityIcons name="calculator" size={20} color={Colors.white} />
              <Text style={styles.submitBtnText}>
                {isTamil ? 'விளைச்சலை கணி' : 'Predict Yield Estimate'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Result Card */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={26} color="#2E7D32" />
            <Text style={styles.resultTitle}>
              {isTamil ? 'மதிப்பிடப்பட்ட விளைச்சல் முடிவு' : 'Estimated Harvest Forecast'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Primary Metric Highlight */}
          <View style={styles.metricHighlightBox}>
            <Text style={styles.metricHighlightLabel}>
              {isTamil ? 'மதிப்பிடப்பட்ட விளைச்சல்:' : 'Estimated Production:'}
            </Text>
            <Text style={styles.metricHighlightValue}>{result.estimatedYield}</Text>
            <Text style={styles.metricRangeText}>
              {isTamil ? `எதிர்பார்க்கப்படும் வரம்பு: ${result.estimatedYieldRange}` : `Projected Range: ${result.estimatedYieldRange}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="chart-line-stacked" size={20} color="#1565C0" />
            <Text style={styles.detailLabel}>
              {isTamil ? 'எதிர்பார்க்கப்படும் தேவை:' : 'Expected Market Demand:'}
            </Text>
            <Text style={styles.detailValue}>{result.expectedMarketDemand}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-check" size={20} color="#E65100" />
            <Text style={styles.detailLabel}>
              {isTamil ? 'பரிந்துரைக்கப்பட்ட அறுவடை காலம்:' : 'Optimal Harvest Window:'}
            </Text>
            <Text style={styles.detailValue}>{result.suggestedHarvestWindow}</Text>
          </View>

          {/* Transparent Disclaimer */}
          <View style={styles.disclaimerBox}>
            <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#C62828" />
            <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
          </View>
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipActive: {
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
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  selectorGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridChip: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  metricHighlightBox: {
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricHighlightLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  metricHighlightValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
    marginVertical: 4,
  },
  metricRangeText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: Spacing.sm + 2,
    borderRadius: 8,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#C62828',
    lineHeight: 16,
  },
});
