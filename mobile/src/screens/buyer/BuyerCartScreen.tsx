import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { RoleGuard } from '../../components/RoleGuard';
import { getFirebaseFirestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CartItem {
  id: string;
  name: string;
  variety: string;
  farmer: string;
  quantityBags: number;
  weightKg: number;
  pricePerKg: number;
  location: string;
}

export const BuyerCartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  // Initial cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart_item_1',
      name: 'Organic Ponni Paddy (Grade A)',
      variety: 'BPT 5204 Samba',
      farmer: 'K. Muthuvel (Lalgudi Farmer)',
      quantityBags: 20,
      weightKg: 1500,
      pricePerKg: 32,
      location: 'Trichy Mandi Hub',
    },
    {
      id: 'cart_item_2',
      name: 'Erode Turmeric Finger Bulbs',
      variety: 'Salem Local Double Polish',
      farmer: 'S. Ramanathan (Kodumudi)',
      quantityBags: 8,
      weightKg: 400,
      pricePerKg: 125,
      location: 'Erode Regulated Market',
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantityBags + delta);
            const bagWeight = item.weightKg / item.quantityBags;
            return {
              ...item,
              quantityBags: newQty,
              weightKg: Math.round(newQty * bagWeight),
            };
          }
          return item;
        })
        .filter((item) => item.quantityBags > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.weightKg * item.pricePerKg,
    0
  );
  const mandiTax = Math.round(subtotal * 0.01);
  const totalAmount = subtotal + mandiTax;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }

    Alert.alert(
      'Proceed to Checkout',
      `Confirm purchase order of ${cartItems.length} lot(s) totaling ₹${totalAmount.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Order',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              const db = getFirebaseFirestore();

              // Persist each cart order to Firestore 'orders' collection
              for (const item of cartItems) {
                await addDoc(collection(db, 'orders'), {
                  buyerId: user.uid,
                  buyerEmail: user.email || '',
                  sellerId: (item as any).farmerId || (item as any).sellerId || '',
                  farmerId: (item as any).farmerId || (item as any).sellerId || '',
                  cropName: item.name,
                  variety: item.variety,
                  farmerName: item.farmer,
                  rate: item.pricePerKg,
                  quantity: item.weightKg,
                  unit: 'kg',
                  totalAmount: Math.round(item.weightKg * item.pricePerKg * 1.01),
                  location: item.location,
                  status: 'placed',
                  type: 'crop',
                  createdAt: serverTimestamp(),
                });
              }

              setCartItems([]);
              setIsSubmitting(false);

              Alert.alert(
                'Order Placed Successfully! 🌾',
                'Your direct harvest procurement order has been saved and broadcasted to local farmers.',
                [
                  {
                    text: 'View My Orders',
                    onPress: () => navigation.navigate('BuyerOrders'),
                  },
                ]
              );
            } catch (err: any) {
              setIsSubmitting(false);
              console.warn('[BuyerCart] Order placement error:', err.message);
              showFirestoreErrorAlert('Order Error', err, 'Failed to place cart order.');
            }
          },
        },
      ]
    );
  };

  return (
    <RoleGuard allowedRoles={['Buyer', 'Farmer']} screenTitle="Active Cart">
      <View style={styles.container}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cart-outline" size={72} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySub}>
              Discover fresh harvest lots directly from local farmers across Tamil Nadu.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('Marketplace')}
            >
              <MaterialCommunityIcons name="storefront-outline" size={18} color={Colors.white} />
              <Text style={styles.browseBtnText}>Explore Crop Marketplace</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Cart Items List */}
            <Text style={styles.sectionHeader}>Harvest Lots in Cart ({cartItems.length})</Text>

            {cartItems.map((item) => {
              const itemTotal = item.weightKg * item.pricePerKg;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cropName}>{item.name}</Text>
                      <Text style={styles.varietyText}>{item.variety}</Text>
                      <Text style={styles.farmerText}>By: {item.farmer}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.deleteBtn}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C62828" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardMiddle}>
                    <Text style={styles.rateText}>
                      ₹{item.pricePerKg}/kg • Approx {item.weightKg} kg
                    </Text>
                    <Text style={styles.itemTotal}>₹{itemTotal.toLocaleString()}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.bagLabel}>Quantity (Bags):</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <MaterialCommunityIcons name="minus" size={16} color={Colors.textPrimary} />
                      </TouchableOpacity>
                      <Text style={styles.stepVal}>{item.quantityBags}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <MaterialCommunityIcons name="plus" size={16} color={Colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Bill Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Procurement Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mandi Cess & Platform Fee (1%)</Text>
                <Text style={styles.summaryValue}>₹{mandiTax.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.checkoutBtnText}>Proceed to Place Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => navigation.navigate('Marketplace')}
            >
              <Text style={styles.addMoreBtnText}>+ Add More Produce from Marketplace</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  varietyText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  farmerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  rateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  bagLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepVal: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: Spacing.xs,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  addMoreBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  addMoreBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
