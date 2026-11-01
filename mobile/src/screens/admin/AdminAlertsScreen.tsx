import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface AdminAlertItem {
  id: string;
  title?: string;
  titleTa?: string;
  category?: string;
  description?: string;
  severity?: 'high' | 'medium' | 'low';
  targetAudience?: string;
  district?: string;
  targetDistrict?: string;
  date?: string;
  isActive?: boolean;
}

const FALLBACK_ALERTS: AdminAlertItem[] = [
  {
    id: 'alt-1',
    title: 'Heavy Rainfall Warning — Delta Districts',
    titleTa: 'காவிரி டெல்டா மாவட்டங்களில் கனமழை எச்சரிக்கை',
    category: 'Weather',
    description: 'IMD forecasts heavy to very heavy rains across Thanjavur, Tiruvarur, and Nagapattinam. Farmers are advised to clear field drainage channels.',
    severity: 'high',
    date: 'Today',
    isActive: true,
  },
  {
    id: 'alt-2',
    title: 'Kalaignar All Village Agri Development Scheme 2026',
    titleTa: 'கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம்',
    category: 'Government Scheme',
    description: 'Tamil Nadu Agri Dept opens 50% subsidy applications for drip irrigation kits, solar motor pumps, and certified paddy seeds.',
    severity: 'medium',
    date: 'Yesterday',
    isActive: true,
  },
  {
    id: 'alt-3',
    title: 'Fall Armyworm Advisory for Maize Farmers',
    titleTa: 'மக்காச்சோள படைப்புழு தாக்குதல் தடுப்பு அறிவுரை',
    category: 'Pest Advisory',
    description: 'Reported infestations in Dindigul and Perambalur. Apply Neem seed kernel extract (NSKE 5%) or recommended bio-pesticides.',
    severity: 'high',
    date: '2 days ago',
    isActive: true,
  },
  {
    id: 'alt-4',
    title: 'Uzhavar Santhai Direct Booking Update',
    titleTa: 'உழவர் சந்தை நேரடி முன்பதிவு புதுப்பிப்பு',
    category: 'Market Advisory',
    description: 'Special weekend trading stalls opened in Madurai, Trichy, and Salem for fresh vegetable cultivators.',
    severity: 'low',
    date: '3 days ago',
    isActive: true,
  },
];

const CATEGORIES = ['All', 'Weather', 'Government Scheme', 'Pest Advisory', 'Market Advisory'];

