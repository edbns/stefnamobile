import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useGenerationStore } from '../src/stores/generationStore';
import GenerationModes, { GenerationMode } from '../src/components/GenerationModes';
import { Feather } from '@expo/vector-icons';

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
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('presets');
  const [customPrompt, setCustomPrompt] = useState('');

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Compute original aspect ratio of the selected image
  useEffect(() => {
    if (selectedImage) {
      Image.getSize(
        selectedImage as string,
        (width, height) => {
          if (width && height) setImageAspect(width / height);
        },
        () => setImageAspect(null)
      );
    }
  }, [selectedImage]);

  const handleGenerate = async (presetId?: string) => {
    if (!selectedImage) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Validation based on mode
    if ((generationMode === 'custom-prompt' || generationMode === 'edit-photo') && !customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    // Start the generation process
    const result = await startGeneration({
      imageUri: selectedImage,
      mode: generationMode,
      presetId: presetId || undefined,
      customPrompt: customPrompt.trim() || undefined,
    });

    // Navigate to generation progress screen with job details
    router.push({
      pathname: '/generation-progress',
      params: {
        jobId: result.jobId,
        runId: result.runId
      }
    });
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
      {/* Floating Back Button */}
      <View style={styles.floatingBackButton}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selected Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={[styles.selectedImage, imageAspect ? { aspectRatio: imageAspect } : null]}
          />
        </View>

        {/* Generation Modes */}
        {selectedImage && (
          <View style={styles.section}>
            <GenerationModes
              selectedMode={generationMode}
              onModeChange={setGenerationMode}
              onGenerate={handleGenerate}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
              isGenerating={isGenerating}
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
  floatingBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 0.8, // 4:5 to match generation defaults
    resizeMode: 'contain',
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
