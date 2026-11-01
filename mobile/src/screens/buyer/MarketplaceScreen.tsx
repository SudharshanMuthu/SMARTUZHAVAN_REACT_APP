import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { CropPost } from '../../types/crop';
import { subscribeToCropPosts } from '../../services/cropService';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';
import { FeatureNoticeModal } from '../../components/FeatureNoticeModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Marketplace'>;

const LOCATION_FILTERS = ['All', 'Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore'];

export const MarketplaceScreen: React.FC<Props> = ({ navigation }) => {
  const [allPosts, setAllPosts] = useState<CropPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  // Cart notice modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [selectedCropName, setSelectedCropName] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
    }, 3500);

    const unsubscribe = subscribeToCropPosts(
      (posts) => {
        setAllPosts(posts);
        setIsLoading(false);
        setIsRefreshing(false);
        clearTimeout(timeout);
      },
      (error) => {
        console.warn('[Marketplace] Firestore subscription error:', error.message);
        setIsLoading(false);
        setIsRefreshing(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchSearch =
        !searchQuery.trim() ||
        (post.cropName && post.cropName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLocation =
        selectedLocation === 'All' ||
        (post.location && post.location.toLowerCase() === selectedLocation.toLowerCase());

      return matchSearch && matchLocation;
    });
  }, [allPosts, searchQuery, selectedLocation]);

  const handleOpenDetail = (post: CropPost) => {
    navigation.navigate('CropDetail', {
      postId: post.id,
      post,
    });
  };

  const handleQuickAdd = (post: CropPost) => {
    navigation.navigate('CropDetail', {
      postId: post.id,
      post,
    });
  };

  const renderCropCard = ({ item }: { item: CropPost }) => {
    const rateDisplay = String(item.rate).replace(/[^0-9.]/g, '') || item.rate;
    const hasImage = item.imageUrl && !imageFailed[item.id];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleOpenDetail(item)}
      >
        <View style={styles.cardImageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: item.imageUrl! }}
              style={styles.cardImage}
              resizeMode="cover"
              onError={() => setImageFailed((prev) => ({ ...prev, [item.id]: true }))}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="leaf" size={36} color={Colors.primary} />
            </View>
          )}
          {item.quality && (
            <View style={styles.qualityTag}>
              <Text style={styles.qualityTagText}>Grade {item.quality}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cropTitle} numberOfLines={1}>
            {item.cropName}
          </Text>

          <View style={styles.locationBadge}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.locationBadgeText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {item.isDemo && (
            <View style={{ marginTop: 2, marginBottom: 4 }}>
              <DemoDataBadge isDemo={true} compact />
            </View>
          )}

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>₹{rateDisplay}<Text style={styles.priceUnit}> /kg</Text></Text>
            </View>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText} numberOfLines={1}>
                {item.capacity}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.buyButton}
            activeOpacity={0.8}
            onPress={() => handleQuickAdd(item)}
          >
            <MaterialCommunityIcons name="cart-plus" size={16} color={Colors.white} />
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop or mandi..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Location Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={LOCATION_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.locationChipsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedLocation === item;
            return (
              <TouchableOpacity
                style={[styles.locationChip, isSelected && styles.locationChipActive]}
                onPress={() => setSelectedLocation(item)}
              >
                <Text
                  style={[
                    styles.locationChipText,
                    isSelected && styles.locationChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centerText}>Loading fresh harvest from farmers...</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="storefront-remove-outline" size={56} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No produce found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || selectedLocation !== 'All'
              ? 'Try modifying your search or location filter.'
              : 'No crop listings are currently available in the marketplace.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderCropCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => setIsRefreshing(true)}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* Quick Add Notice Modal */}
      <FeatureNoticeModal
        visible={cartModalVisible}
        title={`Ordering ${selectedCropName}`}
        phase="Phase 8: Order & Cart System"
        description="Full order dispatch, multi-farmer cart aggregation, and verified digital payment fulfillment will be connected in Phase 8."
        iconName="cart-outline"
        onClose={() => setCartModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: Spacing.md,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: 10,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  locationChipsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  locationChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  locationChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  locationChipTextActive: {
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  centerText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  gridContainer: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  card: {
    width: '48.5%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 100,
    backgroundColor: '#E8F5E9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(21, 101, 192, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityTagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: Spacing.sm + 2,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 2,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  capacityBadge: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '50%',
  },
  capacityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#33691E',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
