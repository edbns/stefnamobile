import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useGenerationStore } from '../stores/generationStore';
import GenerationProgress from './GenerationProgress';
import { Feather } from '@expo/vector-icons';

interface BaseGenerationScreenProps {
  mode: string;
  children: (props: { onGenerate: (presetId?: string, customPrompt?: string) => void; isGenerating: boolean }) => React.ReactNode;
}

export default function BaseGenerationScreen({ mode, children }: BaseGenerationScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { isGenerating, startGeneration, currentJob, clearCurrentJob } = useGenerationStore();

  const [selectedImage] = useState(params.selectedImage as string);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Auto-scroll to content after image loads
  useEffect(() => {
    if (selectedImage && imageAspect !== null) {
      // Delay scroll to ensure content is rendered
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 600, // Scroll down to show the presets/prompt box area
          animated: true,
        });
      }, 800); // Wait 800ms for image to load and render

      return () => clearTimeout(timer);
    }
  }, [selectedImage, imageAspect]);

  const handleGenerate = async (presetId?: string, customPrompt?: string) => {
    console.log('🔍 [BaseGenerationScreen] handleGenerate called:', {
      mode,
      presetId,
      customPrompt: customPrompt?.substring(0, 100) + (customPrompt && customPrompt.length > 100 ? '...' : ''),
      customPromptLength: customPrompt?.length || 0
    });

    if (!selectedImage) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Start the generation process using the simplified service
    try {
      const result = await startGeneration({
        imageUri: selectedImage,
        mode: mode as any,
        presetId: presetId || undefined,
        customPrompt: customPrompt?.trim() || undefined,
      });

      console.log('🚀 [BaseGenerationScreen] Generation completed:', result);
    } catch (error) {
      console.error('❌ [BaseGenerationScreen] Generation failed:', error);
      Alert.alert('Generation Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleBack = () => {
    // Navigate back to upload-mode screen with the mode parameter
    router.push({
      pathname: '/upload-mode',
      params: { mode: mode }
    });
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
      {/* Header Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={[styles.selectedImage, imageAspect ? { aspectRatio: imageAspect } : null]}
          />
        </View>

        {/* Mode-specific content */}
        <View style={styles.section}>
          {children({ 
            onGenerate: handleGenerate,
            isGenerating 
          })}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generation Progress Modal */}
      <GenerationProgress
        isVisible={isGenerating || (currentJob?.status === 'completed') || (currentJob?.status === 'failed')}
        result={currentJob?.result}
        onComplete={() => {
          clearCurrentJob();
        }}
        onError={() => {
          clearCurrentJob();
        }}
        onViewResult={(result) => {
          // Navigate to media viewer
          router.push({
            pathname: '/media-viewer',
            params: { 
              imageUrl: result.imageUrl,
              title: 'Generated Image'
            }
          });
          clearCurrentJob();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerRow: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    paddingTop: 40, 
    paddingLeft: 8, 
    zIndex: 1000 
  },
  iconBackButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#000000', 
    alignItems: 'center', 
    justifyContent: 'center' 
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
  backButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
