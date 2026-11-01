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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Colors, Spacing } from '../../constants/theme';

interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isBlocked?: boolean;
  blocked?: boolean;
  createdAt?: any;
}

const FALLBACK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Muthu Vel', email: 'farmer@smartuzhavan.com', phoneNumber: '+91 98401 23456', role: 'Farmer', isBlocked: false },
  { id: 'u2', name: 'Kavitha Selvam', email: 'buyer@smartuzhavan.com', phoneNumber: '+91 98402 34567', role: 'Buyer', isBlocked: false },
  { id: 'u3', name: 'Ravi Chandran', email: 'transporter@smartuzhavan.com', phoneNumber: '+91 98403 45678', role: 'Transporter', isBlocked: false },
  { id: 'u4', name: 'Senthil Kumar', email: 'warehouse@smartuzhavan.com', phoneNumber: '+91 98404 56789', role: 'Warehouse', isBlocked: false },
  { id: 'u5', name: 'Gopal Krishnan', email: 'gopal@agri.com', phoneNumber: '+91 98405 67890', role: 'Farmer', isBlocked: false },
  { id: 'u6', name: 'Priya Narayanan', email: 'priya@fpo.org', phoneNumber: '+91 98406 78901', role: 'Buyer', isBlocked: false },
];

const ROLES = ['All', 'Farmer', 'Buyer', 'Transporter', 'Warehouse'];

export const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminService.getUsers({
        role: selectedRole === 'All' ? undefined : selectedRole,
        search: searchQuery.trim() || undefined,
      });
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      } else {
        // Apply filter to fallback data
        let filtered = FALLBACK_USERS;
        if (selectedRole !== 'All') {
          filtered = filtered.filter((u) => u.role?.toLowerCase() === selectedRole.toLowerCase());
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q) ||
              u.phoneNumber?.includes(q)
          );
        }
        setUsers(filtered);
      }
    } catch {
      setUsers(FALLBACK_USERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBlock = (user: AdminUser) => {
    const isCurrentlyBlocked = Boolean(user.isBlocked || user.blocked);
    const actionText = isCurrentlyBlocked ? 'Unblock' : 'Block';

    Alert.alert(
      `${actionText} User`,
      `Are you sure you want to ${actionText.toLowerCase()} ${user.name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: isCurrentlyBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminService.toggleBlockUser(user.id, !isCurrentlyBlocked);
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === user.id
                    ? { ...u, isBlocked: !isCurrentlyBlocked, blocked: !isCurrentlyBlocked }
                    : u
                )
              );
              Alert.alert('Success', `User ${user.name || ''} has been ${actionText.toLowerCase()}ed.`);
            } catch {
              Alert.alert('Notice', `Updated status for demo display.`);
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === user.id
                    ? { ...u, isBlocked: !isCurrentlyBlocked, blocked: !isCurrentlyBlocked }
                    : u
                )
              );
            }
          },
        },
      ]
    );
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Farmer':
        return { bg: '#E8F5E9', text: '#2E7D32', icon: 'sprout' as const };
      case 'Buyer':
        return { bg: '#F3E5F5', text: '#6A1B9A', icon: 'cart-outline' as const };
      case 'Transporter':
        return { bg: '#E3F2FD', text: '#1565C0', icon: 'truck-outline' as const };
      case 'Warehouse':
        return { bg: '#FFF3E0', text: '#E65100', icon: 'warehouse' as const };
      default:
        return { bg: '#ECEFF1', text: '#455A64', icon: 'account-outline' as const };
    }
  };

  const renderItem = ({ item }: { item: AdminUser }) => {
    const isBlocked = Boolean(item.isBlocked || item.blocked);
    const badge = getRoleBadge(item.role);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userMain}>
            <View style={[styles.avatar, { backgroundColor: badge.bg }]}>
              <MaterialCommunityIcons name={badge.icon} size={22} color={badge.text} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name || 'Anonymous User'}</Text>
              <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
              {item.phoneNumber && (
                <Text style={styles.userPhone}>{item.phoneNumber}</Text>
              )}
            </View>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.roleBadgeText, { color: badge.text }]}>
              {item.role || 'User'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: isBlocked ? '#FFEBEE' : '#E8F5E9' }]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isBlocked ? '#C62828' : '#2E7D32' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isBlocked ? '#C62828' : '#2E7D32' },
              ]}
            >
              {isBlocked ? 'Blocked' : 'Active'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isBlocked ? '#E8F5E9' : '#FFEBEE' },
            ]}
            onPress={() => handleToggleBlock(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isBlocked ? 'check-circle-outline' : 'block-helper'}
              size={16}
              color={isBlocked ? '#2E7D32' : '#C62828'}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isBlocked ? '#2E7D32' : '#C62828' },
              ]}
            >
              {isBlocked ? 'Unblock' : 'Block User'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.subtext} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          placeholderTextColor={Colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filter Tabs */}
      <View style={styles.roleTabs}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleTab,
              selectedRole === role && styles.roleTabActive,
            ]}
            onPress={() => setSelectedRole(role)}
          >
            <Text
              style={[
                styles.roleTabText,
                selectedRole === role && styles.roleTabTextActive,
              ]}
            >
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading registered users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadUsers();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search criteria or role filter
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.m,
    marginTop: Spacing.m,
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
  roleTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    gap: 8,
  },
  roleTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.m,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.s,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 1,
  },
  userPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.m,
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.m,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.subtext,
    marginTop: 4,
    textAlign: 'center',
  },
});
