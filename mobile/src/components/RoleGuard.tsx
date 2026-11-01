import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { RootStackParamList } from '../types/navigation';
import { Colors, Spacing } from '../constants/theme';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  screenTitle?: string;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  screenTitle = 'Protected Screen',
  children,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userProfile, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const currentRole: UserRole = userProfile?.role || 'Farmer';
  const isAuthorized = allowedRoles.includes(currentRole);

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-alert-outline" size={48} color="#C62828" />
          </View>
          <Text style={styles.title}>Role Access Restricted</Text>
          <Text style={styles.subtitle}>
            {screenTitle} is reserved exclusively for {allowedRoles.join(' / ')} accounts.
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Your Role: {currentRole}</Text>
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={Colors.white} />
            <Text style={styles.backBtnText}>Return to My Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: Spacing.lg,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
