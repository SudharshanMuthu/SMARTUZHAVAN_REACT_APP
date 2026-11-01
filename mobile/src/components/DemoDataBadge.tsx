import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  isDemo: boolean;
  label?: string;
  compact?: boolean;
}

export const DemoDataBadge: React.FC<Props> = ({ isDemo, label, compact = false }) => {
  if (isDemo) {
    return (
      <View style={[styles.container, styles.demoContainer, compact && styles.compactContainer]}>
        <MaterialCommunityIcons name="information-outline" size={compact ? 12 : 14} color="#B45309" />
        <Text style={[styles.text, styles.demoText, compact && styles.compactText]}>
          {label || 'DEMO DATA — For semester review only'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.liveContainer, compact && styles.compactContainer]}>
      <MaterialCommunityIcons name="check-circle-outline" size={compact ? 12 : 14} color="#15803D" />
      <Text style={[styles.text, styles.liveText, compact && styles.compactText]}>
        {label || 'Live Data'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginVertical: 4,
    gap: 6,
    alignSelf: 'flex-start',
  },
  compactContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    marginVertical: 0,
  },
  demoContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  liveContainer: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  compactText: {
    fontSize: 10,
  },
  demoText: {
    color: '#92400E',
  },
  liveText: {
    color: '#166534',
  },
});
