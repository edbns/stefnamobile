import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../src/constants/colors';
import { X } from 'lucide-react-native';
import UnifiedComposer from '../src/components/UnifiedComposer';
import { ImagePickerService } from '../src/services/imagePickerService';
import { GenerationService } from '../src/services/generationService';
import { useAuthStore } from '../src/stores/authStore';

export default function ComposerScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUploadPress = async () => {
    try {
      // Show options: Camera or Gallery
      Alert.alert(
        'Upload Photo',
        'Choose a photo source',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const result = await ImagePickerService.takePhoto();
              if (result && result.uri) {
                setSelectedImage(result.uri);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const result = await ImagePickerService.pickImage();
              if (result && result.uri) {
                setSelectedImage(result.uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleGenerate = async (mode: 'custom' | 'edit', prompt: string, presetId?: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to generate');
      return;
    }

    setIsGenerating(true);

    try {
      // Navigate to gallery immediately (like website)
      router.replace('/main');

      // Start generation in background
      if (mode === 'custom' && !selectedImage) {
        // Text-to-image
        await GenerationService.generateCustom(prompt);
      } else if (mode === 'edit' && selectedImage) {
        // Image-to-image with prompt
        await GenerationService.generateEdit(selectedImage, prompt);
      } else if (presetId && selectedImage) {
        // Preset-based generation (Unreal Reflection or Parallel Self)
        if (presetId.startsWith('unreal_reflection')) {
          await GenerationService.generateUnrealReflection(selectedImage, presetId);
        } else if (presetId.startsWith('parallel_self')) {
          await GenerationService.generateParallelSelf(selectedImage, presetId);
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert('Generation Failed', error.message || 'Please try again');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setIsGenerating(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <X size={24} color={COLORS.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <UnifiedComposer
          selectedImage={selectedImage}
          onClearImage={handleClearImage}
          onUploadPress={handleUploadPress}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 10,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  keyboardView: {
    flex: 1,
  },
});

