import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../types/navigation';
import { CropHealthResult } from '../../types/ai';
import { analyzeCropHealth } from '../../services/aiService';
import { DemoDataBadge } from '../../components/DemoDataBadge';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CropHealthScanner'>;

const COMMON_CROPS = ['Tomato', 'Paddy', 'Chilli', 'Brinjal', 'Sugarcane', 'Banana', 'Cotton'];

export const CropHealthScannerScreen: React.FC<Props> = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<CropHealthResult | null>(null);
  const [isTamil, setIsTamil] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          useCamera
            ? 'Camera permission is required to capture crop leaf photos.'
            : 'Gallery permission is required to select crop leaf photos.'
        );
        return;
      }

      const pickerResult = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
          });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setSelectedImage(asset.uri);
        setImageBase64(asset.base64 || null);
        setResult(null); // Clear previous results
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick image: ' + err.message);
    }
  };

  const handleUseSampleLeaf = () => {
    setSelectedCrop('Tomato');
    setSelectedImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80');
    setImageBase64(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('Image Required', 'Please capture or select a photo of the affected plant leaf first.');
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const diagnosis = await analyzeCropHealth(
        imageBase64 || undefined,
        'image/jpeg',
        selectedCrop,
        isTamil ? 'ta' : 'en'
      );
      setResult(diagnosis);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Could not complete image analysis.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Language Toggle */}
      <View style={styles.langBar}>
        <Text style={styles.headerSubtitle}>
          {isTamil
            ? 'இலை படத்தை பதிவேற்றி பூச்சி மற்றும் நோயை கண்டறியவும்'
            : 'Capture or upload affected leaf photo for instant diagnostic insights'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Crop Selector Chips */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>
          {isTamil ? 'பயிரைத் தேர்ந்தெடுக்கவும்:' : 'Select Target Crop:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {COMMON_CROPS.map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[styles.chip, selectedCrop === crop && styles.chipActive]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text style={[styles.chipText, selectedCrop === crop && styles.chipTextActive]}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Image Preview / Placeholder */}
      <View style={styles.imageCard}>
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => {
                setSelectedImage(null);
                setImageBase64(null);
                setResult(null);
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={26} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <MaterialCommunityIcons name="leaf" size={56} color="#A5D6A7" />
            <Text style={styles.placeholderTitle}>
              {isTamil ? 'இலை புகைப்படம் தேவை' : 'No Leaf Photo Selected'}
            </Text>
            <Text style={styles.placeholderSubtitle}>
              {isTamil
                ? 'நேரடியாக பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தை எடுக்கவும்'
                : 'Take a clear close-up picture of the affected crop leaf'}
            </Text>
          </View>
        )}
      </View>

      {/* Camera & Gallery Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => pickImage(false)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="image-multiple" size={20} color={Colors.primary} />
          <Text style={styles.mediaButtonText}>
            {isTamil ? 'கேலரி' : 'Upload Gallery'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => pickImage(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.mediaButtonText}>
            {isTamil ? 'கேமரா' : 'Take Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Demo Sample Button for Review */}
      <TouchableOpacity
        style={styles.sampleButton}
        onPress={handleUseSampleLeaf}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="flask-outline" size={16} color="#B45309" />
        <Text style={styles.sampleButtonText}>
          {isTamil ? 'சோதனை மாதிரி இலை (டெமோ)' : 'Try Sample Tomato Leaf (Demo)'}
        </Text>
      </TouchableOpacity>

      {/* Analyze Button */}
      <TouchableOpacity
        style={[styles.analyzeButton, (!selectedImage || isScanning) && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={!selectedImage || isScanning}
        activeOpacity={0.85}
      >
        {isScanning ? (
          <View style={styles.scanningRow}>
            <ActivityIndicator size="small" color={Colors.white} />
            <Text style={styles.analyzeButtonText}>
              {isTamil ? 'AI பகுப்பாய்வு நடக்கிறது...' : 'Analyzing Leaf Image...'}
            </Text>
          </View>
        ) : (
          <View style={styles.scanningRow}>
            <MaterialCommunityIcons name="magnify-scan" size={22} color={Colors.white} />
            <Text style={styles.analyzeButtonText}>
              {isTamil ? 'பகுப்பாய்வு செய்' : 'Diagnose Crop Health'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Analysis Result Card */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#2E7D32" />
            <Text style={styles.resultTitle}>
              {isTamil ? 'AI மருத்துவ அறிக்கை' : 'Diagnostic Analysis Result'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Issue & Severity */}
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{isTamil ? 'பயிர்' : 'Crop'}</Text>
              <Text style={styles.metricValue}>{result.crop}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>{isTamil ? 'தீவிரத்தன்மை' : 'Severity'}</Text>
              <View
                style={[
                  styles.severityBadge,
                  result.severity === 'High'
                    ? styles.severityHigh
                    : result.severity === 'Medium'
                    ? styles.severityMed
                    : styles.severityLow,
                ]}
              >
                <Text style={styles.severityText}>{result.severity}</Text>
              </View>
            </View>
          </View>

          <View style={styles.issueBox}>
            <Text style={styles.issueLabel}>{isTamil ? 'கண்டறியப்பட்ட பிரச்சனை:' : 'Detected Issue:'}</Text>
            <Text style={styles.issueTitle}>{result.detectedIssue}</Text>
          </View>

          {/* Symptoms */}
          {result.symptoms && result.symptoms.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                {isTamil ? 'அறிகுறிகள் (Symptoms):' : 'Key Symptoms:'}
              </Text>
              {result.symptoms.map((s, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Treatments */}
          {result.recommendedTreatment && result.recommendedTreatment.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, { color: '#1B5E20' }]}>
                {isTamil ? 'பரிந்துரைக்கப்பட்ட சிகிச்சை:' : 'Recommended Treatments & Organic Remedies:'}
              </Text>
              {result.recommendedTreatment.map((t, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#2E7D32" />
                  <Text style={styles.bulletText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Preventive Measures */}
          {result.preventiveMeasures && result.preventiveMeasures.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                {isTamil ? 'தடுப்பு முறைகள்:' : 'Preventive Measures:'}
              </Text>
              {result.preventiveMeasures.map((p, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="shield-outline" size={16} color="#0288D1" />
                  <Text style={styles.bulletText}>{p}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Prominent Disclaimer Notice */}
          <View style={styles.disclaimerBox}>
            <MaterialCommunityIcons name="information" size={18} color="#E65100" />
            <Text style={styles.disclaimerText}>
              {result.disclaimer ||
                'Informational AI agricultural guidance only. Confirm with your local Krishi Vigyan Kendra (KVK) or extension officer before chemical treatment.'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  headerSubtitle: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionBox: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 220,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#F1F8E9',
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 8,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  mediaButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingVertical: 9,
    marginBottom: Spacing.md,
  },
  sampleButtonText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  severityLow: {
    backgroundColor: '#E8F5E9',
  },
  severityMed: {
    backgroundColor: '#FFF3E0',
  },
  severityHigh: {
    backgroundColor: '#FFEBEE',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D84315',
  },
  issueBox: {
    backgroundColor: '#FFF8E1',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  issueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57F17',
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginTop: 2,
  },
  detailSection: {
    marginBottom: Spacing.md,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 16,
    color: Colors.primary,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#E65100',
    lineHeight: 15,
  },
});
