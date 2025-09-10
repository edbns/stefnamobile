import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { config } from '../src/config/environment';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface StudioPromptModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function StudioPromptMode({ onGenerate, isGenerating }: StudioPromptModeProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [magicWandAnim] = useState(new Animated.Value(1));
  const [generateAnim] = useState(new Animated.Value(1));
  const [promptAnim] = useState(new Animated.Value(1));

  const handleGenerate = () => {
    if (!customPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a prompt for this generation mode.');
      return;
    }
    onGenerate(undefined, customPrompt);
  };

  const handleMagicWand = async () => {
    try {
      if (!customPrompt.trim()) return;
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
      <Text style={styles.title}>Studio</Text>
      <Text style={styles.subtitle}>Tools for precision.</Text>
      
      <View style={styles.promptContainer}>
        <View style={styles.promptInputWrapper}>
          <TextInput
            style={styles.promptInput}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            placeholder="Change something, add something — your call ... tap ✨ for a little magic."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          {/* Magic Wand Button */}
          <TouchableOpacity
            style={styles.magicWandButton}
            onPress={handleMagicWand}
            disabled={!customPrompt.trim() || isGenerating}
          >
            <Text style={styles.magicWandIcon}>✨</Text>
          </TouchableOpacity>
          
          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateIconButton,
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
        </View>
      </View>
    </View>
  );
}

export default function GenerateStudioScreen() {
  return (
    <BaseGenerationScreen mode="edit-photo">
      <StudioPromptMode />
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#333333',
  },
  promptInput: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingRight: 80,
    fontSize: 14,
    color: '#ffffff',
    minHeight: 100,
  },
  magicWandButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magicWandIcon: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.7,
  },
  generateIconButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
