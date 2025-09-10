import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { config } from '../src/config/environment';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen.tsx';

interface CustomPromptModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function CustomPromptMode({ onGenerate, isGenerating }: CustomPromptModeProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [magicWandAnim] = useState(new Animated.Value(1));
  const [generateAnim] = useState(new Animated.Value(1));
  const [promptAnim] = useState(new Animated.Value(1));

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
      
      // Call backend magic-wand function
      const response = await fetch(config.apiUrl('magic-wand'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt, enhanceNegativePrompt: false })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance prompt');
      }
      setCustomPrompt(data.enhancedPrompt || customPrompt);
    } catch (err: any) {
      Alert.alert('Magic Wand', err?.message || 'Failed to enhance prompt.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom</Text>
      <Text style={styles.subtitle}>Describe. Create.</Text>
      
      <Animated.View style={[styles.promptContainer, { transform: [{ scale: promptAnim }] }]}>
        <View style={[styles.promptInputWrapper, { backgroundColor: '#18181b' }]}>
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
          />
          
          {/* Magic Wand Button */}
          <Animated.View style={[styles.magicWandButton, { transform: [{ scale: magicWandAnim }] }]}>
            <TouchableOpacity
              onPress={handleMagicWand}
              disabled={!customPrompt.trim() || isGenerating}
              style={styles.magicWandTouchable}
            >
              <Text style={styles.magicWandIcon}>✨</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Generate Button */}
          <Animated.View style={[styles.generateIconButton, { transform: [{ scale: generateAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.generateTouchable,
                (!customPrompt.trim() || isGenerating) && styles.generateIconButtonDisabled
              ]}
              onPress={handleGenerate}
              disabled={!customPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <View style={styles.spinner} />
              ) : (
                <ArrowUp size={16} color="#000000" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

export default function GenerateCustomScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "custom-prompt"}>
      <CustomPromptMode />
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  promptContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  promptInputWrapper: {
    position: 'relative',
    borderRadius: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    // Grid pattern using border
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  promptInput: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingRight: 80,
    fontSize: 14,
    color: '#ffffff',
    minHeight: 120,
    zIndex: 2,
  },
  magicWandButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 3,
  },
  magicWandTouchable: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  magicWandIcon: {
    fontSize: 18,
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generateIconButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 3,
  },
  generateTouchable: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  generateIconButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
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
