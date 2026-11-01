import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface FeatureNoticeModalProps {
  visible: boolean;
  title: string;
  phase: string;
  description: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  onClose: () => void;
}

export const FeatureNoticeModal: React.FC<FeatureNoticeModalProps> = ({
  visible,
  title,
  phase,
  description,
  iconName = 'information-outline',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={iconName} size={32} color={Colors.primary} />
              </View>

              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{phase}</Text>
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>

              <View style={styles.architectNote}>
                <Text style={styles.noteTitle}>Architectural Rule</Text>
                <Text style={styles.noteText}>
                  Mock live data is disallowed. Full functionality and real Firestore synchronization will be connected in this scheduled phase.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.closeButtonText}>Understood</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  phaseBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    marginBottom: Spacing.sm,
  },
  phaseBadgeText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  architectNote: {
    backgroundColor: '#F5F5F5',
    padding: Spacing.sm + 2,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
