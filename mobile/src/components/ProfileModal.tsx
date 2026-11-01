import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { UserProfile, UserRole } from '../types/user';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  isTamil?: boolean;
}

const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case 'Farmer':
      return { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', labelTa: 'விவசாயி', icon: 'tractor' };
    case 'Transporter':
      return { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0', labelTa: 'போக்குவரத்து', icon: 'truck-fast' };
    case 'Warehouse':
      return { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100', labelTa: 'கிடங்கு', icon: 'warehouse' };
    case 'Buyer':
      return { bg: '#F3E5F5', border: '#CE93D8', text: '#6A1B9A', labelTa: 'வாங்குபவர்', icon: 'shopping' };
    default:
      return { bg: '#E8F5E9', border: '#A5D6A7', text: Colors.primary, labelTa: role, icon: 'account' };
  }
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onLogout,
  isTamil = false,
}) => {
  const { userProfile, user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const role: UserRole = userProfile?.role || 'Farmer';
  const roleStyle = getRoleBadgeStyle(role);
  const initial = (userProfile?.name || user?.displayName || 'U').charAt(0).toUpperCase();

  // Synchronize internal state when modal opens or profile changes
  useEffect(() => {
    if (visible && userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setIsEditing(false);
      setErrorMsg(null);
    }
  }, [visible, userProfile]);

  const handleStartEdit = () => {
    setName(userProfile?.name || '');
    setPhone(userProfile?.phone || '');
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setName(userProfile?.name || '');
    setPhone(userProfile?.phone || '');
    setErrorMsg(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMsg(isTamil ? 'பெயரை உள்ளிடவும்' : 'Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const result = await updateUserProfile({
      name: name.trim(),
      phone: phone.trim() ? phone.trim() : undefined,
    });

    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success',
        isTamil ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.' : 'Profile updated successfully.'
      );
    } else {
      setErrorMsg(result.error || (isTamil ? 'புதுப்பித்தல் தோல்வியுற்றது' : 'Update failed'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              {isTamil ? 'பயனர் விவரம்' : 'User Profile'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close profile"
            >
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
            {/* Prominent Profile Circle */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarCircle, { borderColor: roleStyle.border }]}>
                <Text style={[styles.avatarText, { color: roleStyle.text }]}>{initial}</Text>
              </View>
              <View style={[styles.rolePill, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
                <MaterialCommunityIcons
                  name={roleStyle.icon as any}
                  size={14}
                  color={roleStyle.text}
                  style={styles.roleIcon}
                />
                <Text style={[styles.roleText, { color: roleStyle.text }]}>
                  {isTamil ? roleStyle.labelTa : `${role} Account`}
                </Text>
              </View>
            </View>

            {errorMsg && (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#C62828" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Profile Info Cards */}
            {!isEditing ? (
              <View style={styles.infoContainer}>
                {/* Full Name */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextWrapper}>
                    <Text style={styles.fieldLabel}>{isTamil ? 'பெயர்' : 'Full Name'}</Text>
                    <Text style={styles.fieldValue}>{userProfile?.name || 'N/A'}</Text>
                  </View>
                </View>

                {/* Email Address */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextWrapper}>
                    <Text style={styles.fieldLabel}>{isTamil ? 'மின்னஞ்சல்' : 'Email Address'}</Text>
                    <Text style={styles.fieldValue}>{user?.email || userProfile?.email || 'N/A'}</Text>
                  </View>
                </View>

                {/* Role */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <MaterialCommunityIcons name="badge-account-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextWrapper}>
                    <Text style={styles.fieldLabel}>{isTamil ? 'பங்கு' : 'Assigned Role'}</Text>
                    <Text style={styles.fieldValue}>{isTamil ? roleStyle.labelTa : role}</Text>
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextWrapper}>
                    <Text style={styles.fieldLabel}>{isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}</Text>
                    <Text style={styles.fieldValue}>
                      {userProfile?.phone || (isTamil ? 'குறிப்பிடப்படவில்லை' : 'Not provided')}
                    </Text>
                  </View>
                </View>

                {/* Edit Profile Action Button */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={handleStartEdit}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="account-edit-outline" size={18} color={Colors.white} />
                  <Text style={styles.editBtnText}>
                    {isTamil ? 'சுயவிவரத்தைத் திருத்து' : 'Edit Profile'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Inline Edit Mode */
              <View style={styles.editContainer}>
                <Text style={styles.editInstruction}>
                  {isTamil
                    ? 'உங்கள் பெயர் மற்றும் தொலைபேசி எண்ணை மாற்றலாம்:'
                    : 'Update your display name and contact phone:'}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{isTamil ? 'பெயர்' : 'Full Name'}</Text>
                  <TextInput
                    style={styles.inputField}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor="#999"
                    autoFocus={true}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelBtnText}>{isTamil ? 'ரத்து' : 'Cancel'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
                        <Text style={styles.saveBtnText}>{isTamil ? 'சேமி' : 'Save Changes'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Logout Action */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  onClose();
                  onLogout();
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
                <Text style={styles.logoutBtnText}>
                  {isTamil ? 'வெளியேறு (Sign Out)' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
    gap: 6,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  infoContainer: {
    gap: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF9',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoTextWrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  editBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  editContainer: {
    gap: Spacing.md,
  },
  editInstruction: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  logoutSection: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: Spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
  },
});
