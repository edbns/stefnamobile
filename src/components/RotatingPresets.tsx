import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Preset } from '../services/generationService';

interface RotatingPresetsProps {
  selectedPreset: string | null;
  onPresetSelect: (presetId: string) => void;
  presets?: Preset[];
}

export default function RotatingPresets({
  selectedPreset,
  onPresetSelect,
  presets = []
}: RotatingPresetsProps) {
  // Get current week's presets (5 at a time)
  const getCurrentWeekPresets = () => {
    if (!presets || presets.length === 0) {
      // Return empty array if no presets loaded yet
      return [];
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStartOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(daysSinceStartOfYear / 7) % 4;

    const startIndex = currentWeek * 6;
    return presets.slice(startIndex, Math.min(startIndex + 6, presets.length));
  };

  const currentPresets = getCurrentWeekPresets();

  if (!currentPresets || currentPresets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading presets...</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsContainer}
      >
        {currentPresets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              selectedPreset === preset.id && styles.presetCardSelected,
            ]}
            onPress={() => onPresetSelect(preset.id)}
          >
            <View style={styles.presetIcon}>
              <Text style={styles.presetEmoji}>
                {getPresetEmoji(preset.category)}
              </Text>
            </View>
            <Text style={styles.presetLabel} numberOfLines={2}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.infoText}>
        New styles every week • {currentPresets.length} available now
      </Text>
    </View>
  );
}

function getPresetEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    cinematic: '🎬',
    bright: '☀️',
    vivid: '🌈',
    vintage: '📽️',
    tropical: '🌴',
    urban: '🏙️',
    monochrome: '⚫',
    dreamy: '☁️',
    golden: '🌅',
    fashion: '👗',
    moody: '🌲',
    desert: '🏜️',
    retro: '📷',
    clear: '💎',
    ocean: '🌊',
    festival: '🎉',
    noir: '🕵️',
    sunset: '🌇',
    frost: '❄️',
    neon: '💡',
    cultural: '🌍',
    soft: '💄',
    rainy: '🌧️',
    wildlife: '🦌',
    street: '🏃',
  };

  return emojiMap[category] || '🎨';
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  presetsContainer: {
    paddingHorizontal: 10,
  },
  presetCard: {
    width: 100,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    minHeight: 100,
  },
  presetCardSelected: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  presetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetEmoji: {
    fontSize: 20,
  },
  presetLabel: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 32,
  },
});
