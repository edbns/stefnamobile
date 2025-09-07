import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { GenerationMode } from './GenerationModes';

// Simplified presets for mobile - in production these would come from API
const EMOTION_MASK_PRESETS = [
  { id: 'nostalgia_distance', label: 'Nostalgic', description: 'Soft memory lens' },
  { id: 'joy_sadness', label: 'Bittersweet', description: 'Smile through tears' },
  { id: 'strength_vuln', label: 'Resilient', description: 'Stoic but soft' },
  { id: 'peace_fear', label: 'Calm', description: 'Peace over chaos' },
  { id: 'confidence_loneliness', label: 'Bold', description: 'Confident but alone' },
];

const GHIBLI_PRESETS = [
  { id: 'joyful', label: 'Joyful', description: 'Happy & bright' },
  { id: 'curious', label: 'Curious', description: 'Wide-eyed wonder' },
  { id: 'determined', label: 'Determined', description: 'Focused gaze' },
  { id: 'gentle', label: 'Gentle', description: 'Soft & kind' },
  { id: 'mysterious', label: 'Mysterious', description: 'Enigmatic look' },
];

const NEO_TOKYO_PRESETS = [
  { id: 'cyberpunk', label: 'Cyberpunk', description: 'Neon & chrome' },
  { id: 'glitch', label: 'Glitch', description: 'Digital distortion' },
  { id: 'hacker', label: 'Hacker', description: 'Tech aesthetic' },
  { id: 'synthwave', label: 'Synthwave', description: 'Retro-futuristic' },
  { id: 'matrix', label: 'Matrix', description: 'Code overlay' },
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
      case 'emotionmask':
        return {
          title: 'Choose Emotion',
          presets: EMOTION_MASK_PRESETS,
          icon: '😊',
        };
      case 'ghiblireact':
        return {
          title: 'Choose Expression',
          presets: GHIBLI_PRESETS,
          icon: '🎌',
        };
      case 'neotokyoglitch':
        return {
          title: 'Choose Style',
          presets: NEO_TOKYO_PRESETS,
          icon: '🌆',
        };
      case 'storytime':
        return {
          title: 'Choose Theme',
          presets: STORY_TIME_PRESETS,
          icon: '📖',
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
    emotionmask: {
      nostalgia_distance: '🌅',
      joy_sadness: '😊',
      strength_vuln: '💪',
      peace_fear: '🕊️',
      confidence_loneliness: '🌟',
    },
    ghiblireact: {
      joyful: '😄',
      curious: '🤔',
      determined: '💪',
      gentle: '😊',
      mysterious: '😏',
    },
    neotokyoglitch: {
      cyberpunk: '🤖',
      glitch: '💻',
      hacker: '👨‍💻',
      synthwave: '🌃',
      matrix: '🟢',
    },
    storytime: {
      adventure: '🗺️',
      fantasy: '🧙‍♂️',
      mystery: '🔍',
      romance: '💕',
      comedy: '😂',
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
