import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { Colors, Spacing } from '../constants/theme';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login, adminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const handleLogin = async (asAdminExplicit = false) => {
    setErrorMessage(null);
    setIsConnectionError(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(
        asAdminExplicit || isAdminMode
          ? 'Please enter administrator username or email.'
          : 'Please enter your email address.'
      );
      return;
    }

    if (!asAdminExplicit && !isAdminMode && trimmedEmail !== 'admin') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      let result;
      const isAdminTarget =
        asAdminExplicit ||
        isAdminMode ||
        trimmedEmail.toLowerCase() === 'admin@gmail.com' ||
        trimmedEmail.toLowerCase() === 'admin';

      if (isAdminTarget) {
        result = await adminLogin(trimmedEmail, password);
      } else {
        result = await login(trimmedEmail, password);
      }

      setLoading(false);

      if (!result.success && result.error) {
        setErrorMessage(result.error);
        if (
          result.error.toLowerCase().includes('connect') ||
          result.error.toLowerCase().includes('server') ||
          result.error.toLowerCase().includes('wi-fi') ||
          result.error.toLowerCase().includes('timed out')
        ) {
          setIsConnectionError(true);
        }
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Authentication error.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('network')) {
        setIsConnectionError(true);
      }
    }
  };

  const switchMode = (admin: boolean) => {
    setIsAdminMode(admin);
    setErrorMessage(null);
    setIsConnectionError(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Badge & Titles */}
          <View style={styles.header}>
            <View style={[styles.badgeCircle, isAdminMode && styles.badgeCircleAdmin]}>
              <MaterialCommunityIcons
                name={isAdminMode ? 'shield-crown' : 'sprout'}
                size={32}
                color={isAdminMode ? '#B71C1C' : Colors.primary}
              />
            </View>
            <Text style={styles.headerTitle}>
              {isAdminMode ? 'Admin Portal' : 'Welcome to Smart Uzhavan'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isAdminMode
                ? 'Sign in with administrator credentials to manage platform operations'
                : 'Direct digital agriculture platform for Tamil Nadu farmers and buyers'}
            </Text>
          </View>

          {/* Clean Modern Card Container */}
          <View style={styles.card}>
            {/* Segmented Mode Switcher */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, !isAdminMode && styles.segmentBtnActiveUser]}
                onPress={() => switchMode(false)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: !isAdminMode }}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={18}
                  color={!isAdminMode ? Colors.primary : '#64748B'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    !isAdminMode && styles.segmentTextActiveUser,
                  ]}
                >
                  User Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, isAdminMode && styles.segmentBtnActiveAdmin]}
                onPress={() => switchMode(true)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isAdminMode }}
              >
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={18}
                  color={isAdminMode ? '#B71C1C' : '#64748B'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    isAdminMode && styles.segmentTextActiveAdmin,
                  ]}
                >
                  Admin Portal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Compact Connection / Validation Notice Banner */}
            {errorMessage && (
              <View
                style={[
                  styles.noticeBox,
                  isConnectionError ? styles.noticeBoxWarning : styles.noticeBoxError,
                ]}
              >
                <MaterialCommunityIcons
                  name={isConnectionError ? 'wifi-alert' : 'alert-circle-outline'}
                  size={20}
                  color={isConnectionError ? '#D97706' : '#DC2626'}
                  style={styles.noticeIcon}
                />
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeText}>{errorMessage}</Text>
                  {isConnectionError && (
                    <TouchableOpacity
                      style={styles.retryBtn}
                      onPress={() => handleLogin(isAdminMode)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="refresh" size={14} color="#B45309" />
                      <Text style={styles.retryBtnText}>Retry Connection</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage(null);
                    setIsConnectionError(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}

            {/* Email / Username Input */}
            <View style={styles.inputFieldBlock}>
              <Text style={styles.inputLabel}>
                {isAdminMode ? 'Administrator Username or Email' : 'Email Address'}
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name={isAdminMode ? 'shield-account-outline' : 'email-outline'}
                  size={20}
                  color="#94A3B8"
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={isAdminMode ? 'Enter admin username or email' : 'name@example.com'}
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
                {email.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEmail('')}
                    style={styles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputFieldBlock}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#94A3B8"
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordToggleBtn}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isAdminMode ? styles.primaryBtnAdmin : styles.primaryBtnUser,
                loading && styles.primaryBtnDisabled,
              ]}
              onPress={() => handleLogin(isAdminMode)}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.btnContentRow}>
                  {isAdminMode && (
                    <MaterialCommunityIcons name="shield-check" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.primaryBtnText}>
                    {isAdminMode ? 'Authenticate as Admin' : 'Sign In'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer - Register link for standard farmers/buyers */}
          {!isAdminMode && (
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.registerLink}>Register here</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAdminMode && (
            <View style={styles.adminFooterNotice}>
              <MaterialCommunityIcons name="shield-lock" size={14} color="#94A3B8" />
              <Text style={styles.adminFooterNoticeText}>
                Authorized administration access only
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.l,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.s,
  },
  badgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeCircleAdmin: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    shadowColor: '#B71C1C',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.l,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: Spacing.l,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.l,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  segmentBtnActiveUser: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnActiveAdmin: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActiveUser: {
    color: Colors.primary,
    fontWeight: '700',
  },
  segmentTextActiveAdmin: {
    color: '#B71C1C',
    fontWeight: '700',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: Spacing.m,
    borderWidth: 1,
    gap: 8,
  },
  noticeBoxError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  noticeBoxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 17,
    fontWeight: '500',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  inputFieldBlock: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: Spacing.m,
  },
  inputLeadingIcon: {
    marginRight: Spacing.s,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  passwordToggleBtn: {
    padding: 4,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnUser: {
    backgroundColor: Colors.primary,
  },
  primaryBtnAdmin: {
    backgroundColor: '#B71C1C',
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminFooterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.s,
  },
  adminFooterNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
