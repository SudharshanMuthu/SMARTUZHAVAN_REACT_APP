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

export const WarehouseDashboard: React.FC<Props> = ({ isTamil }) => {
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
    iconName: 'warehouse',
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
      {/* Storage Facility Highlight Banner */}
      <TouchableOpacity
        style={styles.warehouseCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('OwnerWarehouse')}
      >
        <View style={styles.warehouseHeader}>
          <View style={styles.warehouseIconBox}>
            <MaterialCommunityIcons name="office-building" size={24} color="#E65100" />
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>FACILITY HUB</Text>
          </View>
        </View>
        <Text style={styles.warehouseTitle}>
          {isTamil ? 'கிடங்கு மேலாண்மை' : 'Storage Facilities'}
        </Text>
        <Text style={styles.warehouseSubtitle}>
          {isTamil
            ? 'கிடங்கு இட ஒதுக்கீடு, கொள்ளளவு விவரங்கள் மற்றும் விவசாயிகளின் முன்பதிவு கோரிக்கைகள்.'
            : 'Facility capacity monitoring, slot allocations, and crop preservation booking requests.'}
        </Text>
      </TouchableOpacity>

      {/* Section Header */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'கிடங்கு செயல்பாடுகள்' : 'Facility Operations'}
      </Text>

      {/* 4 Quick Actions */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'கிடங்கு விவரம்' : 'My Warehouses'}
            description={isTamil ? 'இடங்கள், கட்டணம் & விவரங்கள்' : 'Manage facility slots, daily rates & GPS'}
            iconName="warehouse"
            iconColor="#E65100"
            onPress={() => navigation.navigate('OwnerWarehouse', { initialTab: 'facilities' })}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'புதிய கிடங்கு சேர்' : 'Add Facility'}
            description={isTamil ? 'புதிய சேமிப்பு இடம் பதிவு' : 'Register new warehouse capacity'}
            iconName="plus-box"
            iconColor="#2E7D32"
            onPress={() => navigation.navigate('AddWarehouse')}
          />
        </View>

        <View style={styles.rowSpacing} />

        <View style={styles.row}>
          <DashboardCard
            title={isTamil ? 'முன்பதிவு கோரிக்கைகள்' : 'Booking Approvals'}
            description={isTamil ? 'ஏற்க / நிராகரிக்க' : 'Review & approve farmer storage requests'}
            iconName="check-decagram-outline"
            iconColor="#1565C0"
            onPress={() => navigation.navigate('WarehouseBookings', { initialTab: 'bookings' })}
          />
          <View style={styles.colSpacing} />
          <DashboardCard
            title={isTamil ? 'கொள்ளளவு நிலை' : 'Space Occupancy'}
            description={isTamil ? 'தானிய சேமிப்பு போக்கு' : 'Tonnage retention & turnover metrics'}
            iconName="chart-donut"
            iconColor="#6A1B9A"
            onPress={() => navigation.navigate('SpaceOccupancy')}
          />
        </View>
      </View>

      {/* Real Activity Section */}
      <RecentActivitySection
        title={isTamil ? 'சமீபத்திய முன்பதிவுகள்' : 'Recent Storage Inquiries'}
        emptyMessage={isTamil ? 'முன்பதிவு கோரிக்கைகள் இல்லை' : 'No pending storage requests'}
        emptySubtitle={
          isTamil
            ? 'விவசாயிகள் உங்கள் கிடங்கில் முன்பதிவு செய்யும்போது இங்கு தோன்றும்.'
            : 'New booking requests from farmers will appear here for review.'
        }
        iconName="package-variant-closed"
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
  warehouseCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warehouseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  warehouseIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    backgroundColor: '#E65100',
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
  warehouseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BF360C',
    marginBottom: 4,
  },
  warehouseSubtitle: {
    fontSize: 12,
    color: '#D84315',
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
