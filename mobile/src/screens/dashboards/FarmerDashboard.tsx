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

export const FarmerDashboard: React.FC<Props> = ({ isTamil }) => {
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
    iconName: 'information-outline',
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
      {/* Primary Action Hero: Sell Crop / Post Harvest */}
      <View style={styles.marketActionBanner}>
        <View style={styles.marketActionLeft}>
          <Text style={styles.marketActionTitle}>
            {isTamil ? 'விளைச்சல் விற்பனை' : 'Sell Your Harvest'}
          </Text>
          <Text style={styles.marketActionSubtitle}>
            {isTamil
              ? 'வாங்குபவர்களுக்கு நேரடியாக பயிர் பதிவு செய்யுங்கள்'
              : 'Direct connection to wholesale buyers across Tamil Nadu'}
          </Text>
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate('CreateListing')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus-circle" size={16} color={Colors.white} />
              <Text style={styles.primaryActionText}>
                {isTamil ? 'பதிவு சேர்' : 'Add Post'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => navigation.navigate('FarmerListings')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="format-list-bulleted" size={16} color={Colors.primary} />
              <Text style={styles.secondaryActionText}>
                {isTamil ? 'என் பதிவுகள்' : 'My Listings'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* AI Precision Agriculture Banner Card */}
      <TouchableOpacity
        style={styles.aiBanner}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AiDashboard')}
      >
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBox}>
            <MaterialCommunityIcons name="auto-fix" size={24} color={Colors.white} />
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI POWERED</Text>
          </View>
        </View>
        <Text style={styles.aiTitle}>
          {isTamil ? 'AI விவசாய உதவியாளர்' : 'AI Farming Assistant'}
        </Text>
        <Text style={styles.aiSubtitle}>
          {isTamil
            ? 'பயிர் சுகாதாரக் கருவி • திறன் பாசனம் • விளைச்சல் கணிப்பு'
            : 'Crop Disease Scanner • Smart Irrigation • Yield Prediction'}
        </Text>
        <View style={styles.aiFooter}>
          <Text style={styles.aiActionText}>{isTamil ? 'ஆரம்பிக்க தட்டவும்' : 'Explore AI Tools'}</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.white} />
        </View>
      </TouchableOpacity>

      {/* Agri Care Store Banner Card */}
      <TouchableOpacity
        style={styles.storeBanner}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AgriStoreHome')}
      >
        <View style={styles.storeHeader}>
          <View style={styles.storeIconBox}>
            <MaterialCommunityIcons name="bottle-tonic-plus" size={24} color={Colors.white} />
          </View>
          <View style={styles.storeBadge}>
            <Text style={styles.storeBadgeText}>AGRI CARE STORE</Text>
          </View>
        </View>
        <Text style={styles.storeTitle}>
          {isTamil ? 'வேளாண் இடுபொருட்கள் அங்காடி' : 'Agri Care Store'}
        </Text>
        <Text style={styles.storeSubtitle}>
          {isTamil
            ? 'அரசு மானிய உரம் (யூரியா, DAP) • இயற்கை இடுபொருட்கள் • சான்று விதைகள் • அருகில் உள்ள கூட்டுறவு சங்கங்கள்'
            : 'Subsidized Fertilizers (Urea, DAP) • Bio-Inputs • Crop Protection • Certified Seeds & PACCS'}
        </Text>
        <View style={styles.storeFooter}>
          <Text style={styles.storeActionText}>
            {isTamil ? 'இடுபொருட்கள் & கிடங்குகள் காண' : 'Browse Inputs & Local Depots'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.white} />
        </View>
      </TouchableOpacity>

      {/* Section Title */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'விவசாயி சேவைகள்' : 'Farmer Quick Actions'}
      </Text>

      {/* Quick Action Grid */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'சந்தை உலாவு' : 'Marketplace'}
            description={isTamil ? 'அனைத்து பயிர் பட்டியல்' : 'Browse active crop listings'}
            iconName="storefront-outline"
            iconColor="#2E7D32"
            onPress={() => navigation.navigate('Marketplace')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'சந்தை விலை' : 'Market Prices'}
            description={isTamil ? 'மண்டி விலை ஒப்பீடு' : 'APMC mandi live price trends'}
            iconName="chart-line"
            iconColor="#1565C0"
            onPress={() => navigation.navigate('MarketPrices')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'வானிலை & எச்சரிக்கை' : 'Weather & Forecast'}
            description={isTamil ? 'மழை & விவசாய எச்சரிக்கை' : 'Live Open-Meteo & spray advisory'}
            iconName="weather-partly-cloudy"
            iconColor="#0288D1"
            onPress={() => navigation.navigate('Weather')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'அரசு திட்டங்கள் & செய்தி' : 'Alerts & Schemes'}
            description={isTamil ? 'மானியம் & வேளாண் செய்தி' : 'Govt subsidies & agri bulletins'}
            iconName="bell-ring-outline"
            iconColor="#E65100"
            onPress={() => navigation.navigate('AgriculturalAlerts')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'கிடங்கு புக்கிங்' : 'Storage Booking'}
            description={isTamil ? 'குளிர்சாதன கிடங்கு முன்பதிவு' : 'Reserve verified cold storage'}
            iconName="warehouse"
            iconColor="#6A1B9A"
            onPress={() => navigation.navigate('FindStorage')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'போக்குவரத்து' : 'Transport'}
            description={isTamil ? 'சரக்கு வாகனம் முன்பதிவு' : 'Book freight trucks for harvest'}
            iconName="truck-delivery"
            iconColor="#455A64"
            onPress={() => navigation.navigate('FindTransport')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'இடுபொருள் அங்காடி' : 'Agri Care Store'}
            description={isTamil ? 'உரம், பூச்சி மருந்து & விதைகள்' : 'Fertilizers, bio-inputs & seeds'}
            iconName="bottle-tonic-plus-outline"
            iconColor="#00796B"
            onPress={() => navigation.navigate('AgriStoreHome')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'அருகில் உள்ள உரக்கடைகள்' : 'Nearby Depots'}
            description={isTamil ? 'கூட்டுறவு சங்கங்கள் & கடைகள்' : 'Locate certified PACCS & stores'}
            iconName="map-marker-radius-outline"
            iconColor="#1565C0"
            onPress={() => navigation.navigate('NearbyShops', { selectedDistrict: 'All' })}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'வேளாண் கருவிகள்' : 'Farm Tools & Tech'}
            description={isTamil ? 'கைக்கருவிகள், உதிரிபாகம் & IoT' : 'Spares, drip kits, sprayers & sensors'}
            iconName="tools"
            iconColor="#D84315"
            onPress={() => navigation.navigate('FarmToolsHome')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'இயந்திர வாடகை' : 'Machinery Rental'}
            description={isTamil ? 'டிராக்டர், அறுவடை & ரோட்டாவேட்டர்' : 'Rent tractor, harvester & leveler'}
            iconName="tractor"
            iconColor="#E65100"
            onPress={() => navigation.navigate('EquipmentRental')}
          />
        </View>
      </View>

      {/* Real Activity Section */}
      <RecentActivitySection
        title={isTamil ? 'சமீபத்திய விவசாய பதிவுகள்' : 'Recent Farm Activity'}
        emptyMessage={isTamil ? 'பதிவுகள் எதுவும் இல்லை' : 'No active crop posts yet'}
        emptySubtitle={
          isTamil
            ? 'நீங்கள் பயிர்களை பட்டியலிடும்போது இங்கு தோன்றும்.'
            : 'Your harvest listings and booking inquiries will appear here.'
        }
        iconName="sprout"
      />

      {/* Feature Notice Modal */}
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
  marketActionBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  marketActionLeft: {
    flex: 1,
  },
  marketActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  marketActionSubtitle: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryActionText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  aiBanner: {
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  aiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#C8E6C9',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  storeBanner: {
    backgroundColor: '#004D40',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  storeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeBadge: {
    backgroundColor: '#00897B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  storeBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  storeSubtitle: {
    fontSize: 12,
    color: '#B2DFDB',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
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
