import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface CategoryItem {
  id: string;
  nameEn: string;
  nameTa: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  itemCount: number;
  active: boolean;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', nameEn: 'Grains & Cereals', nameTa: 'தானியங்கள் (நெல், கேழ்வரகு)', icon: 'barley', itemCount: 18, active: true },
  { id: 'cat-2', nameEn: 'Vegetables', nameTa: 'காய்கறிகள் (தக்காளி, வெங்காயம்)', icon: 'carrot', itemCount: 24, active: true },
  { id: 'cat-3', nameEn: 'Fruits & Plantation', nameTa: 'பழங்கள் (வாழை, மாம்பழம்)', icon: 'fruit-cherries', itemCount: 12, active: true },
  { id: 'cat-4', nameEn: 'Spices & Condiments', nameTa: 'மசாலா பயிர்கள் (மஞ்சள், மிளகு)', icon: 'chili-mild', itemCount: 9, active: true },
  { id: 'cat-5', nameEn: 'Pulses & Legumes', nameTa: 'பயறு வகைகள் (துவரை, உளுந்து)', icon: 'seed', itemCount: 14, active: true },
  { id: 'cat-6', nameEn: 'Commercial Crops', nameTa: 'வணிக பயிர்கள் (கரும்பு, பருத்தி)', icon: 'cash-multiple', itemCount: 7, active: true },
];

export const AdminContentScreen: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [announcementText, setAnnouncementText] = useState<string>(
    'Direct farm-gate procurement active across all 38 districts of Tamil Nadu.'
  );
  const [bannerActive, setBannerActive] = useState<boolean>(true);

  // New category form
  const [newCatEn, setNewCatEn] = useState<string>('');
  const [newCatTa, setNewCatTa] = useState<string>('');

  const loadContent = useCallback(async () => {
    try {
      const data = await adminService.getContent();
      if (data && data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data && data.announcement) {
        setAnnouncementText(data.announcement);
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleAddCategory = () => {
    if (!newCatEn.trim()) {
      Alert.alert('Missing Field', 'Please enter category name in English.');
      return;
    }

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      nameEn: newCatEn.trim(),
      nameTa: newCatTa.trim() || newCatEn.trim(),
      icon: 'sprout',
      itemCount: 0,
      active: true,
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCatEn('');
    setNewCatTa('');
    Alert.alert('Success', `Category "${newCat.nameEn}" added.`);
  };

  const handleSaveAll = async () => {
    try {
      await adminService.saveContent({
        categories,
        announcement: announcementText,
        bannerActive,
      });
      Alert.alert('Configuration Saved', 'App content and categories updated.');
    } catch {
      Alert.alert('Notice', 'App content updated for current demo session.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading app configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner Announcement Control */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#1565C0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Global App Announcement</Text>
            <Text style={styles.sectionSubtitle}>
              Displayed at the top of Farmer & Buyer feeds
            </Text>
          </View>
          <Switch
            value={bannerActive}
            onValueChange={setBannerActive}
            trackColor={{ false: '#CBD5E1', true: '#90CAF9' }}
            thumbColor={bannerActive ? '#1565C0' : '#F1F5F9'}
          />
        </View>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={3}
          value={announcementText}
          onChangeText={setAnnouncementText}
          placeholder="Enter broadcast message..."
          placeholderTextColor={Colors.subtext}
        />
      </View>

      {/* Crop Categories Management */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="tag-multiple-outline" size={20} color="#2E7D32" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Active Crop Categories</Text>
            <Text style={styles.sectionSubtitle}>
              Toggle visibility of produce catalog categories
            </Text>
          </View>
        </View>

        <View style={styles.categoryList}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryRow}>
              <View style={styles.catLeft}>
                <View style={styles.catIconBox}>
                  <MaterialCommunityIcons name={cat.icon} size={20} color="#2E7D32" />
                </View>
                <View>
                  <Text style={styles.catNameEn}>{cat.nameEn}</Text>
                  <Text style={styles.catNameTa}>{cat.nameTa}</Text>
                </View>
              </View>
              <Switch
                value={cat.active}
                onValueChange={() => toggleCategory(cat.id)}
                trackColor={{ false: '#CBD5E1', true: '#A5D6A7' }}
                thumbColor={cat.active ? '#2E7D32' : '#F1F5F9'}
              />
            </View>
          ))}
        </View>

        {/* Add new category inline */}
        <View style={styles.newCatBlock}>
          <Text style={styles.newCatLabel}>Add New Crop Category</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Category Name in English (e.g. Organic Millets)"
            placeholderTextColor={Colors.subtext}
            value={newCatEn}
            onChangeText={setNewCatEn}
          />
          <TextInput
            style={styles.formInput}
            placeholder="பிரிவு பெயர் தமிழில் (e.g. சிறுதானியங்கள்)"
            placeholderTextColor={Colors.subtext}
            value={newCatTa}
            onChangeText={setNewCatTa}
          />
          <TouchableOpacity
            style={styles.addCatBtn}
            onPress={handleAddCategory}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addCatBtnText}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSaveAll}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="content-save-check" size={20} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>Save App Configurations</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: Spacing.m,
    gap: Spacing.m,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.subtext,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: Spacing.m,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },
  categoryList: {
    gap: Spacing.s,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    flex: 1,
  },
  catIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catNameEn: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  catNameTa: {
    fontSize: 11,
    color: Colors.subtext,
    marginTop: 1,
  },
  newCatBlock: {
    marginTop: Spacing.m,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: Spacing.s,
  },
  newCatLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: Spacing.m,
    height: 44,
    fontSize: 13,
    color: Colors.text,
  },
  addCatBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    height: 42,
    borderRadius: 10,
    gap: 6,
  },
  addCatBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    height: 50,
    borderRadius: 12,
    gap: 8,
    marginBottom: Spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
});