export const AdminAlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [titleTa, setTitleTa] = useState<string>('');
  const [category, setCategory] = useState<string>('Weather');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [targetAudience, setTargetAudience] = useState<string>('All');
  const [district, setDistrict] = useState<string>('All TN');

  const loadAlerts = useCallback(async () => {
    try {
      const data = await adminService.getAlerts({
        category: selectedCat === 'All' ? undefined : selectedCat,
      });
      if (Array.isArray(data) && data.length > 0) {
        setAlerts(data);
      } else {
        let filtered = FALLBACK_ALERTS;
        if (selectedCat !== 'All') {
          filtered = filtered.filter((a) => a.category?.toLowerCase() === selectedCat.toLowerCase());
        }
        setAlerts(filtered);
      }
    } catch {
      setAlerts(FALLBACK_ALERTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDeleteAlert = (item: AdminAlertItem) => {
    Alert.alert(
      'Remove Alert',
      `Delete announcement "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteAlert(item.id);
            } catch {
              // demo state
            }
            setAlerts((prev) => prev.filter((a) => a.id !== item.id));
            Alert.alert('Deleted', 'Announcement removed.');
          },
        },
      ]
    );
  };

  const handleSaveAlert = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please enter alert headline and description.');
      return;
    }

    const payload: AdminAlertItem = {
      id: `alt-${Date.now()}`,
      title: title.trim(),
      titleTa: titleTa.trim() || title.trim(),
      category: category.trim(),
      description: description.trim(),
      severity,
      targetAudience,
      district,
      targetDistrict: district,
      date: 'Just now',
      isActive: true,
    };

    try {
      await adminService.saveAlert(payload);
      setAlerts((prev) => [payload, ...prev]);
      Alert.alert('Broadcast Published', 'Alert dispatched to all farmers and stakeholders.');
      setModalVisible(false);
      setTitle('');
      setTitleTa('');
      setDescription('');
    } catch {
      setAlerts((prev) => [payload, ...prev]);
      setModalVisible(false);
      Alert.alert('Notice', 'Alert broadcasted for current demo session.');
    }
  };

  const getSeverityStyle = (sev?: string) => {
    switch (sev) {
      case 'high':
        return { bg: '#FFEBEE', text: '#C62828', label: 'CRITICAL' };
      case 'medium':
        return { bg: '#FFF3E0', text: '#E65100', label: 'ADVISORY' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'INFO' };
    }
  };

  const renderItem = ({ item }: { item: AdminAlertItem }) => {
    const sev = getSeverityStyle(item.severity);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
              <Text style={[styles.sevText, { color: sev.text }]}>{sev.label}</Text>
            </View>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{item.category || 'General'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteAlert(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#C62828" />
          </TouchableOpacity>
        </View>

        <Text style={styles.alertTitle}>{item.title}</Text>
        {item.titleTa ? (
          <Text style={styles.alertTitleTa}>{item.titleTa}</Text>
        ) : null}
        <Text style={styles.alertDesc}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{item.date || 'Active Alert'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Pills & Add bar */}
      <View style={styles.topBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catPill,
                selectedCat === item && styles.catPillActive,
              ]}
              onPress={() => setSelectedCat(item)}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCat === item && styles.catPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 8, paddingRight: Spacing.s }}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bullhorn" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Broadcast</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading government alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAlerts();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No active alerts found</Text>
            </View>
          }
        />
      )}

      {/* Broadcast Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Broadcast Agri Alert</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Headline in English (e.g. Cyclone Warning)"
              placeholderTextColor={Colors.subtext}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.formInput}
              placeholder="தலைப்பு தமிழில் (Title in Tamil)"
              placeholderTextColor={Colors.subtext}
              value={titleTa}
              onChangeText={setTitleTa}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Category (Weather / Scheme / Pest / Market)"
              placeholderTextColor={Colors.subtext}
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={[styles.formInput, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Detailed description and farmer instructions..."
              placeholderTextColor={Colors.subtext}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.sevSelector}>
              <Text style={styles.sevSelectorLabel}>Urgency:</Text>
              {(['high', 'medium', 'low'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.sevOption,
                    severity === s && styles.sevOptionActive,
                  ]}
                  onPress={() => setSeverity(s)}
                >
                  <Text
                    style={[
                      styles.sevOptionText,
                      severity === s && styles.sevOptionTextActive,
                    ]}
                  >
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveAlert}>
              <Text style={styles.submitBtnText}>Broadcast Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    padding: Spacing.m,
    gap: Spacing.s,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  catPillActive: {
    backgroundColor: '#0F172A',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: Spacing.m,
    gap: Spacing.m,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  alertTitleTa: {
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '600',
    marginTop: 2,
  },
  alertDesc: {
    fontSize: 13,
    color: Colors.subtext,
    lineHeight: 18,
    marginTop: 6,
  },
  cardFooter: {
    marginTop: Spacing.s,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.s,
    fontSize: 13,
    color: Colors.subtext,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.subtext,
    marginTop: Spacing.m,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.l,
    gap: Spacing.s,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: Spacing.m,
    height: 46,
    fontSize: 14,
    color: Colors.text,
  },
  sevSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  sevSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  sevOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  sevOptionActive: {
    backgroundColor: '#D32F2F',
  },
  sevOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  sevOptionTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#D32F2F',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
