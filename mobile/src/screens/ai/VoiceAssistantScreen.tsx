import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../../types/navigation';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceAssistant'>;

interface VoiceCommand {
  labelEn: string;
  labelTa: string;
  query: string;
  route: keyof RootStackParamList;
  description: string;
}

const COMMANDS: VoiceCommand[] = [
  {
    labelEn: 'Open Crop Marketplace',
    labelTa: 'சந்தை திறக்க',
    query: 'open market',
    route: 'Marketplace',
    description: 'Browse all live farmer harvest listings',
  },
  {
    labelEn: 'Crop Health Scanner',
    labelTa: 'பயிர் சுகாதாரக் கருவி',
    query: 'crop health',
    route: 'CropHealthScanner',
    description: 'Inspect leaf disease and pest infection',
  },
  {
    labelEn: 'AI Farming Assistant',
    labelTa: 'விவசாய AI உதவியாளர்',
    query: 'ai assistant',
    route: 'AiAssistant',
    description: 'Interactive chat for agricultural advice',
  },
  {
    labelEn: 'Smart Irrigation Advisor',
    labelTa: 'திறன் பாசனம்',
    query: 'irrigation',
    route: 'SmartIrrigation',
    description: 'Calculate daily field water requirement',
  },
  {
    labelEn: 'Crop Yield Prediction',
    labelTa: 'விளைச்சல் கணிப்பு',
    query: 'yield prediction',
    route: 'YieldPrediction',
    description: 'Estimate harvest tonnage and season window',
  },
  {
    labelEn: 'Crop Recommendations',
    labelTa: 'பயிர் பரிந்துரை',
    query: 'recommendations',
    route: 'CropRecommendation',
    description: 'Match optimal crops to soil and season',
  },
];

export const VoiceAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [isTamil, setIsTamil] = useState(false);
  const [recognizedText, setRecognizedText] = useState(
    'Tap mic or choose a voice command below...'
  );

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: isTamil ? 'ta-IN' : 'en-IN',
      pitch: 1.0,
      rate: 0.95,
    });
  };

  const executeCommand = (cmd: VoiceCommand) => {
    const feedback = isTamil
      ? `${cmd.labelTa} திறக்கப்படுகிறது`
      : `Opening ${cmd.labelEn}`;

    setRecognizedText(feedback);
    speak(feedback);

    setTimeout(() => {
      navigation.navigate(cmd.route as any);
    }, 700);
  };

  const handleMicPress = () => {
    if (!isListening) {
      setIsListening(true);
      const prompt = isTamil
        ? 'மைக்ரோஃபோன் தயார். கட்டளையைத் தேர்ந்தெடுக்கவும்...'
        : 'Listening for agricultural commands...';
      setRecognizedText(prompt);
      speak(isTamil ? 'சொல்லுங்கள்' : 'How can I assist your farm today?');

      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
      Speech.stop();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Header */}
      <View style={styles.topBar}>
        <Text style={styles.headerSubtitle}>
          {isTamil ? 'குரல் வழி விவசாய கட்டளைகள்' : 'Vocal navigation & interactive voice response'}
        </Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => {
            const nextLang = !isTamil;
            setIsTamil(nextLang);
            speak(nextLang ? 'மொழி தமிழில் மாற்றப்பட்டது' : 'Language switched to English');
          }}
        >
          <MaterialCommunityIcons name="translate" size={16} color={Colors.primary} />
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Mic Hero Section */}
      <View style={styles.micCard}>
        <TouchableOpacity
          style={[styles.micCircle, isListening && styles.micCircleActive]}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name={isListening ? 'microphone' : 'microphone-outline'}
            size={48}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.recognizedText}>{recognizedText}</Text>
        <Text style={styles.micHint}>
          {isListening
            ? (isTamil ? 'குரலை கவனிக்கிறது...' : 'Processing vocal audio...')
            : (isTamil ? 'மைக்ரோஃபோனை தட்டி பேசவும்' : 'Tap mic to activate voice response')}
        </Text>
      </View>

      {/* Voice Commands Section */}
      <Text style={styles.sectionTitle}>
        {isTamil ? 'குரல் கட்டளைகள் (Quick Commands)' : 'Supported Voice Commands'}
      </Text>

      <View style={styles.commandList}>
        {COMMANDS.map((cmd, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.commandItem}
            activeOpacity={0.7}
            onPress={() => executeCommand(cmd)}
          >
            <View style={styles.commandIconCircle}>
              <MaterialCommunityIcons name="volume-high" size={20} color={Colors.primary} />
            </View>
            <View style={styles.commandInfo}>
              <Text style={styles.commandLabel}>
                {isTamil ? cmd.labelTa : cmd.labelEn}
              </Text>
              <Text style={styles.commandDesc}>{cmd.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Native Build Note */}
      <View style={styles.noticeBox}>
        <MaterialCommunityIcons name="information-outline" size={18} color="#1565C0" />
        <Text style={styles.noticeText}>
          Text-to-speech audio playback is active via Expo Speech (`expo-speech`). Real-time continuous background streaming STT requires microphone native prebuild permissions on target devices.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  micCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  micCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: Spacing.md,
  },
  micCircleActive: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 1.08 }],
  },
  recognizedText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  micHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  commandList: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm + 2,
  },
  commandInfo: {
    flex: 1,
  },
  commandLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  commandDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: Spacing.sm + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: '#0D47A1',
    lineHeight: 16,
  },
});
