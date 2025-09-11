// Mobile Generation Progress - Simple inline progress component
// Based on website's approach but adapted for mobile

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GenerationResult } from '../services/generationService';

const { width, height } = Dimensions.get('window');

interface GenerationProgressProps {
  isVisible: boolean;
  result?: GenerationResult;
  onComplete?: () => void;
  onError?: () => void;
  onViewResult?: (result: GenerationResult) => void;
}

export default function GenerationProgress({
  isVisible,
  result,
  onComplete,
  onError,
  onViewResult
}: GenerationProgressProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(45);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || result?.status === 'completed' || result?.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, result?.status]);

  const handleViewResult = () => {
    if (result?.imageUrl) {
      router.push({
        pathname: '/media-viewer',
        params: { 
          imageUrl: result.imageUrl,
          title: 'Generated Image'
        }
      });
    }
    onComplete?.();
  };

  const handleClose = () => {
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Processing State */}
          {result?.status === 'processing' && (
            <>
              <View style={styles.iconContainer}>
                <Feather name="loader" size={32} color="#ff6b35" />
              </View>
              <Text style={styles.title}>Creating Your AI Art</Text>
              <Text style={styles.subtitle}>
                Estimated time: ~{timeRemaining} seconds
              </Text>
              <Text style={styles.instruction}>Please don't close the app</Text>
              
              {/* Simple progress indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>Processing your image...</Text>
              </View>
            </>
          )}

          {/* Completed State */}
          {result?.status === 'completed' && result.imageUrl && (
            <>
              <View style={styles.iconContainer}>
                <Feather name="check-circle" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.title}>Generation Complete!</Text>
              <Text style={styles.subtitle}>Your image is ready</Text>
              
              <View style={styles.resultImageContainer}>
                <Image 
                  source={{ uri: result.imageUrl }} 
                  style={styles.resultImage}
                />
              </View>
              
              <TouchableOpacity style={styles.viewResultButton} onPress={handleViewResult}>
                <Text style={styles.viewResultButtonText}>View Result</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Failed State */}
          {result?.status === 'failed' && (
            <>
              <View style={styles.iconContainer}>
                <Feather name="x-circle" size={32} color="#ff4444" />
              </View>
              <Text style={styles.title}>Generation Failed</Text>
              <Text style={styles.subtitle}>{result.error}</Text>
              
              <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    margin: 20,
    maxWidth: width * 0.9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 4,
    width: '100%',
    // Add animation here if needed
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  resultImageContainer: {
    marginVertical: 20,
    width: width * 0.6,
    height: width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'contain',
  },
  viewResultButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  viewResultButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
