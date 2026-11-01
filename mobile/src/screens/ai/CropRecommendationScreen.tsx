import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { CropRecommendationItem } from '../../types/ai';
import { getCropRecommendations } from '../../services/aiService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CropRecommendation'>;

const SOILS = ['Red Soil', 'Black Soil', 'Clay Soil', 'Sandy Soil', 'Loamy Soil'];
const WATERS = ['Low', 'Medium', 'High'];
const SEASONS = ['Kharif', 'Rabi', 'Summer'];
const FARMING_TYPES = ['Open Field', 'Drip Irrigation', 'Organic', 'Protected / Polyhouse'];

export const CropRecommendationScreen: React.FC<Props> = () => {
  const [selectedSoil, setSelectedSoil] = useState('Red Soil');
  const [selectedWater, setSelectedWater] = useState('Medium');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');
  const [selectedFarmingType, setSelectedFarmingType] = useState('Open Field');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationItem[]>([]);
  const [isTamil, setIsTamil] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await getCropRecommendations(
        selectedSoil,
        selectedWater,
        selectedSeason,
        selectedFarmingType,
        isTamil ? 'ta' : 'en'
      );
      setRecommendations(res.recommendations);
    } catch (e) {
      console.warn('Error fetching recommendations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedSoil, selectedWater, selectedSeason, selectedFarmingType, isTamil]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerSubtitle}>
          {isTamil
            ? 'மண் வகை மற்றும் நீர்வளத்திற்கு ஏற்ற பயிர் தேர்வு'
            : 'Match optimal crops, fertilizer regimes & practices to your field parameters'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Parameters Card */}
      <View style={styles.card}>
        <Text style={styles.filterTitle}>{isTamil ? 'நில காரணிகள்' : 'Field Parameters'}</Text>

        {/* Soil Type */}
        <Text style={styles.label}>{isTamil ? 'மண் வகை' : 'Soil Type'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {SOILS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedSoil === s && styles.chipActive]}
              onPress={() => setSelectedSoil(s)}
            >
              <Text style={[styles.chipText, selectedSoil === s && styles.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Water Availability */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'நீர் வசதி' : 'Water Availability'}
        </Text>
        <View style={styles.selectorGrid}>
          {WATERS.map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.gridChip, selectedWater === w && styles.gridChipActive]}
              onPress={() => setSelectedWater(w)}
            >
              <Text style={[styles.chipText, selectedWater === w && styles.chipTextActive]}>
                {w}
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
              style={[styles.gridChip, selectedSeason === sn && styles.gridChipActive]}
              onPress={() => setSelectedSeason(sn)}
            >
              <Text style={[styles.chipText, selectedSeason === sn && styles.chipTextActive]}>
                {sn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Farming Type */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>
          {isTamil ? 'விவசாய முறை' : 'Farming System'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {FARMING_TYPES.map((ft) => (
            <TouchableOpacity
              key={ft}
              style={[styles.chip, selectedFarmingType === ft && styles.chipActive]}
              onPress={() => setSelectedFarmingType(ft)}
            >
              <Text style={[styles.chipText, selectedFarmingType === ft && styles.chipTextActive]}>
                {ft}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Crops Header */}
      <View style={styles.sectionHeaderRow}>
        <MaterialCommunityIcons name="sprout" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>
          {isTamil ? 'பரிந்துரைக்கப்படும் பயிர்கள்' : 'Recommended Crops'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {isTamil ? 'பயிர்கள் தேர்ந்தெடுக்கப்படுகின்றன...' : 'Matching agronomic rules...'}
          </Text>
        </View>
      ) : recommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isTamil ? 'பரிந்துரைகள் எதுவும் கிடைக்கவில்லை' : 'No matching recommendations found.'}
          </Text>
        </View>
      ) : (
        recommendations.map((rec, index) => (
          <View key={index} style={styles.recCard}>
            <View style={styles.recHeader}>
              <View style={styles.recIconCircle}>
                <MaterialCommunityIcons name="leaf" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.recCropTitle}>{rec.crop}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.recSection}>
              <Text style={styles.recSectionLabel}>
                {isTamil ? 'ஏன் இப்பயிர்?' : 'Why this crop?'}
              </Text>
              <Text style={styles.recSectionDesc}>{rec.reason}</Text>
            </View>

            <View style={styles.recSection}>
              <Text style={styles.recSectionLabel}>
                {isTamil ? 'உர அட்டவணை:' : 'Fertilizer & Nutrient Regime:'}
              </Text>
              <Text style={styles.recSectionDesc}>{rec.fertilizer}</Text>
            </View>

            <View style={styles.recSection}>
              <Text style={styles.recSectionLabel}>
                {isTamil ? 'பயிர் பராமரிப்பு முறை:' : 'Agronomic Best Practice:'}
              </Text>
              <Text style={styles.recSectionDesc}>{rec.practice}</Text>
            </View>
          </View>
        ))
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
  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  recCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recCropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  recSection: {
    marginBottom: 8,
  },
  recSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  recSectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
