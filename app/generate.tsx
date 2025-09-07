import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useGenerationStore } from '../src/stores/generationStore';
import GenerationModes, { GenerationMode } from '../src/components/GenerationModes';
import RotatingPresets from '../src/components/RotatingPresets';
import SpecialModeSelector from '../src/components/SpecialModeSelector';
import { ArrowLeft, X } from 'lucide-react-native';

export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const {
    isGenerating,
    presets,
    loadPresets,
    startGeneration,
  } = useGenerationStore();

  const [selectedImage] = useState(params.selectedImage as string);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedSpecialMode, setSelectedSpecialMode] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleGenerate = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Validation based on mode
    if (generationMode === 'presets' && !selectedPreset) {
      Alert.alert('Error', 'Please select a preset style');
      return;
    }

    if ((generationMode === 'custom-prompt' || generationMode === 'edit-photo') && !customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    // Special modes validation
    const specialModes = ['emotion-mask', 'ghibli-reaction', 'neo-glitch'];
    if (specialModes.includes(generationMode) && !selectedSpecialMode) {
      Alert.alert('Error', `Please select an option for ${generationMode}`);
      return;
    }

    // Start the generation process
    await startGeneration({
      imageUri: selectedImage,
      mode: generationMode,
      presetId: selectedPreset || undefined,
      customPrompt: customPrompt.trim() || undefined,
      specialModeId: selectedSpecialMode || undefined,
    });

    // Navigate back to main screen
    router.replace('/main');
  };

  const handleBack = () => {
    router.back();
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close Button - Top Right */}
      <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
        <X size={24} color="#ffffff" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selected Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        </View>

        {/* Generation Modes */}
        <View style={styles.section}>
          <GenerationModes
            selectedMode={generationMode}
            onModeChange={setGenerationMode}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </View>

        {/* Rotating Presets */}
        {selectedImage && generationMode === 'presets' && (
          <View style={styles.section}>
            <RotatingPresets
              selectedPreset={selectedPreset}
              onPresetSelect={setSelectedPreset}
              presets={presets}
            />
          </View>
        )}

        {/* Special Mode Selector */}
        {selectedImage && ['emotion-mask', 'ghibli-reaction', 'neo-glitch'].includes(generationMode) && (
          <View style={styles.section}>
            <SpecialModeSelector
              mode={generationMode}
              selectedOption={selectedSpecialMode}
              onOptionSelect={setSelectedSpecialMode}
            />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  section: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
