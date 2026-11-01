import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../../types/navigation';
import { ChatMessage } from '../../types/ai';
import { sendChatMessage } from '../../services/aiService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AiAssistant'>;

const PROMPT_CHIPS_EN = [
  'How to cure Tomato leaf blight?',
  'Best fertilizer schedule for Paddy?',
  'Drip irrigation guide for sandy soil',
  'Organic pest control for Brinjal',
];

const PROMPT_CHIPS_TA = [
  'தக்காளி இலைக்கருகல் கட்டுப்படுத்த மருந்து?',
  'நெல் பயிருக்கான உரம் அட்டவணை?',
  'மணல் பாங்கான நிலத்தில் சொட்டு நீர் பாசனம்',
  'கத்தரி பயிரில் இயற்கை பூச்சி கட்டுப்பாடு',
];

export const AiAssistantScreen: React.FC<Props> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Vanakkam! I am your Smart Uzhavan AI Agricultural Assistant. Ask me anything about crop diseases, pest remedies, organic fertilizers, irrigation schedules, or mandi rates.',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTamil, setIsTamil] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: textToSend.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(
        textToSend.trim(),
        messages,
        isTamil ? 'ta' : 'en'
      );

      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        text: reply,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        text: 'Sorry, I encountered an issue processing your agricultural question. Please try again.',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSpeak = async (message: ChatMessage) => {
    if (speakingId === message.id) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }

    Speech.stop();
    setSpeakingId(message.id);

    try {
      Speech.speak(message.text, {
        language: isTamil ? 'ta-IN' : 'en-IN',
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    } catch (e) {
      setSpeakingId(null);
    }
  };

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const promptChips = isTamil ? PROMPT_CHIPS_TA : PROMPT_CHIPS_EN;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Language Bar */}
      <View style={styles.topBar}>
        <View style={styles.aiStatusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.aiStatusText}>
            {isTamil ? 'விவசாய AI தயார்' : 'Agri AI Active'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setIsTamil(!isTamil)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="translate" size={16} color={Colors.primary} />
          <Text style={styles.langToggleText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          const isSpeaking = speakingId === item.id;

          return (
            <View
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble,
                item.isError && styles.errorBubble,
              ]}
            >
              {!isUser && (
                <View style={styles.assistantHeader}>
                  <MaterialCommunityIcons name="robot" size={14} color={Colors.primary} />
                  <Text style={styles.assistantName}>Smart Uzhavan AI</Text>
                  <TouchableOpacity
                    style={styles.speakerButton}
                    onPress={() => toggleSpeak(item)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={isSpeaking ? 'volume-high' : 'volume-medium'}
                      size={18}
                      color={isSpeaking ? Colors.primary : Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <Text
                style={[
                  styles.messageText,
                  isUser ? styles.userText : styles.assistantText,
                ]}
              >
                {item.text}
              </Text>

              <Text
                style={[
                  styles.timestampText,
                  isUser ? styles.userTimestamp : styles.assistantTimestamp,
                ]}
              >
                {item.timestamp}
              </Text>
            </View>
          );
        }}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>
            {isTamil ? 'விவசாய பதில் தயாராகிறது...' : 'Consulting agronomy models...'}
          </Text>
        </View>
      )}

      {/* Suggestion Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={promptChips}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chip}
              onPress={() => handleSend(item)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="lightbulb-outline" size={14} color={Colors.primary} />
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            isTamil
              ? 'விவசாய கேள்விகளை கேட்கவும்...'
              : 'Ask an agricultural question...'
          }
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="send"
            size={18}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aiStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  aiStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  errorBubble: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  assistantName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
  speakerButton: {
    padding: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.textPrimary,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: Colors.textMuted,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  chipsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  chipsScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  chipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
});
