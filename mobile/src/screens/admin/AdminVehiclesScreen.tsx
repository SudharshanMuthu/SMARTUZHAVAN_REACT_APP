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

interface AdminVehicle {
  id: string;
  vehicleNumber?: string;
  plateNumber?: string;
  model?: string;
  type?: string;
  transporterName?: string;
  ownerName?: string;
  capacity?: number;
  capacityTons?: number;
  ratePerKm?: number;
  pricePerKm?: number;
  status?: string;
  district?: string;
}

const FALLBACK_VEHICLES: AdminVehicle[] = [
  { id: 'v1', vehicleNumber: 'TN 49 AB 1234', model: 'Tata Ace Gold (Chotta Hathi)', type: 'Mini Truck', transporterName: 'Ravi Chandran', capacityTons: 1.5, ratePerKm: 25, status: 'Available', district: 'Thanjavur' },
  { id: 'v2', vehicleNumber: 'TN 33 CD 5678', model: 'Ashok Leyland Dost+', type: 'Pickup Truck', transporterName: 'Murugan Transport', capacityTons: 2.8, ratePerKm: 32, status: 'In Transit', district: 'Erode' },
  { id: 'v3', vehicleNumber: 'TN 58 EF 9012', model: 'Eicher Pro 2049', type: 'Medium LCV', transporterName: 'Selva Logistics', capacityTons: 5.0, ratePerKm: 48, status: 'Available', district: 'Madurai' },
  { id: 'v4', vehicleNumber: 'TN 45 GH 3456', model: 'Mahindra Bolero Maxi Truck', type: 'Pickup', transporterName: 'Delta Express', capacityTons: 2.0, ratePerKm: 28, status: 'Available', district: 'Trichy' },
  { id: 'v5', vehicleNumber: 'TN 28 JK 7890', model: 'BharatBenz 1217C', type: 'Heavy Truck', transporterName: 'Kongu Cargo', capacityTons: 10.0, ratePerKm: 75, status: 'Available', district: 'Namakkal' },
];

