import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { UserRole } from '../types/user';

interface DashboardHeaderProps {
  name: string;
  email: string;
  role: UserRole;
  isTamil: boolean;
  onToggleLanguage: () => void;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case 'Farmer':
      return { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', labelTa: 'விவசாயி' };
    case 'Transporter':
      return { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0', labelTa: 'போக்குவரத்து' };
    case 'Warehouse':
      return { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100', labelTa: 'கிடங்கு' };
    case 'Buyer':
      return { bg: '#F3E5F5', border: '#CE93D8', text: '#6A1B9A', labelTa: 'வாங்குபவர்' };
    case 'Admin':
      return { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828', labelTa: 'நிர்வாகி' };
    default:
      return { bg: '#E8F5E9', border: '#A5D6A7', text: Colors.primary, labelTa: role };
  }
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  name,
  email,
  role,
  isTamil,
  onToggleLanguage,
  onLogout,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const badge = getRoleBadgeStyle(role);
  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={[styles.avatar, { borderColor: badge.border }]}
            onPress={onOpenProfile}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
          >
            <Text style={[styles.avatarText, { color: badge.text }]}>{initial}</Text>
            <View style={styles.avatarEditBadge}>
              <MaterialCommunityIcons name="account" size={10} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nameBlock}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
          >
            <Text style={styles.greeting} numberOfLines={1}>
              {isTamil ? `வணக்கம், ${name}` : `Welcome, ${name}`}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {isTamil ? badge.labelTa : `${role} Account`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {onOpenNotifications && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onOpenNotifications}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onToggleLanguage}
            accessibilityRole="button"
            accessibilityLabel="Toggle Language"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="translate" size={20} color={Colors.primary} />
            <Text style={styles.langText}>{isTamil ? 'ENG' : 'தமிழ்'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.logoutBtn]}
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  nameBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
  },
});
