import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { TransportOrder } from '../../types/transport';
import { Colors, Spacing } from '../../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'TransportTrip'>;

interface TripStage {
  title: string;
  desc: string;
  time: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export const TransportTripScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const passedOrder = route.params?.order;

  // Active or fallback order for live transit telemetry
  const order: TransportOrder = passedOrder || {
    id: 'active_live_transit',
    type: 'transport',
    vehicleId: 'veh_active_default',
    vehicleName: 'Tata 407 LPT Heavy Hauler',
    vehicleType: 'Light Commercial Vehicle',
    transporterId: 'transporter_active',
    requestedById: 'farmer_active',
    requestedByName: 'Ramasamy (Farmer)',
    pickup: 'Lalgudi Agricultural Hub, Trichy',
    drop: 'Madurai Central Mandi Terminal',
    distanceKm: 142,
    weightTons: 3.5,
    price: 4200,
    status: 'on_trip',
    createdAt: new Date().toISOString(),
  };

  // Transit progress simulation (0% - 100%)
  const [progressPct, setProgressPct] = useState(35);
  const [currentStageIdx, setCurrentStageIdx] = useState(2);

  const stages: TripStage[] = [
    {
      title: 'Booking Confirmed & Dispatched',
      desc: `Vehicle assigned (${order.vehicleName || order.vehicleType || 'Freight'}). Driver dispatched.`,
      time: '08:30 AM',
      isComplete: currentStageIdx > 0,
      isCurrent: currentStageIdx === 0,
    },
    {
      title: 'Arrived at Pickup Facility',
      desc: `Vehicle arrived at ${order.pickup}. Weighment & cargo loading in progress.`,
      time: '09:15 AM',
      isComplete: currentStageIdx > 1,
      isCurrent: currentStageIdx === 1,
    },
    {
      title: 'En Route / Highway Transit',
      desc: `Transporting ${order.weightTons} Tons of harvest towards ${order.drop}. GPS active.`,
      time: '10:00 AM',
      isComplete: currentStageIdx > 2,
      isCurrent: currentStageIdx === 2,
    },
    {
      title: 'Approaching Destination Terminal',
      desc: `Vehicle reached entry toll corridor. Preparing for unloading bay inspection.`,
      time: '01:45 PM',
      isComplete: currentStageIdx > 3,
      isCurrent: currentStageIdx === 3,
    },
    {
      title: 'Delivery Completed',
      desc: `Harvest safely unloaded at ${order.drop}. Delivery receipt verified.`,
      time: '02:30 PM',
      isComplete: currentStageIdx >= 4,
      isCurrent: currentStageIdx === 4,
    },
  ];

