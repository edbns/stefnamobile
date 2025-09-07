import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

export type GenerationMode = 'presets' | 'custom-prompt' | 'edit-photo' | 'emotion-mask' | 'ghibli-reaction' | 'neo-glitch';

interface GenerationModesProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export default function GenerationModes({
  selectedMode,
  onModeChange,
  customPrompt,
  onCustomPromptChange,
  onGenerate,
  isGenerating = false,
}: GenerationModesProps) {
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleModePress = (mode: GenerationMode) => {
    if (mode === 'custom-prompt' || mode === 'edit-photo') {
      setShowPromptInput(true);
    } else {
      setShowPromptInput(false);
    }
    onModeChange(mode);
  };

  const getModeIcon = (mode: GenerationMode): string => {
    const icons = {
      presets: '🎨',
      'custom-prompt': '✨',
      'edit-photo': '🎭',
      'emotion-mask': '😊',
      'ghibli-reaction': '🎌',
      'neo-glitch': '🌆',
    };
    return icons[mode] || '🎨';
  };

  const getModeTitle = (mode: GenerationMode): string => {
    const titles = {
      presets: 'Presets',
      'custom-prompt': 'Custom',
      'edit-photo': 'Edit',
      'emotion-mask': 'Emotion Mask',
      'ghibli-reaction': 'Ghibli React',
      'neo-glitch': 'Neo Tokyo',
    };
    return titles[mode] || mode;
  };

  const getModeDescription = (mode: GenerationMode): string => {
    const descriptions = {
      presets: 'Curated styles',
      'custom-prompt': 'Your own prompt',
      'edit-photo': 'Transform image',
      'emotion-mask': 'Add emotions',
      'ghibli-reaction': 'Anime style',
      'neo-glitch': 'Cyberpunk effects',
    };
    return descriptions[mode] || 'Generate image';
  };

  const handleGenerate = () => {
    if ((selectedMode === 'custom-prompt' || selectedMode === 'edit-photo') && !customPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a prompt for this generation mode.');
      return;
    }
    onGenerate();
  };

  return (
    <View style={styles.container}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.modesContainer}>
          {(['presets', 'custom-prompt', 'edit-photo', 'emotion-mask', 'ghibli-reaction', 'neo-glitch'] as GenerationMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                selectedMode === mode && styles.modeButtonSelected,
              ]}
              onPress={() => handleModePress(mode)}
            >
              <Text style={styles.modeIcon}>{getModeIcon(mode)}</Text>
              <Text style={styles.modeTitle}>{getModeTitle(mode)}</Text>
              <Text style={styles.modeDescription}>{getModeDescription(mode)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {(selectedMode === 'custom-prompt' || selectedMode === 'edit-photo') && showPromptInput && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptLabel}>
            {selectedMode === 'custom-prompt' ? 'Describe your vision:' : 'How to transform this image:'}
          </Text>
          <TextInput
            style={styles.promptInput}
            value={customPrompt}
            onChangeText={onCustomPromptChange}
            placeholder={
              selectedMode === 'custom-prompt'
                ? "e.g., 'portrait with dramatic lighting, cinematic style'"
                : "e.g., 'make it look like a movie poster, add dramatic effects'"
            }
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        <Text style={styles.generateButtonText}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  modesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modeButton: {
    width: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    minHeight: 100,
  },
  modeButtonSelected: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 16,
  },
  promptContainer: {
    marginBottom: 20,
  },
  promptLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  promptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
