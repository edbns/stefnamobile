import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface EmotionPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface EmotionMaskModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function EmotionMaskMode({ onGenerate }: EmotionMaskModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});

  // Real Emotion Mask presets from website (exact same data)
  const emotionPresets: EmotionPreset[] = [
    {
      id: 'emotion_mask_nostalgia_distance',
      label: 'Nostalgia + Distance',
      description: 'Soft memory lens with contemplative expression',
      prompt: 'Portrait reflecting longing and emotional distance. Subject gazing away as if lost in memory, with a soft, contemplative expression. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
    },
    {
      id: 'emotion_mask_joy_sadness',
      label: 'Joy + Sadness',
      description: 'Smile-through-tears with hopeful eyes',
      prompt: 'Portrait capturing bittersweet emotions, smiling through tears, hopeful eyes with a melancholic undertone. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
    },
    {
      id: 'emotion_mask_conf_loneliness',
      label: 'Confidence + Loneliness',
      description: 'Powerful pose with solitary atmosphere',
      prompt: 'Powerful pose with solitary atmosphere. Strong gaze, isolated composition, contrast between inner resilience and quiet sadness. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
    },
    {
      id: 'emotion_mask_peace_fear',
      label: 'Peace + Fear',
      description: 'Calm expression under tense atmosphere',
      prompt: 'Emotive portrait with calm expression under tense atmosphere. Soft smile with flickers of anxiety in the eyes, dual-toned lighting (cool and warm). Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
    },
    {
      id: 'emotion_mask_strength_vuln',
      label: 'Strength + Vulnerability',
      description: 'Inner strength with subtle vulnerability',
      prompt: 'A cinematic portrait showing inner strength with a subtle vulnerability. Intense eyes, guarded posture, but soft facial micro-expressions. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
    }
  ];

  const handlePresetClick = (preset: EmotionPreset) => {
    console.log('Emotion preset clicked:', preset.id);
    
    // Initialize animation if not exists
    if (!presetAnims[preset.id]) {
      presetAnims[preset.id] = new Animated.Value(1);
    }
    
    setSelectedPreset(preset.id);
    
    // Magic animation on preset click
    Animated.sequence([
      Animated.timing(presetAnims[preset.id], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[preset.id], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[preset.id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onGenerate(preset.id, preset.prompt);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotion Mask</Text>
      <Text style={styles.subtitle}>Faces that feel.</Text>
      
      <View style={styles.presetContainer}>
        <View style={styles.presetGrid}>
          {emotionPresets.map((preset) => (
            <Animated.View 
              key={preset.id}
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims[preset.id] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick(preset)}
                style={styles.presetTouchable}
              >
                <View style={[
                  styles.presetButton,
                  { backgroundColor: selectedPreset === preset.id ? '#ffffff' : '#0f0f0f' }
                ]}>
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === preset.id && styles.presetTextSelected
                  ]}>
                    {preset.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function GenerateEmotionScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "emotion-mask"}>
      <EmotionMaskMode onGenerate={() => {}} isGenerating={false} />
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
    textAlign: 'center',
  },
  presetContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'column',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  presetTouchable: {
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  presetButton: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  magicalGlowOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    opacity: 0.3,
    // Radial glow effect
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  presetTextSelected: {
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
  },
});
