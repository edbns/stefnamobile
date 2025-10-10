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
import GeneratingOverlay from '../src/components/GeneratingOverlay';
import { ImagePickerService } from '../src/services/imagePickerService';
import GenerationService from '../src/services/generationService';
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
              console.log('📸 Opening camera...');
              try {
                const result = await ImagePickerService.captureFromCamera({
                  quality: 0.8,
                  allowsEditing: false,
                });
                console.log('📸 Camera result:', result);
                
                if (result.success && result.uri) {
                  console.log('✅ Setting image from camera:', result.uri.substring(0, 50));
                  setSelectedImage(result.uri);
                } else if (result.error) {
                  console.error('❌ Camera error:', result.error);
                  Alert.alert('Camera Error', result.error);
                }
              } catch (error) {
                console.error('❌ Camera exception:', error);
                Alert.alert('Camera Error', 'Failed to capture photo');
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              console.log('📸 Opening gallery...');
              const result = await ImagePickerService.pickFromGallery();
              console.log('📸 Gallery result:', result);
              if (result.success && result.uri) {
                setSelectedImage(result.uri);
              } else if (result.error) {
                Alert.alert('Gallery Error', result.error);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to open picker');
    }
  };

  const handleGenerate = async (mode: 'custom' | 'edit', prompt: string, presetId?: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to generate');
      return;
    }

    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Build generation request
      let generationMode: 'custom-prompt' | 'edit-photo' | 'unreal-reflection' | 'parallel-self';
      
      if (presetId) {
        // Preset-based generation
        if (presetId.startsWith('unreal_reflection')) {
          generationMode = 'unreal-reflection';
        } else if (presetId.startsWith('parallel_self')) {
          generationMode = 'parallel-self';
        } else {
          generationMode = 'edit-photo';
        }
      } else if (selectedImage) {
        // Edit mode with custom prompt
        generationMode = 'edit-photo';
      } else {
        // Custom text-to-image
        generationMode = 'custom-prompt';
      }

      console.log('🚀 [Composer] Starting generation:', {
        mode: generationMode,
        hasImage: !!selectedImage,
        hasPreset: !!presetId,
        promptLength: prompt.length
      });

      // Start generation (progress overlay will show)
      // For custom mode without image, we still need a dummy image for the API
      // The backend will ignore it for text-to-image
      const result = await GenerationService.generate({
        imageUri: selectedImage || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent PNG for custom mode
        mode: generationMode,
        presetId: presetId,
        customPrompt: prompt,
      });

      console.log('✅ [Composer] Generation result:', result);

      if (result.success) {
        // Navigate to gallery after successful generation
        router.replace('/main');
      } else {
        Alert.alert('Generation Failed', result.error || 'Please try again');
      }
    } catch (error: any) {
      console.error('❌ [Composer] Generation error:', error);
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
        disabled={isGenerating}
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

      {/* Progress Overlay */}
      <GeneratingOverlay visible={isGenerating} />
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

