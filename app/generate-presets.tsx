import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PresetsService, { DatabasePreset } from '../src/services/presetsService';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface PresetsModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function PresetsMode({ onGenerate, isGenerating }: PresetsModeProps) {
  const [availablePresets, setAvailablePresets] = useState<DatabasePreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});

  // Load presets from database on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setPresetsLoading(true);
        setPresetsError(null);

        const presetsService = PresetsService.getInstance();
        const response = await presetsService.getAvailablePresets();

        if (response.success && response.data) {
          setAvailablePresets(response.data.presets);
          console.log('🎨 [PresetsMode] Loaded', response.data.presets.length, 'presets for week', response.data.currentWeek);
        } else {
          throw new Error(response.error || 'Failed to load presets');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setPresetsError(errorMessage);
        console.error('❌ [PresetsMode] Failed to load presets:', errorMessage);
      } finally {
        setPresetsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const handlePresetClick = (presetId: string) => {
    console.log('Preset clicked:', presetId);
    
    // Initialize animation if not exists
    if (!presetAnims[presetId]) {
      presetAnims[presetId] = new Animated.Value(1);
    }
    
    setSelectedPreset(presetId);
    
    // Magic animation on preset click
    Animated.sequence([
      Animated.timing(presetAnims[presetId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[presetId], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[presetId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-run generation immediately when preset is clicked
    onGenerate(presetId);
  };

  // Get current week's presets from database
  const getCurrentWeekPresets = (): DatabasePreset[] => {
    return availablePresets.filter(preset => preset.isActive);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presets</Text>
      <Text style={styles.subtitle}>One-tap styles.</Text>
      
      <View style={styles.presetContainer}>
        {presetsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.loadingText}>Loading presets...</Text>
          </View>
        ) : presetsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load presets</Text>
            <Text style={styles.errorSubtext}>{presetsError}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setPresetsError(null);
                // Trigger reload by clearing presets and letting useEffect run again
                setAvailablePresets([]);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.presetGrid}>
            {(() => {
              const currentPresets = getCurrentWeekPresets();
              const firstRow = currentPresets.slice(0, 3);
              const secondRow = currentPresets.slice(3, 5);
              
              return (
                <>
                  <View style={styles.presetRow}>
                    {firstRow.map((preset) => (
                      <Animated.View 
                        key={preset.id} 
                        style={[
                          styles.presetButtonWrapper,
                          { transform: [{ scale: presetAnims[preset.key] || 1 }] }
                        ]}
                      >
                        <TouchableOpacity 
                          onPress={() => handlePresetClick(preset.key)}
                          style={styles.presetTouchable}
                        >
                          <LinearGradient
                            colors={selectedPreset === preset.key 
                              ? ['#ffffff', '#f0f0f0'] 
                              : ['#0f0f0f', '#1a1a1a']
                            }
                            style={styles.presetButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            {/* Vintage lines pattern overlay */}
                            <View style={styles.vintageLinesOverlay} />
                            
                            {/* Film strip overlay */}
                            <View style={styles.filmStripOverlay} />
                            
                            <Text style={[
                              styles.presetText,
                              selectedPreset === preset.key && styles.presetTextSelected
                            ]}>
                              {preset.label}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                  <View style={styles.presetRow}>
                    {secondRow.map((preset) => (
                      <Animated.View 
                        key={preset.id} 
                        style={[
                          styles.presetButtonWrapper,
                          { transform: [{ scale: presetAnims[preset.key] || 1 }] }
                        ]}
                      >
                        <TouchableOpacity 
                          onPress={() => handlePresetClick(preset.key)}
                          style={styles.presetTouchable}
                        >
                          <LinearGradient
                            colors={selectedPreset === preset.key 
                              ? ['#ffffff', '#f0f0f0'] 
                              : ['#0f0f0f', '#1a1a1a']
                            }
                            style={styles.presetButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            {/* Vintage lines pattern overlay */}
                            <View style={styles.vintageLinesOverlay} />
                            
                            {/* Film strip overlay */}
                            <View style={styles.filmStripOverlay} />
                            
                            <Text style={[
                              styles.presetText,
                              selectedPreset === preset.key && styles.presetTextSelected
                            ]}>
                              {preset.label}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                </>
              );
            })()}
          </View>
        )}
      </View>
    </View>
  );
}

export default function GeneratePresetsScreen() {
  return (
    <BaseGenerationScreen mode="presets">
      <PresetsMode />
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
  vintageLinesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.1,
    // Vintage lines pattern using borders
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filmStripOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
