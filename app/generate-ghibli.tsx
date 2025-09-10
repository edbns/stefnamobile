import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface GhibliReactionModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function GhibliReactionMode({ onGenerate }: GhibliReactionModeProps) {
  const handlePresetClick = (presetId: string) => {
    console.log('Ghibli preset clicked:', presetId);
    onGenerate(presetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghibli Reaction</Text>
      <Text style={styles.subtitle}>Animated emotions.</Text>
      
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
    </View>
  );
}

export default function GenerateGhibliScreen() {
  return (
    <BaseGenerationScreen mode="ghibli-reaction">
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
