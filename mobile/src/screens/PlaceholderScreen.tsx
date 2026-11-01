import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

export const PlaceholderScreen: React.FC<Props> = ({ route, navigation }) => {
  const title = route.params?.title ?? 'Temporary Placeholder';
  const description =
    route.params?.description ??
    'This is a designated Phase 2 placeholder screen. Authentication, user roles, and core features will be connected in subsequent phases.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Phase 2 Foundation</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Architectural Note</Text>
          <Text style={styles.noticeText}>
            No mock or simulated authentication is active. Firebase integration modules have been prepared with strict environment variable guards.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to Welcome Screen"
        >
          <Text style={styles.buttonText}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: Spacing.lg,
  },
  badgeText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    ...Typography.title,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 320,
  },
  noticeBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  noticeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
  },
});