export const AdminVehiclesScreen: React.FC = () => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states
  const [vehNumber, setVehNumber] = useState<string>('');
  const [vehModel, setVehModel] = useState<string>('');
  const [vehCapacity, setVehCapacity] = useState<string>('');
  const [vehRate, setVehRate] = useState<string>('');
  const [vehOwner, setVehOwner] = useState<string>('');

  const loadVehicles = useCallback(async () => {
    try {
      const data = await adminService.getVehicles({
        search: searchQuery.trim() || undefined,
      });
      if (Array.isArray(data) && data.length > 0) {
        setVehicles(data);
      } else {
        let filtered = FALLBACK_VEHICLES;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (v) =>
              (v.vehicleNumber || v.plateNumber || '').toLowerCase().includes(q) ||
              (v.model || v.type || '').toLowerCase().includes(q) ||
              (v.transporterName || v.ownerName || '').toLowerCase().includes(q)
          );
        }
        setVehicles(filtered);
      }
    } catch {
      setVehicles(FALLBACK_VEHICLES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleDeleteVehicle = (veh: AdminVehicle) => {
    const num = veh.vehicleNumber || veh.plateNumber || 'this vehicle';
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove vehicle ${num}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteVehicle(veh.id);
              setVehicles((prev) => prev.filter((v) => v.id !== veh.id));
              Alert.alert('Vehicle Removed', 'The vehicle has been removed from fleet.');
            } catch {
              setVehicles((prev) => prev.filter((v) => v.id !== veh.id));
              Alert.alert('Notice', 'Vehicle removed from current view.');
            }
          },
        },
      ]
    );
  };

  const handleAddVehicle = async () => {
    if (!vehNumber.trim() || !vehModel.trim() || !vehCapacity.trim() || !vehRate.trim()) {
      Alert.alert('Missing Fields', 'Please enter registration, model, payload, and rate.');
      return;
    }

    const payload = {
      vehicleNumber: vehNumber.trim().toUpperCase(),
      plateNumber: vehNumber.trim().toUpperCase(),
      model: vehModel.trim(),
      type: 'Agri Cargo Vehicle',
      transporterName: vehOwner.trim() || 'Verified Transporter',
      ownerName: vehOwner.trim() || 'Verified Transporter',
      capacityTons: Number(vehCapacity) || 2.0,
      capacity: Number(vehCapacity) || 2.0,
      ratePerKm: Number(vehRate) || 25,
      pricePerKm: Number(vehRate) || 25,
      status: 'Available',
    };

    try {
      await adminService.createVehicle(payload);
      setVehicles((prev) => [{ id: `v-${Date.now()}`, ...payload }, ...prev]);
      Alert.alert('Success', 'Vehicle added to transport fleet.');
      setModalVisible(false);
      setVehNumber('');
      setVehModel('');
      setVehCapacity('');
      setVehRate('');
      setVehOwner('');
    } catch {
      setVehicles((prev) => [{ id: `v-${Date.now()}`, ...payload }, ...prev]);
      setModalVisible(false);
      Alert.alert('Notice', 'Added vehicle for demo session.');
    }
  };

  const renderItem = ({ item }: { item: AdminVehicle }) => {
    const num = item.vehicleNumber || item.plateNumber || 'TN Registered';
    const cap = item.capacityTons || item.capacity || 2.0;
    const rate = item.ratePerKm || item.pricePerKm || 25;
    const isAvail = (item.status || 'Available').toLowerCase() === 'available';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="truck-outline" size={24} color="#00838F" />
          </View>
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text style={styles.vehPlate}>{num}</Text>
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: isAvail ? '#E0F2F1' : '#FFF3E0' },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    { color: isAvail ? '#00796B' : '#E65100' },
                  ]}
                >
                  {item.status || 'Available'}
                </Text>
              </View>
            </View>
            <Text style={styles.modelText}>{item.model || 'Standard Truck'}</Text>
            <Text style={styles.ownerText}>
              {`Transporter: ${item.transporterName || item.ownerName || 'Verified Partner'}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteVehicle(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C62828" />
          </TouchableOpacity>
        </View>

        <View style={styles.statRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Max Payload</Text>
            <Text style={styles.metricValue}>{`${cap} Tonnes`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Rate / km</Text>
            <Text style={[styles.metricValue, { color: '#00838F' }]}>{`₹${rate} / km`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Location Hub</Text>
            <Text style={styles.metricValue}>{item.district || 'Tamil Nadu'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plate, model, transporter..."
            placeholderTextColor={Colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading fleet vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadVehicles();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="truck-outline" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No vehicles registered</Text>
            </View>
          }
        />
      )}

      {/* Add Vehicle Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transport Vehicle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Registration Plate (e.g. TN 49 AB 1234)"
              placeholderTextColor={Colors.subtext}
              autoCapitalize="characters"
              value={vehNumber}
              onChangeText={setVehNumber}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Make & Model (e.g. Tata Ace Gold)"
              placeholderTextColor={Colors.subtext}
              value={vehModel}
              onChangeText={setVehModel}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Payload Capacity (Tonnes)"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
              value={vehCapacity}
              onChangeText={setVehCapacity}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Rate per km (₹)"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
              value={vehRate}
              onChangeText={setVehRate}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Transporter Name"
              placeholderTextColor={Colors.subtext}
              value={vehOwner}
              onChangeText={setVehOwner}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddVehicle}>
              <Text style={styles.submitBtnText}>Register Vehicle</Text>
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
    flexDirection: 'row',
    padding: Spacing.m,
    gap: Spacing.s,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.s,
    fontSize: 14,
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00838F',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: Spacing.m,
    paddingTop: 0,
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
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehPlate: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  ownerText: {
    fontSize: 11,
    color: Colors.subtext,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.subtext,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
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
    gap: Spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 48,
    fontSize: 14,
    color: Colors.text,
  },
  submitBtn: {
    backgroundColor: '#00838F',
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