  useEffect(() => {
    // Auto increment progress simulation every 6 seconds for realistic movement
    const timer = setInterval(() => {
      setProgressPct((prev) => {
        const next = Math.min(100, prev + 5);
        if (next >= 85) setCurrentStageIdx(3);
        else if (next >= 50) setCurrentStageIdx(2);
        return next;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const remainingKm = Math.max(
    0,
    Math.round(order.distanceKm * (1 - progressPct / 100))
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Route Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.statusRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE TRANSIT</Text>
          </View>
          <Text style={styles.tripIdText}>Trip #{order.id.slice(0, 6).toUpperCase()}</Text>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.pointCol}>
            <Text style={styles.pointLabel}>PICKUP</Text>
            <Text style={styles.pointName} numberOfLines={2}>
              {order.pickup}
            </Text>
          </View>
          <View style={styles.routeIconCenter}>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.primary} />
          </View>
          <View style={styles.pointCol}>
            <Text style={styles.pointLabel}>DESTINATION</Text>
            <Text style={styles.pointName} numberOfLines={2}>
              {order.drop}
            </Text>
          </View>
        </View>

        {/* Cargo Specs */}
        <View style={styles.metricsBox}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Cargo Load</Text>
            <Text style={styles.metricVal}>{order.weightTons} Tons</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Distance</Text>
            <Text style={styles.metricVal}>{order.distanceKm} km</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Agreed Fare</Text>
            <Text style={[styles.metricVal, { color: Colors.primary }]}>₹{order.price}</Text>
          </View>
        </View>
      </View>

      {/* Transit Simulation Visual Map / Highway Corridor */}
      <View style={styles.simulationCard}>
        <View style={styles.simHeader}>
          <MaterialCommunityIcons name="road-variant" size={22} color="#1565C0" />
          <Text style={styles.simTitle}>Transit Corridor Progress</Text>
          <Text style={styles.simKmText}>{remainingKm} km to destination</Text>
        </View>

        {/* Track Track */}
        <View style={styles.highwayTrack}>
          <View style={[styles.highwayFill, { width: `${progressPct}%` }]} />
          {/* Moving Vehicle Icon */}
          <View style={[styles.truckMarker, { left: `${Math.max(0, Math.min(92, progressPct))}%` }]}>
            <MaterialCommunityIcons name="truck-fast" size={20} color={Colors.white} />
          </View>
        </View>

        <View style={styles.trackLabels}>
          <Text style={styles.trackLabelText}>{order.pickup.split(' ')[0]}</Text>
          <Text style={styles.trackProgressPct}>{progressPct}% Completed</Text>
          <Text style={styles.trackLabelText}>{order.drop.split(' ')[0]}</Text>
        </View>
      </View>

      {/* Driver Contact & Vehicle Info */}
      <View style={styles.driverCard}>
        <View style={styles.driverAvatar}>
          <MaterialCommunityIcons name="account-tie-hat" size={28} color="#1565C0" />
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>Verified Agri Transporter</Text>
          <Text style={styles.vehicleDetails}>
            {order.vehicleName || order.vehicleType || 'Heavy Commercial Vehicle'}
          </Text>
          <Text style={styles.gpsActiveTag}>
            <MaterialCommunityIcons name="check-decagram" size={12} color="#2E7D32" /> GPS Telemetry Active
          </Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() =>
            Alert.alert('Transporter Helpline', 'Contacting assigned fleet driver directly.')
          }
        >
          <MaterialCommunityIcons name="phone" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Step-by-Step Delivery Milestones */}
      <Text style={styles.sectionHeader}>Trip Timeline & Status Milestones</Text>
      <View style={styles.timelineCard}>
        {stages.map((stage, idx) => (
          <View key={stage.title} style={styles.timelineStep}>
            {/* Indicator column */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.dot,
                  stage.isComplete && styles.dotComplete,
                  stage.isCurrent && styles.dotCurrent,
                ]}
              >
                {stage.isComplete ? (
                  <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
                ) : stage.isCurrent ? (
                  <View style={styles.innerDot} />
                ) : null}
              </View>
              {idx < stages.length - 1 && (
                <View
                  style={[
                    styles.line,
                    stage.isComplete && styles.lineComplete,
                  ]}
                />
              )}
            </View>

            {/* Content column */}
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Text
                  style={[
                    styles.stepTitle,
                    stage.isCurrent && { color: Colors.primary },
                  ]}
                >
                  {stage.title}
                </Text>
                <Text style={styles.stepTime}>{stage.time}</Text>
              </View>
              <Text style={styles.stepDesc}>{stage.desc}</Text>
            </View>
          </View>
        ))}
      </View>
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
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },
  tripIdText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  pointCol: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  pointName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  routeIconCenter: {
    paddingHorizontal: Spacing.s,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FBE7',
    borderRadius: 8,
    padding: Spacing.s,
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  simulationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  simTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 6,
    flex: 1,
  },
  simKmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1565C0',
  },
  highwayTrack: {
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: Spacing.s,
  },
  highwayFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  truckMarker: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  trackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  trackProgressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehicleDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  gpsActiveTag: {
    fontSize: 11,
    color: '#2E7D32',
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
    marginTop: Spacing.xs,
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timelineStep: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotComplete: {
    backgroundColor: '#2E7D32',
  },
  dotCurrent: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: '#E0E0E0',
    marginVertical: 2,
  },
  lineComplete: {
    backgroundColor: '#2E7D32',
  },
  stepContent: {
    flex: 1,
    marginLeft: Spacing.s,
    paddingBottom: Spacing.m,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  stepTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
