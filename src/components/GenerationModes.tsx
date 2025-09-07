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

export type GenerationMode = 'presets' | 'custom' | 'edit';

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
    if (mode === 'custom' || mode === 'edit') {
      setShowPromptInput(true);
    } else {
      setShowPromptInput(false);
    }
    onModeChange(mode);
  };

  const handleGenerate = () => {
    if ((selectedMode === 'custom' || selectedMode === 'edit') && !customPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a prompt for this generation mode.');
      return;
    }
    onGenerate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Generation Mode</Text>

      <View style={styles.modesContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'presets' && styles.modeButtonSelected,
          ]}
          onPress={() => handleModePress('presets')}
        >
          <Text style={styles.modeIcon}>🎨</Text>
          <Text style={styles.modeTitle}>Presets</Text>
          <Text style={styles.modeDescription}>Auto-generate with curated styles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'custom' && styles.modeButtonSelected,
          ]}
          onPress={() => handleModePress('custom')}
        >
          <Text style={styles.modeIcon}>✨</Text>
          <Text style={styles.modeTitle}>Custom</Text>
          <Text style={styles.modeDescription}>Create with your own prompt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'edit' && styles.modeButtonSelected,
          ]}
          onPress={() => handleModePress('edit')}
        >
          <Text style={styles.modeIcon}>🎭</Text>
          <Text style={styles.modeTitle}>Edit</Text>
          <Text style={styles.modeDescription}>Transform existing image</Text>
        </TouchableOpacity>
      </View>

      {(selectedMode === 'custom' || selectedMode === 'edit') && showPromptInput && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptLabel}>
            {selectedMode === 'custom' ? 'Describe your vision:' : 'How to transform this image:'}
          </Text>
          <TextInput
            style={styles.promptInput}
            value={customPrompt}
            onChangeText={onCustomPromptChange}
            placeholder={
              selectedMode === 'custom'
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    minHeight: 120,
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
