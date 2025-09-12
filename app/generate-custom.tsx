import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';
import MagicWandService from '../src/services/magicWandService';
import ModernSpinner from '../src/components/ModernSpinner';

interface CustomPromptModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  setIsTyping: (isTyping: boolean) => void;
}

function CustomPromptMode({ onGenerate, setIsTyping }: CustomPromptModeProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [magicWandAnim] = useState(new Animated.Value(1));
  const [generateAnim] = useState(new Animated.Value(1));
  const [promptAnim] = useState(new Animated.Value(1));
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleGenerate = () => {
    if (!customPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a prompt for this generation mode.');
      return;
    }
    
    // Magic animation on generate
    Animated.sequence([
      Animated.timing(generateAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(generateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onGenerate(undefined, customPrompt);
  };

  const handleMagicWand = async () => {
    try {
      if (!customPrompt.trim()) return;
      
      setIsEnhancing(true);
      
      // Magic wand animation
      Animated.sequence([
        Animated.timing(magicWandAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(magicWandAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Use centralized MagicWandService
      const result = await MagicWandService.enhancePrompt(customPrompt, false);
      if (result.success && result.enhancedPrompt) {
        setCustomPrompt(result.enhancedPrompt);
      } else {
        throw new Error('Failed to enhance prompt');
      }
    } catch (err: any) {
      Alert.alert('Magic Wand', err?.message || 'Failed to enhance prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.promptInputWrapper, { backgroundColor: '#18181b', transform: [{ scale: promptAnim }] }]}>
          {/* Grid pattern overlay */}
          <View style={styles.gridOverlay} />
          
          <TextInput
            style={styles.promptInput}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="Type something weird. We'll make it art ... tap ✨ for a little magic."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={false}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
            {/* Enhance Button - Circle */}
            <Animated.View style={[styles.magicWandButton, { transform: [{ scale: magicWandAnim }] }]}>
              <TouchableOpacity
                onPress={handleMagicWand}
                disabled={!customPrompt.trim() || isEnhancing}
                style={[
                  styles.magicWandTouchable,
                  isEnhancing && styles.magicWandTouchableDisabled
                ]}
              >
                {isEnhancing ? (
                  <ModernSpinner size={24} color="#ffffff" />
                ) : (
                  <Text style={styles.magicWandIcon}>✨</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Generate Button - Full Width */}
            <Animated.View style={[styles.generateButton, { transform: [{ scale: generateAnim }] }]}>
              <TouchableOpacity
                style={[
                  styles.generateTouchable,
                  (!customPrompt.trim()) && styles.generateButtonDisabled
                ]}
                onPress={handleGenerate}
                disabled={!customPrompt.trim()}
              >
                <>
                  <ArrowUp size={20} color="#000000" />
                  <Text style={styles.generateText}>Generate</Text>
                </>
              </TouchableOpacity>
            </Animated.View>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function GenerateCustomScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode="custom-prompt">
      {({ onGenerate }) => (
        <CustomPromptMode onGenerate={onGenerate} />
      )}
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, // Space for floating back button
    paddingBottom: 20,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150, // Increased for keyboard
  },
  promptInputWrapper: {
    position: 'relative',
    borderRadius: 16,
    minHeight: 120,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    opacity: 0.1,
  },
        promptInput: {
          backgroundColor: 'transparent',
          padding: 20,
          fontSize: 14,
          color: '#ffffff',
          minHeight: 120,
          zIndex: 2,
          borderWidth: 0,
        },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
    gap: 12,
  },
  magicWandButton: {
    // Circle button - fixed size
  },
  magicWandTouchable: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  magicWandTouchableDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.6,
  },
  magicWandIcon: {
    fontSize: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generateButton: {
    flex: 1,
  },
  generateTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  generateText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginLeft: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#000000',
    borderTopColor: 'transparent',
    borderRadius: 8,
  },
});
