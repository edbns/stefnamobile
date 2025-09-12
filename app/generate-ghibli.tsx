import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';
import { GHIBLI_REACTION_PRESETS, GhibliReactionPreset } from '../src/presets/ghibliReact';

interface GhibliReactionModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
}

function GhibliReactionMode({ onGenerate }: GhibliReactionModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Use centralized presets from website
  const ghibliPresets = GHIBLI_REACTION_PRESETS.map((preset: GhibliReactionPreset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.features?.join(', ') || 'Ghibli-style transformation',
    prompt: preset.prompt
  }));

  const handlePresetClick = (preset: { id: string; label: string; description: string; prompt: string }) => {
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
    ]).start();
    
    // Auto-run generation immediately when preset is clicked
    onGenerate(preset.id);
    
    // Reset processing state after a delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
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
    <BaseGenerationScreen mode="ghibli-reaction">
      {({ onGenerate }) => (
        <GhibliReactionMode onGenerate={onGenerate} />
      )}
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
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
