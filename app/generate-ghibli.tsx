import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen.tsx';
import PresetsService, { DatabasePreset } from '../src/services/presetsService';

interface GhibliReactionModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function GhibliReactionMode({ onGenerate }: GhibliReactionModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});
  const [presets, setPresets] = useState<DatabasePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ghibli reaction presets from database
  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await PresetsService.getInstance().getModeSpecificPresets('ghibli-reaction');
        if (response.success && response.data) {
          setPresets(response.data.presets.filter(preset => preset.isActive));
        } else {
          setError(response.error || 'Failed to load presets');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load presets');
      } finally {
        setLoading(false);
      }
    };

    loadPresets();
  }, []);

  const handlePresetClick = (preset: DatabasePreset) => {
    console.log('Ghibli preset clicked:', preset.id);
    
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
    
    onGenerate(preset.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghibli Reaction</Text>
      <Text style={styles.subtitle}>Animated emotions.</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading presets...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.presetContainer}>
          <View style={styles.presetGrid}>
            {presets.map((preset) => (
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
      )}
    </View>
  );
}

export default function GenerateGhibliScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "ghibli-reaction"}>
      <GhibliReactionMode />
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
  presetContainer: {
    marginTop: 8,
    marginBottom: 12,
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 60,
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
  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
});
