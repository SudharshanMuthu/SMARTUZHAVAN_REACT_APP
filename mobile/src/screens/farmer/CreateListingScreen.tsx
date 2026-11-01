import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { createCropPost, updateCropPost } from '../../services/cropService';
import { getFriendlyErrorMessage } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateListing'>;

const COMMON_CROPS = [
  'Paddy',
  'Tomato',
  'Onion',
  'Brinjal',
  'Chilli',
  'Banana',
  'Groundnut',
  'Sugarcane',
  'Cotton',
];

const COMMON_LOCATIONS = [
  'Trichy',
  'Chennai',
  'Erode',
  'Madurai',
  'Salem',
  'Coimbatore',
  'Nagercoil',
];

const QUALITY_GRADES = ['A', 'B', 'Organic', 'Export'];

export const CreateListingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { user, userProfile } = useAuth();
  const postToEdit = route.params?.postToEdit;
  const isEditing = Boolean(postToEdit);

  const [cropName, setCropName] = useState(postToEdit?.cropName || '');
  const [capacity, setCapacity] = useState(postToEdit?.capacity || '');
  const [rate, setRate] = useState(
    postToEdit?.rate ? String(postToEdit.rate).replace(/[^0-9.]/g, '') : ''
  );
  const [quality, setQuality] = useState(postToEdit?.quality || 'A');
  const [location, setLocation] = useState(postToEdit?.location || 'Trichy');
  const [imageUrl, setImageUrl] = useState(postToEdit?.imageUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!cropName.trim()) {
      setErrorMessage('Please enter or select a crop name.');
      return;
    }
    if (!capacity.trim()) {
      setErrorMessage('Please enter quantity / capacity (e.g., 500 Kg or 2 Ton).');
      return;
    }
    if (!rate.trim() || isNaN(Number(rate))) {
      setErrorMessage('Please enter a valid numeric rate per kg (₹).');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please select or specify a location.');
      return;
    }

    if (!user) {
      Alert.alert('Session Error', 'You must be logged in to post crops.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && postToEdit?.id) {
        await updateCropPost(postToEdit.id, {
          cropName: cropName.trim(),
          capacity: capacity.trim(),
          rate: rate.trim(),
          quality: quality.trim(),
          location: location.trim(),
          imageUrl: imageUrl.trim() || null,
        });
        Alert.alert('Success', 'Listing updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createCropPost(user.uid, userProfile?.name || user.email || 'Farmer', {
          cropName: cropName.trim(),
          capacity: capacity.trim(),
          rate: rate.trim(),
          quality: quality.trim(),
          location: location.trim(),
          imageUrl: imageUrl.trim() || null,
        });
        Alert.alert('Success', 'Crop listing published to marketplace!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      console.warn('[CreateListing] Error saving post:', err.message);
      setErrorMessage(getFriendlyErrorMessage(err, 'Failed to save listing. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBox}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Crop Listing' : 'Publish Crop Harvest'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? 'Update your produce details in the buyer marketplace.'
              : 'List your harvested produce directly to buyers across Tamil Nadu.'}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Crop Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Crop Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Paddy, Tomato, Onion"
            placeholderTextColor={Colors.textTertiary}
            value={cropName}
            onChangeText={setCropName}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {COMMON_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[styles.chip, cropName === crop && styles.chipActive]}
                onPress={() => setCropName(crop)}
              >
                <Text style={[styles.chipText, cropName === crop && styles.chipTextActive]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Capacity */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Available Quantity / Capacity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500 Kg, 2 Ton, 100 Bags"
            placeholderTextColor={Colors.textTertiary}
            value={capacity}
            onChangeText={setCapacity}
          />
        </View>

        {/* Rate per kg */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Rate per Kg (₹) *</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.inputInner}
              placeholder="e.g. 25"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={rate}
              onChangeText={setRate}
            />
          </View>
        </View>

        {/* Quality Grade */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Quality Grade</Text>
          <View style={styles.chipsRow}>
            {QUALITY_GRADES.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[styles.chip, quality === grade && styles.chipActive]}
                onPress={() => setQuality(grade)}
              >
                <Text style={[styles.chipText, quality === grade && styles.chipTextActive]}>
                  {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Market Location / Mandi *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location or pick below"
            placeholderTextColor={Colors.textTertiary}
            value={location}
            onChangeText={setLocation}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {COMMON_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[styles.chip, location === loc && styles.chipActive]}
                onPress={() => setLocation(loc)}
              >
                <Text style={[styles.chipText, location === loc && styles.chipTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Image URL (Optional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Image URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/crop.jpg"
            placeholderTextColor={Colors.textTertiary}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Direct image upload will connect with Firebase Storage in upcoming enhancements.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name={isEditing ? 'content-save-edit' : 'plus-circle'}
                size={20}
                color={Colors.white}
              />
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Listing' : 'Publish Listing'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  headerBox: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  chipsScroll: {
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
