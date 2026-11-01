import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AiDashboard'>;

interface ActionCardItem {
  id: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  route: keyof RootStackParamList;
  badge?: string;
}

const ACTION_CARDS: ActionCardItem[] = [
  {
    id: 'chat',
    title: 'AI Farming Assistant',
    titleTa: 'AI விவசாய உதவியாளர்',
    subtitle: 'Ask crop health, organic remedies & advice',
    subtitleTa: 'பயிர் ஆரோக்கியம், உரம் மற்றும் சந்தேகங்கள் கேட்கலாம்',
    icon: 'robot-outline',
    color: '#2E7D32',
    route: 'AiAssistant',
    badge: 'INTERACTIVE',
  },
  {
    id: 'scanner',
    title: 'Crop Health Scanner',
    titleTa: 'பயிர் சுகாதாரக் கருவி',
    subtitle: 'Detect leaf diseases & pests from photos',
    subtitleTa: 'புகைப்படம் மூலம் இலை நோய்களை கண்டறியவும்',
    icon: 'camera-iris',
    color: '#D32F2F',
    route: 'CropHealthScanner',
    badge: 'VISION AI',
  },
  {
    id: 'irrigation',
    title: 'Smart Irrigation',
    titleTa: 'திறன் பாசனம்',
    subtitle: 'Calculate daily water requirements & cycles',
    subtitleTa: 'தினசரி நீர் தேவை மற்றும் பாசன சுழற்சி கணக்கீடு',
    icon: 'water-pump',
    color: '#0288D1',
    route: 'SmartIrrigation',
  },
  {
    id: 'yield',
    title: 'Yield Prediction',
    titleTa: 'விளைச்சல் கணிப்பு',
    subtitle: 'Estimate harvest tonnage & market timing',
    subtitleTa: 'எதிர்பார்க்கப்படும் மகசூல் மற்றும் அறுவடை காலம்',
    icon: 'chart-bell-curve-cumulative',
    color: '#E65100',
    route: 'YieldPrediction',
  },
  {
    id: 'recommendation',
    title: 'Crop Recommendation',
    titleTa: 'பயிர் பரிந்துரை',
    subtitle: 'Match best crops to your soil & season',
    subtitleTa: 'மண் மற்றும் பருவத்திற்கு ஏற்ற பயிர் பரிந்துரை',
    icon: 'sprout-outline',
    color: '#6A1B9A',
    route: 'CropRecommendation',
  },
  {
    id: 'voice',
    title: 'Voice Assistant',
    titleTa: 'குரல் உதவி',
    subtitle: 'Hands-free voice navigation & audio answers',
    subtitleTa: 'குரல் மூலம் கட்டளைகள் மற்றும் ஒலி பதில்',
    icon: 'microphone-outline',
    color: '#00796B',
    route: 'VoiceAssistant',
    badge: 'TAMIL & ENG',
  },
];

export const AiDashboardScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons name="auto-fix" size={14} color={Colors.white} />
          <Text style={styles.heroBadgeText}>PRECISION AGRICULTURE</Text>
        </View>
        <Text style={styles.heroTitle}>AI Agriculture Intelligence</Text>
        <Text style={styles.heroSubtitle}>
          Powered by smart agronomy models tailored for South Indian farming conditions.
        </Text>
      </View>

      {/* Grid of Action Cards */}
      <Text style={styles.sectionHeader}>AI Tools & Advisory</Text>

      <View style={styles.grid}>
        {ACTION_CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(card.route as any)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${card.color}15` }]}>
                <MaterialCommunityIcons name={card.icon} size={28} color={card.color} />
              </View>
              {card.badge && (
                <View style={[styles.badge, { backgroundColor: card.color }]}>
                  <Text style={styles.badgeText}>{card.badge}</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardTitleTa}>{card.titleTa}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {card.subtitle}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={[styles.openAction, { color: card.color }]}>Launch Tool</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={card.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: Spacing.xxl,
  },
  heroBanner: {
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#C8E6C9',
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
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
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardTitleTa: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: Spacing.sm,
    minHeight: 30,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  openAction: {
    fontSize: 11,
    fontWeight: '700',
  },
});
