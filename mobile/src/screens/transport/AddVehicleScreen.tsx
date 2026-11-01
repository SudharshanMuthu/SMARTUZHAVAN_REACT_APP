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
import { VehicleType } from '../../types/transport';
import { addVehicle } from '../../services/transportService';
import { showFirestoreErrorAlert } from '../../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VEHICLE_TYPES: VehicleType[] = ['Mini Truck', 'Lorry', 'Tractor', 'Van'];
const LOCATIONS = ['Trichy', 'Chennai', 'Erode', 'Madurai', 'Salem', 'Coimbatore', 'Thanjavur'];

export const AddVehicleScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('Mini Truck');
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ratePerKm, setRatePerKm] = useState('');
  const [baseLocation, setBaseLocation] = useState('Trichy');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a vehicle model or name.');
      return;
    }
    const capNum = Number(capacity);
    if (!capNum || capNum <= 0) {
      Alert.alert('Validation Error', 'Please enter valid tonnage capacity.');
      return;
    }
    const rateNum = Number(ratePerKm);
    if (!rateNum || rateNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid rate per kilometer (₹/km).');
      return;
    }

    try {
      setSubmitting(true);
      await addVehicle({
        name: name.trim(),
        type,
        number: number.trim(),
        capacity: capNum,
        ratePerKm: rateNum,
        baseLocation: baseLocation.trim(),
        isAvailable: true,
      });

      setSubmitting(false);
      Alert.alert('Vehicle Registered', 'Your vehicle is now listed and available for farmer bookings!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setSubmitting(false);
      showFirestoreErrorAlert('Save Error', err, 'Failed to save vehicle.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <MaterialCommunityIcons name="truck-delivery" size={28} color={Colors.white} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Register Vehicle to Fleet</Text>
          <Text style={styles.bannerSub}>
            Add freight trucks and haulers to receive direct transport bookings from farmers.
          </Text>
        </View>
      </View>

      {/* Vehicle Model Name */}
      <Text style={styles.fieldLabel}>Vehicle Name / Model *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Tata 407 Light Commercial"
        placeholderTextColor={Colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      {/* Vehicle Type Selector */}
      <Text style={styles.fieldLabel}>Vehicle Category *</Text>
      <View style={styles.typeSelectorRow}>
        {VEHICLE_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
            onPress={() => setType(t)}
          >
            <MaterialCommunityIcons
              name={t === 'Tractor' ? 'tractor' : 'truck'}
              size={16}
              color={type === t ? Colors.white : Colors.textPrimary}
            />
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Registration Number */}
      <Text style={styles.fieldLabel}>Vehicle Plate / Reg Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. TN 45 AB 1234"
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="characters"
        value={number}
        onChangeText={setNumber}
      />

      {/* Capacity & Rate */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Capacity (Tons) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3.5"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={capacity}
            onChangeText={setCapacity}
          />
        </View>

        <View style={styles.colSpacing} />

        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Rate / km (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 25"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={ratePerKm}
            onChangeText={setRatePerKm}
          />
        </View>
      </View>

      {/* Base Location */}
      <Text style={styles.fieldLabel}>Base District / Location *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locScroll}>
        {LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[styles.locChip, baseLocation === loc && styles.locChipActive]}
            onPress={() => setBaseLocation(loc)}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={baseLocation === loc ? Colors.white : Colors.primary}
            />
            <Text style={[styles.locChipText, baseLocation === loc && styles.locChipTextActive]}>
              {loc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="content-save-check" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>Register Vehicle</Text>
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
    backgroundColor: '#1565C0',
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 4,
  },
  typeChipActive: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  typeChipTextActive: {
    color: Colors.white,
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
  locScroll: {
    marginBottom: Spacing.s,
  },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    gap: 4,
  },
  locChipActive: {
    backgroundColor: Colors.primary,
  },
  locChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  locChipTextActive: {
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
