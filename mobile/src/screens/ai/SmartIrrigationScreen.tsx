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
import { IrrigationPlanResult } from '../../types/ai';
import { getIrrigationPlan } from '../../services/aiService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartIrrigation'>;

const CROPS = ['Tomato', 'Paddy', 'Sugarcane', 'Cotton', 'Banana', 'Groundnut', 'Chilli'];
const SOILS = ['Clay', 'Sandy', 'Loamy', 'Silt'];
const STAGES = ['Seedling', 'Vegetative', 'Flowering / Fruit Set', 'Maturity'];

export const SmartIrrigationScreen: React.FC<Props> = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedSoil, setSelectedSoil] = useState('Loamy');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [fieldSize, setFieldSize] = useState('1');

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<IrrigationPlanResult | null>(null);
  const [isTamil, setIsTamil] = useState(false);

  const handleGenerate = async () => {
    const size = parseFloat(fieldSize);
    if (isNaN(size) || size <= 0) {
      Alert.alert('Invalid Field Size', 'Please enter a valid acreage number (e.g., 1 or 2.5).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await getIrrigationPlan(
        selectedCrop,
        selectedSoil,
        size,
        growthStage,
        isTamil ? 'ta' : 'en'
      );
      setPlan(res);
    } catch (e: any) {
      Alert.alert('Calculation Error', e.message || 'Failed to generate irrigation plan.');
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
            ? 'மண் மற்றும் பயிருக்கேற்ப உகந்த பாசன அளவை கணக்கிடுங்கள்'
            : 'Precision crop water requirement & conservation advisory'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs Card */}
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

        {/* Soil Selection */}
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

        {/* Growth Stage */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'வளர்ச்சி நிலை' : 'Growth Stage'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {STAGES.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.chip, growthStage === st && styles.chipActive]}
              onPress={() => setGrowthStage(st)}
            >
              <Text style={[styles.chipText, growthStage === st && styles.chipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Field Size */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'நிலத்தின் அளவு (ஏக்கர்)' : 'Field Size (Acres)'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={fieldSize}
          onChangeText={setFieldSize}
          placeholder="e.g. 1.5"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Action Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleGenerate}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <View style={styles.btnContent}>
              <MaterialCommunityIcons name="water-check" size={20} color={Colors.white} />
              <Text style={styles.submitBtnText}>
                {isTamil ? 'பாசன திட்டம் உருவாக்கு' : 'Calculate Irrigation Plan'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Plan Result Card */}
      {plan && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="water-pump" size={26} color="#0288D1" />
            <Text style={styles.resultTitle}>
              {isTamil ? 'பாசன திட்டம் & பரிந்துரை' : 'Customized Irrigation Plan'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.planMetricBox}>
            <Text style={styles.metricLabel}>
              {isTamil ? 'தினசரி தேவைப்படும் நீர் அளவு' : 'Daily Water Requirement'}
            </Text>
            <Text style={styles.metricHighlight}>{plan.dailyWaterRequirement}</Text>
            <Text style={styles.metricSub}>
              {isTamil ? `மொத்த நிலம்: ${plan.fieldSize} ஏக்கர்` : `For ${plan.fieldSize} acre(s) field`}
            </Text>
          </View>

          <View style={styles.planRow}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={Colors.primary} />
            <Text style={styles.planRowLabel}>
              {isTamil ? 'அடுத்த பாசன சுழற்சி:' : 'Recommended Frequency:'}
            </Text>
            <Text style={styles.planRowValue}>{plan.recommendedInterval}</Text>
          </View>

          <View style={styles.planRow}>
            <MaterialCommunityIcons name="pipe" size={20} color="#E65100" />
            <Text style={styles.planRowLabel}>
              {isTamil ? 'பரிந்துரைக்கப்பட்ட முறை:' : 'Optimal Delivery Method:'}
            </Text>
            <Text style={styles.planRowValue}>{plan.recommendedMethod}</Text>
          </View>

          <View style={styles.planRow}>
            <MaterialCommunityIcons name="layers-outline" size={20} color="#5D4037" />
            <Text style={styles.planRowLabel}>
              {isTamil ? 'மண் நீர் தேக்கு திறன்:' : 'Soil Water Retention:'}
            </Text>
            <Text style={styles.planRowValue}>{plan.soilRetention}</Text>
          </View>

          {/* Conservation Tip */}
          <View style={styles.tipBox}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F57F17" />
            <View style={styles.tipTextCol}>
              <Text style={styles.tipTitle}>
                {isTamil ? 'நீர் சேமிப்பு ஆலோசனை' : 'Water Conservation Tip'}
              </Text>
              <Text style={styles.tipDesc}>{plan.conservationTip}</Text>
            </View>
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
    borderColor: '#B3E5FC',
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
    color: '#01579B',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  planMetricBox: {
    backgroundColor: '#E1F5FE',
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricLabel: {
    fontSize: 12,
    color: '#0277BD',
    fontWeight: '600',
  },
  metricHighlight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#01579B',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 11,
    color: '#0288D1',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  planRowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  planRowValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFDE7',
    padding: Spacing.sm + 2,
    borderRadius: 8,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 11,
    color: '#5D4037',
    lineHeight: 16,
  },
});
