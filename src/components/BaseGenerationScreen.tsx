import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useGenerationStore } from '../stores/generationStore';
import { Feather } from '@expo/vector-icons';
import GenerationProgressNotification from './GenerationProgressNotification';
import { GenerationMode } from '../services/generationService';
import { ErrorMessages } from '../constants/errorMessages';
import SmartScrollView from './SmartScrollView';
import { getResponsiveDimensions } from '../utils/responsiveDimensions';

interface BaseGenerationScreenProps {
  mode: string;
  children: (props: { 
    onGenerate: (presetId?: string, customPrompt?: string) => void;
    setIsTyping: (isTyping: boolean) => void;
  }) => React.ReactNode;
}

export default function BaseGenerationScreen({ mode, children }: BaseGenerationScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { startGeneration, activeGenerations } = useGenerationStore();

  const [selectedImage] = useState(params.selectedImage as string);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressNotification, setProgressNotification] = useState<{
    visible: boolean;
    status: 'starting' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    error?: string;
  }>({
    visible: false,
    status: 'starting',
    progress: 0,
  });

  // Get responsive dimensions
  const dimensions = getResponsiveDimensions();

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

  // Listen to generation completion
  useEffect(() => {
    console.log('[BaseGenerationScreen] activeGenerations changed:', activeGenerations);
    
    const completedGenerations = activeGenerations.filter(gen => 
      gen.status === 'completed' || gen.status === 'failed'
    );
    
    console.log('[BaseGenerationScreen] completedGenerations:', completedGenerations);
    
    if (completedGenerations.length > 0) {
      const latestGeneration = completedGenerations[completedGenerations.length - 1];
      
      console.log('[BaseGenerationScreen] latestGeneration:', latestGeneration);
      
      if (latestGeneration.status === 'completed') {
        setProgressNotification({
          visible: true,
          status: 'completed',
          message: 'Your media is ready!',
        });
      } else if (latestGeneration.status === 'failed') {
        setProgressNotification({
          visible: true,
          status: 'failed',
          message: latestGeneration.error || 'Generation failed',
        });
      }
    }
  }, [activeGenerations]);

  const handleGenerate = async (presetId?: string, customPrompt?: string) => {
    console.log('[BaseGenerationScreen] handleGenerate called:', {
      mode,
      presetId,
      customPrompt: customPrompt?.substring(0, 100) + (customPrompt && customPrompt.length > 100 ? '...' : ''),
      customPromptLength: customPrompt?.length || 0
    });

    if (!selectedImage) {
      setProgressNotification({
        visible: true,
        status: 'failed',
        message: 'No image selected',
      });
      return;
    }

    if (!user?.id) {
      setProgressNotification({
        visible: true,
        status: 'failed',
        message: 'User not authenticated',
      });
      return;
    }

    // Show simple queue notification
    setProgressNotification({
      visible: true,
      status: 'starting',
      message: 'We will be processing it shortly',
    });

    // Set generating state
    setIsGenerating(true);
    setIsTyping(false); // Stop typing state when generating

    // Start the generation process (non-blocking)
    try {
      // Ensure mode is valid
      const validMode = mode as GenerationMode;
      if (!validMode) {
        throw new Error('Invalid generation mode');
      }

      await startGeneration({
        imageUri: selectedImage,
        mode: validMode,
        presetId: presetId || undefined,
        customPrompt: customPrompt?.trim() || undefined,
      });

      console.log('[BaseGenerationScreen] Generation started in background');
      
      // Redirect to main page immediately
      setTimeout(() => {
        setProgressNotification(prev => ({ ...prev, visible: false }));
        router.push('/main');
      }, 2000);

    } catch (error) {
      console.error('[BaseGenerationScreen] Generation failed:', error);
      
      // Show error notification immediately
      let errorMessage = ErrorMessages.unknownError();
      if (error instanceof Error) {
        if (error.message.includes('INSUFFICIENT_CREDITS')) {
          errorMessage = ErrorMessages.insufficientCredits();
        } else if (error.message.includes('NETWORK')) {
          errorMessage = ErrorMessages.networkError();
        } else if (error.message.includes('SERVER')) {
          errorMessage = ErrorMessages.serverError();
        } else {
          errorMessage = ErrorMessages.generationFailed(error.message);
        }
      }
      
      // Dispatch custom event for NotificationManager to catch
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('generationNotification', {
          detail: {
            message: errorMessage,
            type: 'error'
          }
        });
        window.dispatchEvent(event);
      }
      
      setProgressNotification({
        visible: true,
        status: 'failed',
        message: errorMessage,
      });
    }
  };

  const handleBack = () => {
    // Navigate back to main screen (not upload-mode to avoid loops)
    router.push('/main');
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
      {/* Progress Notification */}
      <GenerationProgressNotification
        visible={progressNotification.visible}
        status={progressNotification.status}
        progress={progressNotification.progress}
        message={progressNotification.message}
        error={progressNotification.error}
        onDismiss={() => setProgressNotification(prev => ({ ...prev, visible: false }))}
        onViewGallery={() => {
          setProgressNotification(prev => ({ ...prev, visible: false }));
          router.push('/main'); // Go to main gallery to see the result
        }}
      />

      {/* Header Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <SmartScrollView 
        isTyping={isTyping}
        isGenerating={isGenerating}
        style={styles.scrollView}
      >
        {/* Selected Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={[
              styles.selectedImage, 
              { 
                height: dimensions.photoHeight,
                width: dimensions.photoWidth,
                marginHorizontal: dimensions.padding
              },
              imageAspect ? { aspectRatio: imageAspect } : null
            ]}
          />
        </View>

        {/* Mode-specific content */}
        <View style={[styles.section, { paddingHorizontal: dimensions.padding }]}>
          {children({ 
            onGenerate: handleGenerate,
            setIsTyping: setIsTyping
          })}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </SmartScrollView>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
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
