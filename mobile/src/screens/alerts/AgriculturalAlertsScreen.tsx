import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { AgriNewsItem, GovtScheme, WeatherAdvisory } from '../../types/weatherAndMarket';
import { fetchAgriNews, fetchGovtSchemes, fetchWeatherData } from '../../services/weatherAndMarketService';
import { Colors, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AgriculturalAlerts'>;

type TabType = 'advisories' | 'news' | 'schemes';

export const AgriculturalAlertsScreen: React.FC<Props> = () => {
  const { userProfile } = useAuth();
  const currentRole = userProfile?.role || 'Farmer';
  const userDistrict = userProfile?.location || 'All';

  const [activeTab, setActiveTab] = useState<TabType>('advisories');
  const [isTamil, setIsTamil] = useState(false);

  // Advisories state
  const [advisories, setAdvisories] = useState<WeatherAdvisory[]>([]);

  // News state
  const [news, setNews] = useState<AgriNewsItem[]>([]);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('All');
  const [newsSearch, setNewsSearch] = useState('');
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<AgriNewsItem | null>(null);

  // Schemes state
  const [schemes, setSchemes] = useState<GovtScheme[]>([]);
  const [selectedSchemeCategory, setSelectedSchemeCategory] = useState('All');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllAlerts();
  }, []);

  const loadAllAlerts = async () => {
    setIsLoading(true);
    try {
      const [weatherData, newsData, schemesData] = await Promise.all([
        fetchWeatherData('Trichy'),
        fetchAgriNews('All', currentRole, userDistrict),
        fetchGovtSchemes('All'),
      ]);
      setAdvisories(weatherData.advisories || []);
      setNews(newsData);
      setSchemes(schemesData);
    } catch (e) {
      console.warn('Error loading alerts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Notice', `Official portal URL: ${url}`);
      }
    } catch {
      Alert.alert('Notice', `Official portal URL: ${url}`);
    }
  };

  const filteredNews = news.filter((n) => {
    const matchCat = selectedNewsCategory === 'All' || n.category === selectedNewsCategory;
    const matchSearch =
      !newsSearch.trim() ||
      n.titleEn.toLowerCase().includes(newsSearch.toLowerCase()) ||
      n.titleTa.toLowerCase().includes(newsSearch.toLowerCase()) ||
      n.summaryEn.toLowerCase().includes(newsSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredSchemes = schemes.filter((s) => {
    return selectedSchemeCategory === 'All' || s.category === selectedSchemeCategory;
  });

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerSubtitle}>
          {isTamil
            ? 'அரசு திட்டங்கள், விவசாய செய்திகள் மற்றும் எச்சரிக்கைகள்'
            : 'Verified advisories, market news & government subsidies'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <MaterialCommunityIcons name="translate" size={14} color={Colors.primary} />
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* 3 Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'advisories' && styles.tabItemActive]}
          onPress={() => setActiveTab('advisories')}
        >
          <MaterialCommunityIcons
            name="alert-outline"
            size={18}
            color={activeTab === 'advisories' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'advisories' && styles.tabTextActive]}>
            {isTamil ? 'எச்சரிக்கைகள்' : 'Advisories'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'news' && styles.tabItemActive]}
          onPress={() => setActiveTab('news')}
        >
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={18}
            color={activeTab === 'news' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'news' && styles.tabTextActive]}>
            {isTamil ? 'செய்திகள்' : 'Agri News'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'schemes' && styles.tabItemActive]}
          onPress={() => setActiveTab('schemes')}
        >
          <MaterialCommunityIcons
            name="bank-outline"
            size={18}
            color={activeTab === 'schemes' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'schemes' && styles.tabTextActive]}>
            {isTamil ? 'திட்டங்கள்' : 'Govt Schemes'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching verified agricultural alerts...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: ADVISORIES */}
          {activeTab === 'advisories' && (
            <View>
              {advisories.map((adv, idx) => (
                <View key={idx} style={styles.card}>
                  <View style={styles.advisoryHeader}>
                    <MaterialCommunityIcons
                      name={(adv.icon as any) || 'alert'}
                      size={24}
                      color={adv.severity === 'High' ? '#C62828' : adv.severity === 'Medium' ? '#EF6C00' : '#2E7D32'}
                    />
                    <View style={styles.advisoryTitleCol}>
                      <Text style={styles.advisoryTitle}>
                        {isTamil ? adv.titleTa : adv.titleEn}
                      </Text>
                      <View style={styles.severityTag}>
                        <Text style={styles.severityTagText}>{adv.severity} Priority • {adv.category}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.advisoryDesc}>
                    {isTamil ? adv.detailTa : adv.detailEn}
                  </Text>
                </View>
              ))}

              <View style={styles.infoBanner}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color="#2E7D32" />
                <Text style={styles.infoBannerText}>
                  Advisories compiled from TNAU & Regional IMD Agromet bulletins.
                </Text>
              </View>
            </View>
          )}

          {/* TAB 2: AGRI NEWS */}
          {activeTab === 'news' && (
            <View>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={isTamil ? 'செய்திகளை தேட...' : 'Search agriculture news...'}
                  placeholderTextColor={Colors.textMuted}
                  value={newsSearch}
                  onChangeText={setNewsSearch}
                />
              </View>

              {/* Category Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['All', 'Govt', 'Market', 'Weather', 'Schemes', 'Tech'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, selectedNewsCategory === cat && styles.catChipActive]}
                    onPress={() => setSelectedNewsCategory(cat)}
                  >
                    <Text style={[styles.catChipText, selectedNewsCategory === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredNews.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, item.isBreaking && styles.breakingCard]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedNewsDetail(item)}
                >
                  {item.isBreaking && (
                    <View style={styles.breakingHeader}>
                      <MaterialCommunityIcons name="flash" size={14} color="#D32F2F" />
                      <Text style={styles.breakingText}>BREAKING BULLETIN</Text>
                    </View>
                  )}
                  <Text style={styles.newsTitle}>{isTamil ? item.titleTa : item.titleEn}</Text>
                  <Text style={styles.newsSummary} numberOfLines={2}>
                    {isTamil ? item.summaryTa : item.summaryEn}
                  </Text>

                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{item.source}</Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB 3: GOVT SCHEMES */}
          {activeTab === 'schemes' && (
            <View>
              {/* Category Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['All', 'Subsidy', 'Insurance', 'Loan', 'Training'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, selectedSchemeCategory === cat && styles.catChipActive]}
                    onPress={() => setSelectedSchemeCategory(cat)}
                  >
                    <Text style={[styles.catChipText, selectedSchemeCategory === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredSchemes.map((scheme) => (
                <View key={scheme.id} style={styles.card}>
                  <View style={styles.schemeHeader}>
                    <View style={styles.schemeBadge}>
                      <Text style={styles.schemeBadgeText}>{scheme.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.schemeTitle}>{isTamil ? scheme.titleTa : scheme.titleEn}</Text>
                  </View>

                  <View style={styles.schemeBody}>
                    <Text style={styles.schemeLabel}>{isTamil ? 'தகுதி வரம்பு:' : 'Eligibility:'}</Text>
                    <Text style={styles.schemeDesc}>{isTamil ? scheme.eligibilityTa : scheme.eligibilityEn}</Text>

                    <Text style={[styles.schemeLabel, { marginTop: 6 }]}>{isTamil ? 'திட்ட பயன்கள்:' : 'Financial Benefits:'}</Text>
                    <Text style={styles.schemeDesc}>{isTamil ? scheme.benefitTa : scheme.benefitEn}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.portalButton}
                    onPress={() => handleOpenLink(scheme.officialPortal)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="open-in-new" size={16} color={Colors.white} />
                    <Text style={styles.portalButtonText}>
                      {isTamil ? 'அதிகாரப்பூர்வ போர்ட்டலில் விண்ணப்பிக்க' : 'Apply on Official Portal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* News Detail Modal */}
      {selectedNewsDetail && (
        <Modal
          visible={Boolean(selectedNewsDetail)}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedNewsDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalCategory}>{selectedNewsDetail.category.toUpperCase()} NEWS</Text>
                <TouchableOpacity onPress={() => setSelectedNewsDetail(null)}>
                  <MaterialCommunityIcons name="close-circle" size={26} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>
                {isTamil ? selectedNewsDetail.titleTa : selectedNewsDetail.titleEn}
              </Text>

              <View style={styles.modalMetaRow}>
                <Text style={styles.modalSource}>{selectedNewsDetail.source}</Text>
                <Text style={styles.modalDate}>{selectedNewsDetail.date}</Text>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalBody}>
                {isTamil ? selectedNewsDetail.summaryTa : selectedNewsDetail.summaryEn}
              </Text>

              <View style={styles.verifiedNotice}>
                <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.primary} />
                <Text style={styles.verifiedNoticeText}>Verified Tamil Nadu Agricultural Dispatch</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSubtitle: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  advisoryHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  advisoryTitleCol: {
    flex: 1,
  },
  advisoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  severityTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  severityTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  advisoryDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: Spacing.sm + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginTop: Spacing.xs,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#1B5E20',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm + 4,
    height: 42,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  catChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  breakingCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  breakingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  newsSource: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  schemeHeader: {
    marginBottom: Spacing.sm,
  },
  schemeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  schemeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  schemeBody: {
    marginBottom: Spacing.md,
  },
  schemeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  schemeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  portalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  portalButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalSource: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  modalBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  verifiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F8E9',
    padding: Spacing.sm,
    borderRadius: 8,
  },
  verifiedNoticeText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
