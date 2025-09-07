import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { GenerationMode } from './GenerationModes';

// Correct presets from website files
const EMOTION_MASK_PRESETS = [
  { id: 'emotion_mask_nostalgia_distance', label: 'Nostalgia + Distance', description: 'Soft memory lens' },
  { id: 'emotion_mask_joy_sadness', label: 'Joy + Sadness', description: 'Smile-through-tears' },
  { id: 'emotion_mask_conf_loneliness', label: 'Confidence + Loneliness', description: 'Bold but alone' },
  { id: 'emotion_mask_peace_fear', label: 'Peace + Fear', description: 'Calm over chaos' },
  { id: 'emotion_mask_strength_vuln', label: 'Strength + Vulnerability', description: 'Stoic but soft' },
];

const GHIBLI_PRESETS = [
  { id: 'ghibli_tears', label: 'Tears', description: 'Delicate tears' },
  { id: 'ghibli_shock', label: 'Shock', description: 'Wide-eyed surprise' },
  { id: 'ghibli_sparkle', label: 'Sparkle', description: 'Magical sparkles' },
  { id: 'ghibli_sadness', label: 'Sadness', description: 'Melancholic emotion' },
  { id: 'ghibli_love', label: 'Love', description: 'Romantic expression' },
];

const NEO_TOKYO_PRESETS = [
  { id: 'neo_tokyo_base', label: 'Base', description: 'Cyberpunk portrait' },
  { id: 'neo_tokyo_visor', label: 'Glitch Visor', description: 'Holographic visor' },
  { id: 'neo_tokyo_tattoos', label: 'Tech Tattoos', description: 'Neon tattoos' },
  { id: 'neo_tokyo_scanlines', label: 'Scanline FX', description: 'CRT effects' },
];

const STORY_TIME_PRESETS = [
  { id: 'adventure', label: 'Adventure', description: 'Epic journey' },
  { id: 'fantasy', label: 'Fantasy', description: 'Magical world' },
  { id: 'mystery', label: 'Mystery', description: 'Suspenseful tale' },
  { id: 'romance', label: 'Romance', description: 'Love story' },
  { id: 'comedy', label: 'Comedy', description: 'Humorous scene' },
];

interface SpecialModeSelectorProps {
  mode: GenerationMode;
  selectedOption: string | null;
  onOptionSelect: (optionId: string) => void;
}

export default function SpecialModeSelector({
  mode,
  selectedOption,
  onOptionSelect,
}: SpecialModeSelectorProps) {
  const getModeData = () => {
    switch (mode) {
      case 'emotion-mask':
        return {
          title: 'Choose Emotion',
          presets: EMOTION_MASK_PRESETS,
          icon: '😊',
        };
      case 'ghibli-reaction':
        return {
          title: 'Choose Expression',
          presets: GHIBLI_PRESETS,
          icon: '🎌',
        };
      case 'neo-glitch':
        return {
          title: 'Choose Style',
          presets: NEO_TOKYO_PRESETS,
          icon: '🌆',
        };
      default:
        return null;
    }
  };

  const modeData = getModeData();
  if (!modeData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {modeData.icon} {modeData.title}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {modeData.presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.optionCard,
                selectedOption === preset.id && styles.optionCardSelected,
              ]}
              onPress={() => onOptionSelect(preset.id)}
            >
              <Text style={styles.optionEmoji}>{getPresetEmoji(preset.id, mode)}</Text>
              <Text style={styles.optionLabel}>{preset.label}</Text>
              <Text style={styles.optionDescription}>{preset.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getPresetEmoji(presetId: string, mode: GenerationMode): string {
  const emojiMaps = {
    'emotion-mask': {
      emotion_mask_nostalgia_distance: '🌅',
      emotion_mask_joy_sadness: '😊',
      emotion_mask_conf_loneliness: '🌟',
      emotion_mask_peace_fear: '🕊️',
      emotion_mask_strength_vuln: '💪',
    },
    'ghibli-reaction': {
      ghibli_tears: '😢',
      ghibli_shock: '😱',
      ghibli_sparkle: '✨',
      ghibli_sadness: '😢',
      ghibli_love: '💕',
    },
    'neo-glitch': {
      neo_tokyo_base: '🤖',
      neo_tokyo_visor: '🥽',
      neo_tokyo_tattoos: '🐉',
      neo_tokyo_scanlines: '📺',
    },
  };

  return emojiMaps[mode]?.[presetId] || '🎨';
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  optionCard: {
    width: 110,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    minHeight: 100,
  },
  optionCardSelected: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 10,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 12,
  },
});
