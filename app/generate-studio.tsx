import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { config } from '../src/config/environment';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen.tsx';

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
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Studio</Text>
          <Text style={styles.subtitle}>Tools for precision.</Text>
          
          <Animated.View style={[styles.promptContainer, { transform: [{ scale: promptAnim }] }]}>
            <View style={[styles.promptInputWrapper, { backgroundColor: '#0f0f0f' }]}>
              {/* Tech grid pattern overlay */}
              <View style={styles.techGridOverlay} />
              
              {/* Camera frame overlay */}
              <View style={styles.cameraFrameOverlay} />
              
              <TextInput
                style={styles.promptInput}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="Change something, add something — your call ... tap ✨ for a little magic."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Animated.View style={[styles.magicWandButton, { transform: [{ scale: magicWandAnim }] }]}>
              <TouchableOpacity
                onPress={handleMagicWand}
                disabled={!customPrompt.trim() || isGenerating}
                style={styles.magicWandTouchable}
              >
                <Text style={styles.magicWandIcon}>✨</Text>
                <Text style={styles.magicWandText}>Enhance</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.generateButton, { transform: [{ scale: generateAnim }] }]}>
              <TouchableOpacity
                style={[
                  styles.generateTouchable,
                  (!customPrompt.trim() || isGenerating) && styles.generateButtonDisabled
                ]}
                onPress={handleGenerate}
                disabled={!customPrompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <View style={styles.spinner} />
                ) : (
                  <>
                    <ArrowUp size={20} color="#000000" />
                    <Text style={styles.generateText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function GenerateStudioScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "edit-photo"}>
      <StudioPromptMode />
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
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
  techGridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    opacity: 0.1,
    // Tech grid pattern using borders
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraFrameOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    opacity: 0.3,
  },
  promptInput: {
    backgroundColor: 'transparent',
    padding: 20,
    fontSize: 14,
    color: '#ffffff',
    minHeight: 120,
    zIndex: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  magicWandButton: {
    flex: 1,
    marginRight: 8,
  },
  magicWandTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  magicWandIcon: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  magicWandText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  generateButton: {
    flex: 1,
    marginLeft: 8,
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
