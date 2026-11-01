import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { FarmToolProduct, ToolCategory } from '../../types/farmtools';
import { fetchFarmTools } from '../../services/farmToolsService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmToolsHome'>;

interface CategoryTab {
  id: ToolCategory;
  label: string;
  labelTa: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All Tools', labelTa: 'அனைத்தும்', icon: 'view-grid-outline' },
  { id: 'hand_tools', label: 'Hand Tools', labelTa: 'கைக்கருவிகள்', icon: 'shovel' },
  { id: 'tractor_parts', label: 'Tractor Spares', labelTa: 'டிராக்டர் உதிரிபாகம்', icon: 'tractor' },
  { id: 'irrigation', label: 'Irrigation & Pumps', labelTa: 'பாசன கருவிகள்', icon: 'water-pump' },
  { id: 'machinery', label: 'Machinery & Sprayers', labelTa: 'விவசாய இயந்திரம்', icon: 'engine-outline' },
  { id: 'hardware', label: 'Hardware', labelTa: 'வன்பொருள்', icon: 'hammer-wrench' },
  { id: 'smart_tech', label: 'Smart IoT Tech', labelTa: 'ஸ்மார்ட் சென்சார்', icon: 'access-point-network' },
];

export const FarmToolsHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tools, setTools] = useState<FarmToolProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isTamil, setIsTamil] = useState(false);

  useEffect(() => {
    loadTools();
  }, [selectedCategory]);

  const loadTools = async () => {
    setLoading(true);
    try {
      const data = await fetchFarmTools(selectedCategory, searchQuery);
      setTools(data);
    } catch (err) {
      console.warn('[FarmToolsHome] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTools();
  };

  const toggleCompare = (toolId: string) => {
    if (compareList.includes(toolId)) {
      setCompareList((prev) => prev.filter((id) => id !== toolId));
    } else {
      if (compareList.length >= 4) {
        Alert.alert(
          'Comparison Limit Reached',
          'You can compare up to 4 farm tools or tractor parts at a time.'
        );
        return;
      }
      setCompareList((prev) => [...prev, toolId]);
    }
  };

  const renderToolItem = ({ item }: { item: FarmToolProduct }) => {
    const isCompared = compareList.includes(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{item.brand}</Text>
          </View>

          {item.isGovtSubsidized && (
            <View style={styles.subsidyBadge}>
              <MaterialCommunityIcons name="seal" size={12} color="#1B5E20" />
              <Text style={styles.subsidyText}>Govt Subsidy Eligible</Text>
            </View>
          )}
        </View>

        <Text style={styles.toolName}>{isTamil ? item.nameTa : item.name}</Text>
        <Text style={styles.subCategory}>{item.subCategory}</Text>

        {/* Tractor Compatibility Indicator (Requirement B) */}
        {item.isTractorPart && (
          <View
            style={[
              styles.compatibilityRow,
              item.isCompatibilityVerified
                ? styles.compatibilityVerified
                : styles.compatibilityUnverified,
            ]}
          >
            <MaterialCommunityIcons
              name={item.isCompatibilityVerified ? 'check-decagram' : 'alert-circle-outline'}
              size={14}
              color={item.isCompatibilityVerified ? '#1565C0' : '#E65100'}
            />
            <Text
              style={[
                styles.compatibilityText,
                { color: item.isCompatibilityVerified ? '#1565C0' : '#E65100' },
              ]}
              numberOfLines={1}
            >
              {item.isCompatibilityVerified
                ? `Fits: ${item.tractorBrand} (${item.partNumber})`
                : 'Compatibility not verified by OEM'}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
            <Text style={styles.quantityText}>/ {item.quantityOrSize}</Text>
          </View>
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{item.unitPrice}</Text>
          </View>
        </View>

        <View style={styles.sellerRow}>
          <MaterialCommunityIcons name="store-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.sellerText} numberOfLines={1}>
            {item.sellerName} • {item.location}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.compareBtn, isCompared && styles.compareBtnActive]}
            onPress={() => toggleCompare(item.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isCompared ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={18}
              color={isCompared ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.compareBtnText, isCompared && styles.compareBtnTextActive]}>
              {isCompared ? 'Comparing' : 'Compare'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('FarmToolDetail', { toolId: item.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View Specs</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Search & Machinery Rental Pill */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search spade, filters, drip, sprayers, sensors..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadTools();
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.rentalPill}
            onPress={() => navigation.navigate('EquipmentRental')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="tractor" size={16} color="#E65100" />
            <Text style={styles.rentalPillText}>Rent Tractor, Harvester & Rotavators</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#E65100" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setIsTamil((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>{isTamil ? 'ENG' : 'தமிழ்'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Machinery Custom Hiring Center Info Banner */}
      <View style={styles.infoBanner}>
        <MaterialCommunityIcons name="cog-sync" size={18} color="#00796B" />
        <Text style={styles.infoBannerText}>
          {isTamil
            ? 'அங்கீகரிக்கப்பட்ட விவசாய கருவிகள், டிராக்டர் அசல் உதிரிபாகங்கள் & மானிய உபகரணங்கள்.'
            : 'Certified Farm Tools, Tractor Spares with OEM compatibility & subsidized implements.'}
        </Text>
      </View>

      {/* Categories Horizontal Carousel */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={16}
                  color={isSelected ? Colors.white : Colors.textPrimary}
                />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {isTamil ? item.labelTa : item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Tools List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching farm tools & equipment...</Text>
        </View>
      ) : (
        <FlatList
          data={tools}
          keyExtractor={(item) => item.id}
          renderItem={renderToolItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="tools" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Equipment Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or selecting a different tool category.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Compare Action Bar */}
      {compareList.length > 0 && (
        <View style={styles.compareBar}>
          <View style={styles.compareInfo}>
            <View style={styles.compareCountBadge}>
              <Text style={styles.compareCountText}>{compareList.length}</Text>
            </View>
            <Text style={styles.compareBarLabel}>
              {compareList.length === 1
                ? 'Select 1 more item to compare'
                : `${compareList.length} tools selected`}
            </Text>
          </View>

          <View style={styles.compareActions}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setCompareList([])}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compareSubmitBtn, compareList.length < 2 && styles.btnDisabled]}
              disabled={compareList.length < 2}
              onPress={() => navigation.navigate('ToolCompare', { toolIds: compareList })}
            >
              <MaterialCommunityIcons name="scale-balance" size={18} color={Colors.white} />
              <Text style={styles.compareSubmitText}>Compare Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  rentalPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  rentalPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
    flex: 1,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#B2DFDB',
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#004D40',
    fontWeight: '600',
    lineHeight: 15,
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  subsidyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  subsidyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  toolName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  subCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 6,
  },
  compatibilityVerified: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  compatibilityUnverified: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  compatibilityText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  quantityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  unitBadge: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  sellerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  compareBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  compareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  compareBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailsBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // Compare Floating Bar
  compareBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  compareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareCountBadge: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  compareBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  compareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  compareSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  compareSubmitText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
