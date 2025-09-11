import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface GhibliPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface GhibliReactionModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function GhibliReactionMode({ onGenerate }: GhibliReactionModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Real Ghibli reaction presets from website (exact same data)
  const ghibliPresets: GhibliPreset[] = [
    {
      id: 'ghibli_tears',
      label: 'Tears',
      description: 'Delicate tears and trembling expression',
      prompt: 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Add delicate tears and a trembling expression. Add delicate tears under the eyes, a trembling mouth, and a soft pink blush. Keep the face fully intact with original skin tone, gender, and identity. Use soft, cinematic lighting and warm pastel tones like a Ghibli film.'
    },
    {
      id: 'ghibli_shock',
      label: 'Shock',
      description: 'Wide eyes and parted lips showing surprise',
      prompt: 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Widen the eyes and part the lips slightly to show surprise. Slightly widen the eyes, part the lips, and show light tension in the expression. Maintain identity, ethnicity, and facial realism. Add soft sparkles and cinematic warmth — like a frame from a Studio Ghibli film.'
    },
    {
      id: 'ghibli_sparkle',
      label: 'Sparkle',
      description: 'Medium sparkles around cheeks with golden highlights',
      prompt: 'Transform the human face into a magical Ghibli-style sparkle reaction while preserving full identity, ethnicity, skin tone, and facial structure. Add medium sparkles around the cheeks only, shimmering golden highlights in the eyes, and soft pink blush on the cheeks. Keep sparkles focused on the cheek area to complement the blush without overwhelming it. Use pastel cinematic tones with gentle sparkle effects and dreamy lighting. Background should have gentle bokeh with soft light flares. Maintain original composition and realism with subtle magical sparkle effects on cheeks.'
    },
    {
      id: 'ghibli_sadness',
      label: 'Sadness',
      description: 'Melancholic emotion with glossy eyes and distant gaze',
      prompt: 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Add melancholic emotion with glossy eyes and distant gaze. Emphasize melancholic emotion through glossy, teary eyes, a distant gaze, and softened facial features. Slight tear trails may appear but no crying mouth. Preserve full identity, ethnicity, skin, and structure. Lighting should be dim, cinematic, and pastel-toned like a Ghibli evening scene.'
    },
    {
      id: 'ghibli_love',
      label: 'Love',
      description: 'Soft pink blush, warm sparkle in eyes, gentle smile',
      prompt: 'Transform the human face into a romantic Ghibli-style love reaction while preserving full identity, ethnicity, skin tone, and facial structure. Add soft pink blush on the cheeks, warm sparkle in the eyes, and a gentle, shy smile. Include subtle floating hearts or sparkles around the face to enhance emotional expression. Use pastel cinematic tones and soft golden lighting to create a dreamy, cozy atmosphere. Background should have gentle bokeh with subtle Ghibli-style light flares. Maintain original composition and realism with only slight anime influence.'
    }
  ];

  const handlePresetClick = (preset: GhibliPreset) => {
    // Prevent double-click
    if (isProcessing) {
      console.log('Ghibli preset click ignored - already processing');
      return;
    }
    
    console.log('Ghibli preset clicked:', preset.id);
    setIsProcessing(true);
    
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
    ]).start(() => {
      // Call onGenerate after animation completes
      onGenerate(preset.id, preset.prompt);
      
      // Reset processing state after a delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghibli Reaction</Text>
      <Text style={styles.subtitle}>Animated emotions.</Text>
      
      <View style={styles.presetContainer}>
        <View style={styles.presetGrid}>
          {/* First row - 3 presets */}
          <View style={styles.presetRow}>
            {ghibliPresets.slice(0, 3).map((preset) => (
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
          
          {/* Second row - remaining presets */}
          <View style={styles.presetRow}>
            {ghibliPresets.slice(3).map((preset) => (
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
    </View>
  );
}

export default function GenerateGhibliScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "ghibli-reaction"}>
      <GhibliReactionMode onGenerate={() => {}} isGenerating={false} />
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
