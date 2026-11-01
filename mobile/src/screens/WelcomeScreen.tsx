import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

type WelcomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavProp>();
  const { width } = useWindowDimensions();

  // Keep logo size proportional and contained
  const logoSize = Math.min(width * 0.45, 180);

  const handleContinue = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={[styles.logoWrapper, { width: logoSize + 24, height: logoSize + 24 }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={[styles.logo, { width: logoSize, height: logoSize }]}
              resizeMode="contain"
              accessibilityLabel="Smart Uzhavan Logo"
            />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            Smart Uzhavan
          </Text>

          <Text style={styles.subtitle}>
            Smart Agriculture for a Better Tomorrow
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Digital Agriculture Ecosystem</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.bulletPoint} />
            <Text style={styles.infoText}>Farmer Hub & Crop Marketplace</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.bulletPoint} />
            <Text style={styles.infoText}>Transport & Storage Booking</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.bulletPoint} />
            <Text style={styles.infoText}>Precision AI Farming Tools</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continue to Smart Uzhavan"
            accessibilityHint="Navigates to the next screen"
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  logoWrapper: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  logo: {
    borderRadius: 20,
  },
  title: {
    ...Typography.title,
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  badgeText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    fontWeight: '500',
  },
  footerContainer: {
    marginBottom: Spacing.md,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    ...Typography.button,
  },
});
