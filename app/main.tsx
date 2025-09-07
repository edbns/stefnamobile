import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useGenerationStore } from '../src/stores/generationStore';
import CameraPicker from '../src/components/CameraPicker';
import GenerationModes, { GenerationMode } from '../src/components/GenerationModes';
import RotatingPresets from '../src/components/RotatingPresets';

export default function MainScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    isGenerating,
    presets,
    loadPresets,
    startGeneration,
    currentJob,
    jobQueue,
  } = useGenerationStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Handle generation completion
  useEffect(() => {
    if (currentJob && currentJob.status === 'completed' && currentJob.resultUrl) {
      Alert.alert(
        'Generation Complete!',
        'Your image has been generated successfully.',
        [
          {
            text: 'View Result',
            onPress: () => {
              // TODO: Navigate to result screen or show in gallery
            },
          },
          { text: 'OK' },
        ]
      );
    } else if (currentJob && currentJob.status === 'failed') {
      Alert.alert(
        'Generation Failed',
        currentJob.error || 'An error occurred during generation.',
        [{ text: 'OK' }]
      );
    }
  }, [currentJob]);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (generationMode === 'presets' && !selectedPreset) {
      Alert.alert('Error', 'Please select a preset style');
      return;
    }

    if ((generationMode === 'custom' || generationMode === 'edit') && !customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    // Start the generation process
    await startGeneration({
      imageUri: selectedImage,
      mode: generationMode,
      presetId: selectedPreset || undefined,
      customPrompt: customPrompt.trim() || undefined,
    });

    // Clear the form after starting generation
    setCustomPrompt('');
    setSelectedPreset(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </Text>
        <Text style={styles.creditsText}>
          Credits: {user?.credits || 0}
        </Text>
      </View>

      {/* Camera Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Image</Text>
        <CameraPicker
          onImageSelected={handleImageSelected}
          selectedImage={selectedImage}
          onClearImage={handleClearImage}
        />
      </View>

      {/* Generation Modes */}
      {selectedImage && (
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
      )}

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

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.actionButtonText}>View Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  welcomeText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  creditsText: {
    fontSize: 14,
    color: '#cccccc',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },
});
