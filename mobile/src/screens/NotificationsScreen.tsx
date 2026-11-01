import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFirebaseFirestore } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  AppNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { showFirestoreErrorAlert } from '../utils/firestoreErrorHandler';
import { Colors, Spacing } from '../constants/theme';

export const NotificationsScreen: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<AppNotification, 'id'>),
        }));

        // Sort descending by createdAt
        items.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        setNotifications(items);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.warn('[Notifications] Error fetching:', error.message);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead(user.uid);
    } catch (err: any) {
      showFirestoreErrorAlert('Notification Error', err, 'Failed to mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemPress = async (item: AppNotification) => {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id);
      } catch (err) {
        console.warn('Failed to mark read', err);
      }
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return { name: 'shopping' as const, color: '#1565C0', bg: '#E3F2FD' };
      case 'weather':
        return { name: 'weather-partly-cloudy' as const, color: '#F57C00', bg: '#FFF3E0' };
      case 'like':
        return { name: 'heart' as const, color: '#E91E63', bg: '#FCE4EC' };
      default:
        return { name: 'bell-ring' as const, color: Colors.primary, bg: '#E8F5E9' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryText}>
            {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <MaterialCommunityIcons name="check-all" size={16} color={Colors.primary} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => {}}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>
                Updates about your crop orders, warehouse bookings, weather warnings, and transport dispatches will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const iconMeta = getNotificationIcon(item.type);

          return (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.unreadCard]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: iconMeta.bg }]}>
                <MaterialCommunityIcons name={iconMeta.name} size={22} color={iconMeta.color} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryBadge: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#FAFDF9',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#1B5E20',
  },
  cardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
