import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface EmotionMaskModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function EmotionMaskMode({ onGenerate }: EmotionMaskModeProps) {
  const handlePresetClick = (presetId: string) => {
    console.log('Emotion preset clicked:', presetId);
    onGenerate(presetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotion Mask</Text>
      <Text style={styles.subtitle}>Faces that feel.</Text>
      
      <View style={styles.presetContainer}>
        <View style={styles.presetGrid}>
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('emotion_mask_nostalgia_distance')}>
              <Text style={styles.presetText}>Nostalgia + Distance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('emotion_mask_joy_sadness')}>
              <Text style={styles.presetText}>Joy + Sadness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('emotion_mask_conf_loneliness')}>
              <Text style={styles.presetText}>Confidence + Loneliness</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('emotion_mask_peace_fear')}>
              <Text style={styles.presetText}>Peace + Fear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton} onPress={() => handlePresetClick('emotion_mask_strength_vuln')}>
              <Text style={styles.presetText}>Strength + Vulnerability</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function GenerateEmotionScreen() {
  return (
    <BaseGenerationScreen mode="emotion-mask">
      <EmotionMaskMode />
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
