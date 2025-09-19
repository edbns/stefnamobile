import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { config } from '../config/environment';
import PresetsService, { DatabasePreset } from '../services/presetsService';

export type GenerationMode = 'custom-prompt' | 'edit-photo' | 'presets' | 'unreal-reflection' | 'ghibli-reaction' | 'neo-glitch' | 'parallel-self';

interface GenerationModesProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  onGenerate: (presetId?: string, mode?: GenerationMode) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
  isGenerating: boolean;
}

export default function GenerationModes({
  selectedMode,
  onModeChange,
  onGenerate,
  customPrompt,
  onCustomPromptChange,
  isGenerating,
}: GenerationModesProps) {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [availablePresets, setAvailablePresets] = useState<DatabasePreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [presetsError, setPresetsError] = useState<string | null>(null);

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
          console.log('[GenerationModes] Loaded', response.data.presets.length, 'presets for week', response.data.currentWeek);
        } else {
          throw new Error(response.error || 'Failed to load presets');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setPresetsError(errorMessage);
        console.error('❌ [GenerationModes] Failed to load presets:', errorMessage);
      } finally {
        setPresetsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const handleModePress = (mode: GenerationMode) => {
    console.log('[GenerationModes] Mode pressed:', {
      pressedMode: mode,
      currentSelectedMode: selectedMode,
      modeType: typeof mode
    });
    
    onModeChange(mode);
    
    // Show prompt input for custom and edit modes
    if (mode === 'custom-prompt' || mode === 'edit-photo') {
      setShowPromptInput(true);
    } else {
      setShowPromptInput(false);
    }
  };

  const getModeTitle = (mode: GenerationMode): string => {
    const titles: Record<GenerationMode, string> = {
      'custom-prompt': 'Custom',
      'edit-photo': 'Studio',
      'presets': 'Presets',
      'unreal-reflection': 'Unreal Reflection',
      'ghibli-reaction': 'Ghibli Reaction',
      'neo-glitch': 'Neo Tokyo Glitch',
      'parallel-self': 'Parallel Self',
    };
    return titles[mode] || mode;
  };

  const handleGenerate = () => {
    if ((selectedMode === 'custom-prompt' || selectedMode === 'edit-photo') && !customPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a prompt for this generation mode.');
      return;
    }
    
    console.log('[GenerationModes] handleGenerate called:', {
      selectedMode,
      modeType: typeof selectedMode,
      isUndefined: selectedMode === undefined,
      hasCustomPrompt: !!customPrompt.trim()
    });
    
    // Ensure we have a valid mode before proceeding
    if (!selectedMode) {
      console.error('❌ [GenerationModes] selectedMode is undefined in handleGenerate!');
      Alert.alert('Error', 'Generation mode is not selected. Please try again.');
      return;
    }
    
    onGenerate(undefined, selectedMode);
  };

  const handlePresetClick = (presetId: string) => {
    console.log('[GenerationModes] Preset clicked:', {
      presetId,
      selectedMode,
      modeType: typeof selectedMode,
      isUndefined: selectedMode === undefined
    });
    
    // Ensure we have a valid mode before proceeding
    if (!selectedMode) {
      console.error('❌ [GenerationModes] selectedMode is undefined! Cannot proceed with generation.');
      Alert.alert('Error', 'Generation mode is not selected. Please try again.');
      return;
    }
    
    // Auto-run generation immediately when preset is clicked
    onGenerate(presetId, selectedMode);
  };

  // Get current week's presets from database
  const getCurrentWeekPresets = (): DatabasePreset[] => {
    return availablePresets.filter(preset => preset.isActive);
  };

  // Define modes in website order: Custom, Edit (Studio), Presets, Unreal Reflection, Ghibli React, Neo Tokyo, Parallel Self
  const modes: GenerationMode[] = ['custom-prompt', 'edit-photo', 'presets', 'unreal-reflection', 'ghibli-reaction', 'neo-glitch', 'parallel-self'];
  
  // Split into two rows: first row has 4 modes, second row has 3 modes
  const firstRow = modes.slice(0, 4);
  const secondRow = modes.slice(4, 7);

  return (
    <View style={styles.container}>
      {/* Mode Selection - first row has 4 modes, second row has 3 modes */}
      <View style={styles.modesGrid}>
        {/* First Row */}
        <View style={styles.modesRow}>
          {firstRow.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                selectedMode === mode && styles.modeButtonSelected,
              ]}
              onPress={() => handleModePress(mode)}
            >
              <Text style={styles.modeTitle}>{getModeTitle(mode)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Options appear full width under first row */}
      {(selectedMode === 'custom-prompt' || selectedMode === 'edit-photo') && showPromptInput && (
        <View style={styles.promptContainer}>
            <View style={styles.promptInputWrapper}>
          <TextInput
            style={styles.promptInput}
            value={customPrompt}
            onChangeText={onCustomPromptChange}
            placeholder={
              selectedMode === 'custom-prompt'
                    ? "Type something weird. We'll make it art ... tap ✨ for a little magic."
                    : "Change something, add something — your call ... tap ✨ for a little magic."
            }
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
              
              {/* Magic Wand Button - Inside text input */}
              <TouchableOpacity
                style={styles.magicWandButton}
                onPress={async () => {
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
                    onCustomPromptChange(data.enhancedPrompt || customPrompt);
                  } catch (err: any) {
                    Alert.alert('Magic Wand', err?.message || 'Failed to enhance prompt.');
                  }
                }}
                disabled={!customPrompt.trim() || isGenerating}
              >
                <Text style={styles.magicWandIcon}>✨</Text>
              </TouchableOpacity>
              
              {/* Generate Button - Inside text input, white background */}
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
        )}
        
        {selectedMode === 'presets' && (
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
                          <TouchableOpacity 
                            key={preset.id} 
                            style={styles.presetButton} 
                            onPress={() => handlePresetClick(preset.key)}
                          >
                            <Text style={styles.presetText}>{preset.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.presetRow}>
                        {secondRow.map((preset) => (
                          <TouchableOpacity 
                            key={preset.id} 
                            style={styles.presetButton} 
                            onPress={() => handlePresetClick(preset.key)}
                          >
                            <Text style={styles.presetText}>{preset.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
        </View>
      )}

        {/* Second Row */}
        <View style={styles.modesRow}>
          {secondRow.map((mode) => (
      <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                selectedMode === mode && styles.modeButtonSelected,
              ]}
              onPress={() => handleModePress(mode)}
            >
              <Text style={styles.modeTitle}>{getModeTitle(mode)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Options appear full width under second row */}
        {selectedMode === 'unreal-reflection' && (
          <View style={styles.presetContainer}>
            <View style={styles.presetGrid}>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('unreal_reflection_digital_monk')}>
                  <Text style={styles.presetText}>Nostalgia + Distance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('unreal_reflection_urban_oracle')}>
                  <Text style={styles.presetText}>Joy + Sadness</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('unreal_reflection_desert_mirror')}>
                  <Text style={styles.presetText}>Confidence + Loneliness</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('unreal_reflection_lumin_void')}>
                  <Text style={styles.presetText}>Peace + Fear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('unreal_reflection_prism_break')}>
                  <Text style={styles.presetText}>Strength + Vulnerability</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedMode === 'ghibli-reaction' && (
          <View style={styles.presetContainer}>
            <View style={styles.presetGrid}>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('ghibli_tears')}>
                  <Text style={styles.presetText}>Tears</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('ghibli_shock')}>
                  <Text style={styles.presetText}>Shock</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('ghibli_sparkle')}>
                  <Text style={styles.presetText}>Sparkle</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('ghibli_sadness')}>
                  <Text style={styles.presetText}>Sadness</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('ghibli_love')}>
                  <Text style={styles.presetText}>Love</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedMode === 'neo-glitch' && (
          <View style={styles.presetContainer}>
            <View style={styles.presetGrid}>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('neo_tokyo_base')}>
                  <Text style={styles.presetText}>Base</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('neo_tokyo_visor')}>
                  <Text style={styles.presetText}>Glitch Visor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('neo_tokyo_tattoos')}>
                  <Text style={styles.presetText}>Tech Tattoos</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('neo_tokyo_scanlines')}>
                  <Text style={styles.presetText}>Scanline FX</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedMode === 'parallel-self' && (
          <View style={styles.presetContainer}>
            <View style={styles.presetGrid}>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('parallel_self_rain_dancer')}>
                  <Text style={styles.presetText}>Rain Dancer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('parallel_self_cyberpunk')}>
                  <Text style={styles.presetText}>Cyberpunk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('parallel_self_vintage')}>
                  <Text style={styles.presetText}>Vintage</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('parallel_self_fantasy')}>
                  <Text style={styles.presetText}>Fantasy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('parallel_self_minimalist')}>
                  <Text style={styles.presetText}>Minimalist</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modesGrid: {
    marginBottom: 16,
  },
  modesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modeButtonSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
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
    marginBottom: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
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