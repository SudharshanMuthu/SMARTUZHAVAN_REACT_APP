import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { DashboardCard } from '../../components/DashboardCard';
import { RecentActivitySection } from '../../components/RecentActivitySection';
import { FeatureNoticeModal } from '../../components/FeatureNoticeModal';
import { Colors, Spacing } from '../../constants/theme';

interface Props {
  isTamil: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BuyerDashboard: React.FC<Props> = ({ isTamil }) => {
  const navigation = useNavigation<NavigationProp>();

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    phase: string;
    description: string;
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  }>({
    visible: false,
    title: '',
    phase: '',
    description: '',
    iconName: 'storefront',
  });

  const openNotice = (
    title: string,
    phase: string,
    description: string,
    iconName: keyof typeof MaterialCommunityIcons.glyphMap
  ) => {
    setModalConfig({ visible: true, title, phase, description, iconName });
  };

  return (
    <View style={styles.container}>
      {/* Marketplace Banner Highlight */}
      <TouchableOpacity
        style={styles.buyerCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <View style={styles.buyerHeader}>
          <View style={styles.buyerIconBox}>
            <MaterialCommunityIcons name="storefront" size={24} color="#6A1B9A" />
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>BUYER MARKET</Text>
          </View>
        </View>
        <Text style={styles.buyerTitle}>
          {isTamil ? 'விவசாய விளைபொருள் சந்தை' : 'Direct Produce Marketplace'}
        </Text>
        <Text style={styles.buyerSubtitle}>
          {isTamil
            ? 'விவசாயிகளிடமிருந்து நேரடியாக புதிய விளைபொருட்களை கண்டறிந்து கொள்முதல் செய்யுங்கள்.'
            : 'Source freshly harvested crops directly from local farmers across Tamil Nadu.'}
        </Text>
        <View style={styles.bannerActionRow}>
          <Text style={styles.bannerActionText}>
            {isTamil ? 'சந்தை உலாவு' : 'Explore All Crops'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#6A1B9A" />
        </View>
      </TouchableOpacity>

      {/* Section Header */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'வாங்குபவர் சேவைகள்' : 'Procurement Actions'}
      </Text>

      {/* 4 Quick Actions */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'சந்தை உலாவு' : 'Browse Crops'}
            description={isTamil ? 'புதிய பயிர் பட்டியல்' : 'Filter by crop, quality grade & city'}
            iconName="storefront-outline"
            iconColor="#2E7D32"
            onPress={() => navigation.navigate('Marketplace')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'என் ஆர்டர்கள்' : 'My Orders'}
            description={isTamil ? 'ஆர்டர் நிலவரம் & வரலாறு' : 'Track active orders & dispatch status'}
            iconName="receipt-text-outline"
            iconColor="#1565C0"
            onPress={() => navigation.navigate('BuyerOrders')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'என் கார்ட்' : 'Active Cart'}
            description={isTamil ? 'பொருட்கள் & செக் அவுட்' : 'Review bag & proceed to checkout'}
            iconName="cart-outline"
            iconColor="#E65100"
            onPress={() => navigation.navigate('BuyerCart')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'விலை நிலவரம்' : 'Price Index'}
            description={isTamil ? 'மொத்த சந்தை விலை போக்கு' : 'Mandi wholesale commodity index'}
            iconName="trending-up"
            iconColor="#6A1B9A"
            onPress={() => navigation.navigate('MarketPrices')}
          />
        </View>
      </View>

      {/* Real Activity Section */}
      <RecentActivitySection
        title={isTamil ? 'சமீபத்திய கொள்முதல்' : 'Recent Purchase Activity'}
        emptyMessage={isTamil ? 'ஆர்டர்கள் எதுவும் இல்லை' : 'No recent orders placed'}
        emptySubtitle={
          isTamil
            ? 'சந்தையில் பயிர்களை வாங்கும் போது உங்கள் ஆர்டர் விவரங்கள் இங்கு தோன்றும்.'
            : 'Your order fulfillments and invoice receipts will be tracked here.'
        }
        iconName="basket-outline"
      />

      <FeatureNoticeModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        phase={modalConfig.phase}
        description={modalConfig.description}
        iconName={modalConfig.iconName}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buyerCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  buyerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buyerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 4,
  },
  buyerSubtitle: {
    fontSize: 12,
    color: '#6A1B9A',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  bannerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6A1B9A',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  grid: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  rowSpacing: {
    height: Spacing.sm,
  },
  colSpacing: {
    width: Spacing.sm,
  },
});
