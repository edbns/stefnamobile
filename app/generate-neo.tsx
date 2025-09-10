import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

interface NeoTokyoModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function NeoTokyoMode({ onGenerate }: NeoTokyoModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});

  const handlePresetClick = (presetId: string) => {
    console.log('Neo Tokyo preset clicked:', presetId);
    
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
    
    onGenerate(presetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neo Tokyo</Text>
      <Text style={styles.subtitle}>Future meets the face.</Text>
      
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
    </View>
  );
}

export default function GenerateNeoScreen() {
  const { mode } = useLocalSearchParams();
  return (
    <BaseGenerationScreen mode={mode as string || "neo-glitch"}>
      <NeoTokyoMode />
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
});
