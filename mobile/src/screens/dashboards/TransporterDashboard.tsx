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

export const TransporterDashboard: React.FC<Props> = ({ isTamil }) => {
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
    iconName: 'truck',
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
      {/* Fleet Overview Highlight Card */}
      <TouchableOpacity
        style={styles.fleetCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('TransporterTrips')}
      >
        <View style={styles.fleetHeader}>
          <View style={styles.fleetIconBox}>
            <MaterialCommunityIcons name="truck-fast" size={24} color="#1565C0" />
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LOGISTICS PORTAL</Text>
          </View>
        </View>
        <Text style={styles.fleetTitle}>
          {isTamil ? 'போக்குவரத்து மேலாண்மை' : 'Transport Operations'}
        </Text>
        <Text style={styles.fleetSubtitle}>
          {isTamil
            ? 'வாகனங்கள், பயண நிலவரங்கள் மற்றும் விவசாயிகளின் முன்பதிவு கோரிக்கைகள்.'
            : 'Manage registered vehicles, active hauling routes, and freight booking dispatches.'}
        </Text>
      </TouchableOpacity>

      {/* Section Header */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'வாகன செயல்பாடுகள்' : 'Operations Management'}
      </Text>

      {/* 4 Quick Actions */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'வாகன மேலாண்மை' : 'Vehicle Fleet'}
            description={isTamil ? 'வாகன பதிவு & கொள்ளளவு' : 'Manage truck models, RC & capacities'}
            iconName="truck"
            iconColor="#1565C0"
            onPress={() => navigation.navigate('TransporterTrips', { initialTab: 'fleet' })}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'புதிய வாகனம்' : 'Add Vehicle'}
            description={isTamil ? 'புதிய சரக்கு வாகனம் சேர்' : 'Register freight trucks into fleet'}
            iconName="plus-box"
            iconColor="#2E7D32"
            onPress={() => navigation.navigate('AddVehicle')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'முன்பதிவு கோரிக்கைகள்' : 'Transport Requests'}
            description={isTamil ? 'விவசாயிகளின் புதிய கோரிக்கை' : 'Farmer booking inquiries & quotes'}
            iconName="clipboard-list-outline"
            iconColor="#E65100"
            onPress={() => navigation.navigate('TransportRequests')}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'பயண நிலவரம்' : 'Trip Tracking'}
            description={isTamil ? 'செயலில் உள்ள போக்குவரத்து' : 'Live transit routes & delivery updates'}
            iconName="map-marker-path"
            iconColor="#6A1B9A"
            onPress={() => navigation.navigate('TransportTrip')}
          />
        </View>
      </View>

      {/* Real Activity Section */}
      <RecentActivitySection
        title={isTamil ? 'சமீபத்திய பயணங்கள்' : 'Recent Transport Activity'}
        emptyMessage={isTamil ? 'செயலில் உள்ள பயணங்கள் இல்லை' : 'No active trips scheduled'}
        emptySubtitle={
          isTamil
            ? 'புதிய முன்பதிவு கோரிக்கைகள் ஏற்கப்படும்போது இங்கு தோன்றும்.'
            : 'Accepted hauling assignments and delivery milestones will appear here.'
        }
        iconName="truck-outline"
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
  fleetCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  fleetIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    backgroundColor: '#1565C0',
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
  fleetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',
    marginBottom: 4,
  },
  fleetSubtitle: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
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
