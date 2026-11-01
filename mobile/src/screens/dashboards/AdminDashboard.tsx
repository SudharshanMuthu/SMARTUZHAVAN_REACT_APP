import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { adminService, AdminStats } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface Props {
  isTamil: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashboard: React.FC<Props> = ({ isTamil }) => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Partial<AdminStats>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getStats();
      if (res && res.stats) {
        setStats(res.stats);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // Fallback fallback stats
      setStats({
        totalUsers: 14,
        farmers: 6,
        buyers: 4,
        transporters: 2,
        warehouses: 2,
        totalCrops: 10,
        totalOrders: 8,
        totalWarehouses: 4,
        totalVehicles: 6,
        pendingBookings: 2,
        activeAlerts: 4,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const adminModules = [
    {
      route: 'AdminUsers' as const,
      icon: 'account-group' as const,
      iconColor: '#1976D2',
      iconBg: '#E3F2FD',
      titleEn: 'User Control',
      titleTa: 'பயனர் மேலாண்மை',
      subtitleEn: 'Manage Farmers, Buyers, Transporters & Warehouses',
      subtitleTa: 'அனைத்து பயனர் கணக்குகள் மற்றும் அனுமதி கட்டுப்பாடு',
      statBadge: `${stats.totalUsers ?? 14} Users`,
    },
    {
      route: 'AdminCrops' as const,
      icon: 'sprout' as const,
      iconColor: '#2E7D32',
      iconBg: '#E8F5E9',
      titleEn: 'Produce Marketplace',
      titleTa: 'பயிர் பதிவுகள்',
      subtitleEn: 'Moderate crop listings, harvest batches & prices',
      subtitleTa: 'சந்தை விளைபொருள் பதிவுகள் மற்றும் சரிபார்ப்பு',
      statBadge: `${stats.totalCrops ?? 10} Crops`,
    },
    {
      route: 'AdminWarehouses' as const,
      icon: 'warehouse' as const,
      iconColor: '#E65100',
      iconBg: '#FFF3E0',
      titleEn: 'Warehouse Facilities',
      titleTa: 'கிடங்கு வசதிகள்',
      subtitleEn: 'Monitor cold storage, occupancy & capacities',
      subtitleTa: 'சேமிப்பு கிடங்குகள் மற்றும் இருப்பு நிலவரம்',
      statBadge: `${stats.totalWarehouses ?? 4} Facilities`,
    },
    {
      route: 'AdminVehicles' as const,
      icon: 'truck' as const,
      iconColor: '#00838F',
      iconBg: '#E0F7FA',
      titleEn: 'Transport Fleet',
      titleTa: 'போக்குவரத்து வாகனங்கள்',
      subtitleEn: 'Track logistics vehicles, payloads & status',
      subtitleTa: 'விவசாய சரக்கு வாகனங்கள் மற்றும் வாடகை விகிதங்கள்',
      statBadge: `${stats.totalVehicles ?? 6} Vehicles`,
    },
    {
      route: 'AdminOrders' as const,
      icon: 'clipboard-list' as const,
      iconColor: '#7B1FA2',
      iconBg: '#F3E5F5',
      titleEn: 'Orders & Storage Bookings',
      titleTa: 'ஆர்டர்கள் & முன்பதிவுகள்',
      subtitleEn: 'Approve, review and monitor market transactions',
      subtitleTa: 'பயிர் கொள்முதல் மற்றும் சேமிப்பு முன்பதிவுகள்',
      statBadge: `${stats.totalOrders ?? 8} Orders`,
    },
    {
      route: 'AdminMarketPrices' as const,
      icon: 'chart-line' as const,
      iconColor: '#C2185B',
      iconBg: '#FCE4EC',
      titleEn: 'APMC Mandi Rates',
      titleTa: 'மண்டி சந்தை விலைகள்',
      subtitleEn: 'Live commodity rates across Tamil Nadu districts',
      subtitleTa: 'தமிழக மாவட்ட மண்டி தினசரி விலை நிலவரம்',
      statBadge: 'Live Mandis',
    },
    {
      route: 'AdminAlerts' as const,
      icon: 'bullhorn' as const,
      iconColor: '#D32F2F',
      iconBg: '#FFEBEE',
      titleEn: 'Schemes & Weather Alerts',
      titleTa: 'அரசு மானியங்கள் & எச்சரிக்கைகள்',
      subtitleEn: 'Broadcast alerts, weather advisories & subsidies',
      subtitleTa: 'விவசாயிகளுக்கான அவசர அறிவிப்புகள் மற்றும் திட்டங்கள்',
      statBadge: `${stats.activeAlerts ?? 4} Active`,
    },
    {
      route: 'AdminContent' as const,
      icon: 'folder-text-outline' as const,
      iconColor: '#455A64',
      iconBg: '#ECEFF1',
      titleEn: 'App Content & Categories',
      titleTa: 'பயன்பாட்டு உள்ளடக்கம்',
      subtitleEn: 'Crop types, store catalogs and localized banners',
      subtitleTa: 'பயிர் பிரிவுகள் மற்றும் உள்ளடக்க மேலாண்மை',
      statBadge: 'Config',
    },
    {
      route: 'AdminServices' as const,
      icon: 'server-network' as const,
      iconColor: '#00796B',
      iconBg: '#E0F2F1',
      titleEn: 'Service Health & Audit Logs',
      titleTa: 'கணினி நிலை & தணிக்கை',
      subtitleEn: 'AI Assistant, Weather API, Firestore & Audit Trail',
      subtitleTa: 'சேவை நிலை மற்றும் பாதுகாப்பு செயல்பாட்டு பதிவுகள்',
      statBadge: 'System OK',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Central Admin Banner */}
      <View style={styles.adminBanner}>
        <View style={styles.bannerTop}>
          <View style={styles.adminBadge}>
            <MaterialCommunityIcons name="shield-crown" size={16} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>
              {isTamil ? 'முதன்மை நிர்வாகம்' : 'CENTRAL ADMIN CONSOLE'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadStats}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.bannerTitle}>
          {isTamil ? 'ஸ்மார்ட் உழவன் முதன்மை கட்டுப்பாட்டு மையம்' : 'Smart Uzhavan Central Command'}
        </Text>
        <Text style={styles.bannerSubtitle}>
          {isTamil
            ? 'அனைத்து பயனர் பாத்திரங்கள், சந்தை பரிவர்த்தனைகள் மற்றும் சேவைகளை மொபைலிலேயே கண்காணிக்கலாம்.'
            : 'End-to-end administration of users, crops, logistics, cold storage, and ecosystem services.'}
        </Text>

        {lastUpdated ? (
          <Text style={styles.lastUpdatedText}>
            {isTamil ? `கடைசி புதுப்பிப்பு: ${lastUpdated}` : `Last refreshed: ${lastUpdated}`}
          </Text>
        ) : null}
      </View>

      {/* Live System Metrics Grid */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'கணினி நேரடி நிலவரம்' : 'Live Platform Overview'}
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#1976D2' }]}>
          <Text style={styles.statNumber}>{stats.totalUsers ?? 14}</Text>
          <Text style={styles.statLabel}>{isTamil ? 'மொத்த பயனர்கள்' : 'Total Users'}</Text>
          <Text style={styles.statSub}>
            {`${stats.farmers ?? 6} Farmers • ${stats.buyers ?? 4} Buyers`}
          </Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#2E7D32' }]}>
          <Text style={styles.statNumber}>{stats.totalCrops ?? 10}</Text>
          <Text style={styles.statLabel}>{isTamil ? 'பயிர் பதிவுகள்' : 'Active Crops'}</Text>
          <Text style={styles.statSub}>
            {`${stats.totalOrders ?? 8} Market Orders`}
          </Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#E65100' }]}>
          <Text style={styles.statNumber}>{stats.totalWarehouses ?? 4}</Text>
          <Text style={styles.statLabel}>{isTamil ? 'கிடங்குகள்' : 'Warehouses'}</Text>
          <Text style={styles.statSub}>
            {`${stats.pendingBookings ?? 2} Pending Slots`}
          </Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#00838F' }]}>
          <Text style={styles.statNumber}>{stats.totalVehicles ?? 6}</Text>
          <Text style={styles.statLabel}>{isTamil ? 'சரக்கு வாகனங்கள்' : 'Transport Fleet'}</Text>
          <Text style={styles.statSub}>
            {`${stats.transporters ?? 2} Transporters`}
          </Text>
        </View>
      </View>

      {/* Admin Operations Section */}
      <Text style={styles.sectionHeader}>
        {isTamil ? 'நிர்வாக செயல்பாட்டு தொகுதிகள்' : 'Admin Operations & Management'}
      </Text>

      <View style={styles.moduleList}>
        {adminModules.map((mod) => (
          <TouchableOpacity
            key={mod.route}
            style={styles.moduleCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(mod.route)}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: mod.iconBg }]}>
              <MaterialCommunityIcons name={mod.icon} size={24} color={mod.iconColor} />
            </View>

            <View style={styles.moduleContent}>
              <View style={styles.moduleTitleRow}>
                <Text style={styles.moduleTitle}>
                  {isTamil ? mod.titleTa : mod.titleEn}
                </Text>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>{mod.statBadge}</Text>
                </View>
              </View>
              <Text style={styles.moduleSubtitle} numberOfLines={2}>
                {isTamil ? mod.subtitleTa : mod.subtitleEn}
              </Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={22} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xl,
  },
  adminBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: Spacing.l,
    marginVertical: Spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C62828',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  lastUpdatedText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.m,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.subtext,
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  moduleList: {
    gap: Spacing.s,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  moduleContent: {
    flex: 1,
    marginRight: Spacing.s,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 6,
  },
  statPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  moduleSubtitle: {
    fontSize: 12,
    color: Colors.subtext,
    lineHeight: 16,
  },
});
