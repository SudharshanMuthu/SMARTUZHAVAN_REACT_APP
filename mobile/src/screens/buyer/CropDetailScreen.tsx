import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { RootStackParamList } from '../../types/navigation';
import { CropPost } from '../../types/crop';
import { getCropPostById } from '../../services/cropService';
import { getFirebaseFirestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { sendAppNotification } from '../../services/notificationService';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CropDetail'>;

export const CropDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId, post: initialPost } = route.params;

  const [post, setPost] = useState<CropPost | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [notFound, setNotFound] = useState(false);

  // Order modal states
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('50');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const fetched = await getCropPostById(postId);
        if (isMounted) {
          if (fetched) {
            setPost(fetched);
          } else if (!initialPost) {
            setNotFound(true);
          }
        }
      } catch (err: any) {
        console.warn('[CropDetail] Failed to fetch post:', err?.message || err);
        if (isMounted && !initialPost) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [postId, initialPost]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading produce details...</Text>
      </View>
    );
  }

  if (notFound || !post) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color={Colors.error} />
        <Text style={styles.notFoundTitle}>Produce Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This crop listing may have been sold or removed by the farmer.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rateNumber = parseFloat(String(post.rate).replace(/[^0-9.]/g, '')) || 0;
  const rateDisplay = rateNumber > 0 ? rateNumber.toFixed(0) : String(post.rate);
  const qtyNumber = parseFloat(quantity) || 0;
  const calculatedTotal = (rateNumber * qtyNumber).toFixed(0);

  const { user } = useAuth();

  const handlePlaceOrder = async () => {
    if (qtyNumber <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid harvest quantity in kg.');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place procurement orders.');
      return;
    }

    try {
      setIsSubmitting(true);
      const db = getFirebaseFirestore();

      // 1. Write order to 'orders' collection
      const orderData = {
        buyerId: user.uid,
        buyerEmail: user.email || '',
        sellerId: post.userId || '',
        farmerId: post.userId || '',
        farmerName: post.userName || 'Producer',
        cropId: post.id || '',
        cropName: post.cropName || '',
        rate: rateNumber,
        quantity: qtyNumber,
        unit: 'kg',
        totalAmount: parseFloat(calculatedTotal),
        location: post.location || '',
        notes: deliveryNotes.trim(),
        status: 'placed',
        type: 'crop',
        items: [
          {
            cropName: post.cropName,
            rate: rateNumber,
            quantity: qtyNumber,
            total: parseFloat(calculatedTotal),
          },
        ],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // 2. Send notification to farmer if farmerId is present
      if (post.userId) {
        try {
          await sendAppNotification({
            userId: post.userId,
            title: `New Order: ${post.cropName}`,
            body: `${user.email || 'A verified buyer'} placed an order for ${qtyNumber} kg of ${post.cropName} (₹${calculatedTotal}).`,
            type: 'order',
          });
        } catch (notifErr) {
          console.warn('[CropDetail] Notification dispatch error:', notifErr);
        }
      }

      setOrderModalVisible(false);
      setIsSubmitting(false);

      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your direct farm order #${docRef.id.slice(0, 6)} for ${qtyNumber} kg of ${post.cropName} (₹${calculatedTotal}) has been dispatched to the farmer.`,
        [
          {
            text: 'View My Orders',
            onPress: () => navigation.navigate('BuyerOrders'),
          },
          {
            text: 'Done',
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      console.warn('[CropDetail] Order placement failed:', err.message);
      setIsSubmitting(false);
      showFirestoreErrorAlert('Order Failed', err, 'Could not place order. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Crop Hero Banner */}
        <View style={styles.heroContainer}>
          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderBanner}>
              <MaterialCommunityIcons name="sprout" size={72} color={Colors.primary} />
            </View>
          )}
          {post.quality && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>Quality Grade: {post.quality}</Text>
            </View>
          )}
        </View>

        {/* Title & Location Section */}
        <View style={styles.infoCard}>
          <Text style={styles.cropTitle}>{post.cropName}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>{post.location}, Tamil Nadu</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="currency-inr" size={24} color={Colors.primary} />
            <Text style={styles.metricLabel}>Price / Rate</Text>
            <Text style={styles.metricValue}>₹{rateDisplay}</Text>
            <Text style={styles.metricSub}>per kilogram</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="scale" size={24} color="#1565C0" />
            <Text style={styles.metricLabel}>Available Stock</Text>
            <Text style={styles.metricValue}>{post.capacity}</Text>
            <Text style={styles.metricSub}>total harvest quantity</Text>
          </View>
        </View>

        {/* Farmer Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Seller Information</Text>
          <View style={styles.farmerRow}>
            <View style={styles.farmerAvatar}>
              <MaterialCommunityIcons name="account" size={26} color={Colors.primary} />
            </View>
            <View style={styles.farmerDetails}>
              <Text style={styles.farmerName}>{post.userName || 'Registered Farmer'}</Text>
              <Text style={styles.farmerSub}>Verified Producer • Direct Farm Dispatch</Text>
            </View>
          </View>
        </View>

        {/* Procurement Guarantee */}
        <View style={styles.guaranteeCard}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#2E7D32" />
          <View style={styles.guaranteeTextContainer}>
            <Text style={styles.guaranteeTitle}>Smart Uzhavan Direct Guarantee</Text>
            <Text style={styles.guaranteeDesc}>
              Zero intermediary commission. Transactions directly connect buyers and farmers.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Unit Price</Text>
          <Text style={styles.footerPriceValue}>₹{rateDisplay} /kg</Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          activeOpacity={0.85}
          onPress={() => setOrderModalVisible(true)}
        >
          <MaterialCommunityIcons name="cart-outline" size={20} color={Colors.white} />
          <Text style={styles.orderButtonText}>Place Order / Inquire</Text>
        </TouchableOpacity>
      </View>

      {/* Real Procurement Order Modal */}
      <Modal
        visible={orderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Place Farm Order</Text>
                <Text style={styles.modalSub}>
                  {post.cropName} • {post.location}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setOrderModalVisible(false)}
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Unit Rate Card */}
              <View style={styles.modalRateRow}>
                <Text style={styles.modalRateLabel}>Direct Farmer Rate:</Text>
                <Text style={styles.modalRateVal}>₹{rateDisplay} / kg</Text>
              </View>

              {/* Quantity Input */}
              <Text style={styles.inputLabel}>Required Quantity (kg)</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => {
                    const current = Math.max(10, qtyNumber - 10);
                    setQuantity(String(current));
                  }}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>

                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={(val) => setQuantity(val.replace(/[^0-9]/g, ''))}
                />

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => {
                    const current = qtyNumber + 10;
                    setQuantity(String(current));
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Quick Select Chips */}
              <View style={styles.chipsRow}>
                {['25', '50', '100', '250', '500'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.chip, quantity === preset && styles.chipActive]}
                    onPress={() => setQuantity(preset)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        quantity === preset && styles.chipTextActive,
                      ]}
                    >
                      {preset} kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Delivery Notes */}
              <Text style={styles.inputLabel}>Delivery Location / Remarks (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. Need delivery at Koyambedu Market next Tuesday"
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={2}
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
              />

              {/* Price Calculation Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>Estimated Total Amount:</Text>
                  <Text style={styles.summaryRowValue}>₹{calculatedTotal}</Text>
                </View>
                <Text style={styles.summaryDisclaimer}>
                  Direct farmer payment upon loading/dispatch or UPI settlement.
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                onPress={handlePlaceOrder}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.white} />
                    <Text style={styles.confirmBtnText}>Confirm Order (₹{calculatedTotal})</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  heroContainer: {
    height: 220,
    backgroundColor: '#E8F5E9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(21, 101, 192, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cropTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  farmerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  guaranteeTextContainer: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  guaranteeDesc: {
    fontSize: 11,
    color: '#388E3C',
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  orderButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    padding: Spacing.md,
    paddingBottom: 30,
  },
  modalRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FBE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6EE9C',
  },
  modalRateLabel: {
    fontSize: 14,
    color: '#33691E',
    fontWeight: '600',
  },
  modalRateVal: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  notesInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 60,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryRowValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  summaryDisclaimer: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
