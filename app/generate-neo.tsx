import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface NeoPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface NeoTokyoModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function NeoTokyoMode({ onGenerate }: NeoTokyoModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Real Neo Tokyo presets from website (exact same data)
  const neoPresets: NeoPreset[] = [
    {
      id: 'neo_tokyo_base',
      label: 'Base',
      description: 'Cyberpunk portrait with Neo Tokyo aesthetics',
      prompt: 'Cyberpunk portrait with Neo Tokyo aesthetics. Face retains core features with glitch distortion and color shifts. Cel-shaded anime style with holographic elements, glitch effects, and neon shimmer. Background: vertical city lights, violet haze, soft scanlines. Colors: electric pink, cyan, sapphire blue, ultraviolet, black. Inspired by Akira and Ghost in the Shell.'
    },
    {
      id: 'neo_tokyo_visor',
      label: 'Glitch Visor',
      description: 'Glowing glitch visor covering the eyes',
      prompt: 'Cyberpunk portrait with a glowing glitch visor covering the eyes. Face retains core features with glitch distortion and color shifts. Add flickering holographic overlays, visor reflections, and neon lighting. Background: animated signs, deep contrast, vertical noise. Colors: vivid magenta visor, cyan-blue reflections, violet haze, black backdrop.'
    },
    {
      id: 'neo_tokyo_tattoos',
      label: 'Tech Tattoos',
      description: 'Vivid neon tattoos and holographic overlays',
      prompt: 'Transform the human face into a cyberpunk glitch aesthetic with vivid neon tattoos and holographic overlays. Retain the subject\'s facial features, gender, and ethnicity. Apply stylized glowing tattoos on the cheeks, jawline, or neck. Add glitch patterns, chromatic distortion, and soft RGB splits. Use cinematic backlighting with a futuristic, dreamlike tone. The skin should retain texture, but colors can be surreal. Preserve facial integrity — no face swap or anime overlay.'
    },
    {
      id: 'neo_tokyo_scanlines',
      label: 'Scanline FX',
      description: 'CRT scanline effects and VHS noise',
      prompt: 'Cyberpunk portrait with CRT scanline effects. Face retains core features with glitch distortion and color shifts. Overlay intense CRT scanlines and VHS noise. Simulate broken holographic monitor interface. Use high-contrast neon hues with cel-shaded highlights and neon reflections. Background: corrupted cityscape through broken CRT monitor. Colors: vivid pink, cyan, ultraviolet, blue, black.'
    }
  ];

  const handlePresetClick = (preset: NeoPreset) => {
    // Prevent double-click
    if (isProcessing) {
      console.log('Neo Tokyo preset click ignored - already processing');
      return;
    }
    
    console.log('Neo Tokyo preset clicked:', preset.id);
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
      <Text style={styles.title}>Neo Tokyo</Text>
      <Text style={styles.subtitle}>Future meets the face.</Text>
      
      <View style={styles.presetContainer}>
        <View style={styles.presetGrid}>
          {/* First row - 3 presets */}
          <View style={styles.presetRow}>
            {neoPresets.slice(0, 3).map((preset) => (
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
            {neoPresets.slice(3).map((preset) => (
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

export default function GenerateNeoScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "neo-glitch"}>
      <NeoTokyoMode onGenerate={() => {}} isGenerating={false} />
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
