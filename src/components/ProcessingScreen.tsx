import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { smoothNavigate } from '../utils/navigation';
import { mapErrorToUserMessage } from '../utils/errorMessages';
import { Feather } from '@expo/vector-icons';

interface ProcessingScreenProps {
  visible: boolean;
  generatedImageUrl?: string;
  error?: string;
  onViewMedia: () => void;
  onClose: () => void;
  onRetry?: () => void;
}

const PROCESSING_STEPS = [
  'Establishing secure connection…',
  'Encrypting source image…',
  'Analyzing composition and symmetry…',
  'Running identity lock sequence…',
  'Balancing light and shadow maps…',
  'Enhancing fabric and texture fidelity…',
  'Injecting cinematic contrast…',
  'Rebuilding fine details pixel by pixel…',
  'Optimizing dynamic range for realism…',
  'Applying environmental depth layers…',
  'Rendering background atmosphere…',
  'Calibrating subject focus and sharpness…',
  'Assigning symbolic elements…',
  'Performing quality assurance sweep…',
  'Locking frame in high resolution…',
  'Finalizing transformation pipeline…',
  'Preparing secure output…',
  'Almost there…'
];

export default function ProcessingScreen({ visible, generatedImageUrl, error, onViewMedia, onClose, onRetry }: ProcessingScreenProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (error) {
        setHasError(true);
        setIsComplete(false);
        setShowImage(false);
      } else if (generatedImageUrl) {
        setHasError(false);
        setIsComplete(true);
        setShowImage(true);
        // Animate image in
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        
        // Animate fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        startProcessing();
      }
    } else {
      resetProcessing();
    }
  }, [visible, error, generatedImageUrl]);

  const startProcessing = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsComplete(false);
    setShowImage(false);
    setHasError(false);
    
    // Start progress animation with easing
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 25000, // 25 seconds total
      useNativeDriver: false,
    }).start();

    // Start text animation sequence
    animateTextSequence();
  };

  const animateTextSequence = () => {
    let stepIndex = 0;
    
    const nextStep = () => {
      if (stepIndex < PROCESSING_STEPS.length) {
        // Animate text out with scale and fade
        Animated.parallel([
          Animated.timing(textAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: (stepIndex / PROCESSING_STEPS.length) * 100,
            duration: 300,
            useNativeDriver: false,
          })
        ]).start(() => {
          // Update text
          setCurrentStep(stepIndex);
          setProgress((stepIndex / PROCESSING_STEPS.length) * 100);
          
          // Animate text in with bounce effect
          Animated.sequence([
            Animated.timing(textAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            })
          ]).start();
          
          stepIndex++;
          
          // Schedule next step with varying delays for more natural feel
          const baseDelay = 800;
          const randomDelay = Math.random() * 400; // Add some randomness
          const delay = stepIndex === PROCESSING_STEPS.length - 1 ? 2000 : baseDelay + randomDelay;
          setTimeout(nextStep, delay);
        });
      } else {
        // Processing complete
        setIsComplete(true);
        setShowImage(true);
        
        // Animate image in with scale and fade
        Animated.parallel([
          Animated.timing(imageAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ]).start();
      }
    };
    
    nextStep();
  };

  const resetProcessing = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsComplete(false);
    setShowImage(false);
    setHasError(false);
    progressAnim.setValue(0);
    textAnim.setValue(0);
    imageAnim.setValue(0);
    fadeAnim.setValue(0);
  };

  const handleViewMedia = () => {
    if (generatedImageUrl) {
      // Navigate directly to media viewer with the generated image
      smoothNavigate.push('/media-viewer', { 
        mediaUri: generatedImageUrl,
        mediaId: 'generated',
        mediaType: 'image',
        cloudId: 'generated'
      });
    }
    onClose();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const getErrorMessage = () => {
    if (!error) return '';
    
    // Use the same error mapping as the website
    const { title, message } = mapErrorToUserMessage(error);
    return `${title}\n${message}`;
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Processing Area */}
        <View style={styles.processingArea}>
          {/* Error State */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>{getErrorMessage()}</Text>
            </View>
          )}

          {/* Generated Image */}
          {showImage && generatedImageUrl && !hasError && (
            <Animated.View 
              style={[
                styles.imageContainer,
                {
                  opacity: imageAnim,
                  transform: [{
                    scale: imageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                }
              ]}
            >
              <Image 
                source={{ uri: generatedImageUrl }} 
                style={styles.generatedImage}
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* Processing Text */}
          {!hasError && (
            <Animated.View 
              style={[
                styles.textContainer,
                {
                  opacity: textAnim,
                  transform: [
                    {
                      translateY: textAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      scale: textAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }
                  ],
                }
              ]}
            >
              <Text style={styles.processingText}>
                {PROCESSING_STEPS[currentStep]}
              </Text>
            </Animated.View>
          )}

          {/* Progress Bar */}
          {!hasError && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {(isComplete || hasError) && (
          <Animated.View 
            style={[
              styles.actionContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              }
            ]}
          >
            {isComplete && !hasError ? (
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={handleViewMedia}
              >
                <Feather name="eye" size={20} color="#000000" />
                <Text style={styles.viewButtonText}>View Media</Text>
              </TouchableOpacity>
            ) : hasError ? (
              <View style={styles.errorActions}>
                {onRetry && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={handleRetry}
                  >
                    <Feather name="refresh-cw" size={20} color="#000000" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.closeErrorButton}
                  onPress={onClose}
                >
                  <Feather name="x" size={20} color="#ffffff" />
                  <Text style={styles.closeErrorButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingTop: 40, // Reduced from 60
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20, // Reduced from 40
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 0, // Removed border radius
    marginBottom: 40,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30, // Reduced from 40
    minHeight: 60,
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40, // Reduced from 60
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 30, // Increased from 20 for better spacing
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  closeErrorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  closeErrorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
