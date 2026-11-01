import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { addWarehouse } from '../../services/warehouseService';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
}

const TN_DISTRICT_PRESETS: LocationPreset[] = [
  { name: 'Trichy APMC Corridors', lat: 10.7905, lng: 78.7047 },
  { name: 'Thanjavur Delta Granary', lat: 10.7867, lng: 79.1378 },
  { name: 'Madurai Cold Storage Belt', lat: 9.9252, lng: 78.1198 },
  { name: 'Erode Turmeric Agro Hub', lat: 11.341, lng: 77.7172 },
  { name: 'Salem Agri Logistics', lat: 11.6643, lng: 78.146 },
  { name: 'Coimbatore Wholesale Hub', lat: 11.0168, lng: 76.9558 },
  { name: 'Chennai Koyambedu Terminal', lat: 13.0827, lng: 80.2707 },
  { name: 'Dindigul Onion & Grain Depot', lat: 10.3673, lng: 77.9803 },
];

export const AddWarehouseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [warehouseName, setWarehouseName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [availableSpace, setAvailableSpace] = useState('');
  const [ratePerDay, setRatePerDay] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('10.7905');
  const [longitude, setLongitude] = useState('78.7047');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectPreset = (preset: LocationPreset) => {
    setLocation(preset.name);
    setLatitude(preset.lat.toFixed(4));
    setLongitude(preset.lng.toFixed(4));
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseName.trim()) {
      Alert.alert('Validation Error', 'Please enter a facility or warehouse name.');
      return;
    }
    const capNum = Number(capacity);
    if (!capNum || capNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid total capacity in metric tons.');
      return;
    }
    const rateNum = Number(ratePerDay);
    if (!rateNum || rateNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid daily storage rate (₹/ton).');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter or select a facility location.');
      return;
    }

    const availNum = availableSpace.trim() ? Number(availableSpace) : capNum;

    try {
      setSubmitting(true);
      await addWarehouse({
        warehouseName: warehouseName.trim(),
        capacity: capNum,
        availableSpace: availNum,
        ratePerDay: rateNum,
        location: location.trim(),
        latitude: Number(latitude) || 10.7905,
        longitude: Number(longitude) || 78.7047,
      });

      setSubmitting(false);
      Alert.alert('Success', 'Storage facility registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setSubmitting(false);
      showFirestoreErrorAlert('Save Error', err, 'Failed to save warehouse.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <MaterialCommunityIcons name="office-building" size={28} color={Colors.white} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Register Storage Facility</Text>
          <Text style={styles.bannerSub}>
            Publish warehouse slots and cold storage facilities for farmers across Tamil Nadu.
          </Text>
        </View>
      </View>

      {/* Facility Name */}
      <Text style={styles.fieldLabel}>Warehouse / Facility Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Trichy Agri Cold Storage Unit 1"
        placeholderTextColor={Colors.textSecondary}
        value={warehouseName}
        onChangeText={setWarehouseName}
      />

      {/* Capacities */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Total Capacity (Tons) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={capacity}
            onChangeText={(txt) => {
              setCapacity(txt);
              if (!availableSpace) setAvailableSpace(txt);
            }}
          />
        </View>

        <View style={styles.colSpacing} />

        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Available Space (Tons)</Text>
          <TextInput
            style={styles.input}
            placeholder="Default: Total"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={availableSpace}
            onChangeText={setAvailableSpace}
          />
        </View>
      </View>

      {/* Rate per Day */}
      <Text style={styles.fieldLabel}>Storage Rate per Ton / Day (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 50"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="numeric"
        value={ratePerDay}
        onChangeText={setRatePerDay}
      />

      {/* Location Presets */}
      <Text style={styles.fieldLabel}>Quick Regional Presets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {TN_DISTRICT_PRESETS.map((p) => (
          <TouchableOpacity
            key={p.name}
            style={[
              styles.presetChip,
              location === p.name && styles.presetChipActive,
            ]}
            onPress={() => handleSelectPreset(p)}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={location === p.name ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.presetChipText,
                location === p.name && styles.presetChipTextActive,
              ]}
            >
              {p.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location Address */}
      <Text style={styles.fieldLabel}>Facility Address / Area *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. NH 45 Bypass, Golden Rock, Trichy"
        placeholderTextColor={Colors.textSecondary}
        value={location}
        onChangeText={setLocation}
      />

      {/* GPS Coordinates */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Latitude</Text>
          <TextInput
            style={styles.input}
            placeholder="10.7905"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={latitude}
            onChangeText={setLatitude}
          />
        </View>

        <View style={styles.colSpacing} />

        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Longitude</Text>
          <TextInput
            style={styles.input}
            placeholder="78.7047"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={longitude}
            onChangeText={setLongitude}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSaveWarehouse}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="content-save-check" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Storage Facility</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.m,
    paddingBottom: Spacing.xl,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#E65100',
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    alignItems: 'center',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.s,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: Spacing.m,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  colSpacing: {
    width: Spacing.s,
  },
  presetScroll: {
    marginBottom: Spacing.s,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    gap: 4,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  presetChipTextActive: {
    color: Colors.white,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.l,
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
