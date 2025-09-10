import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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
