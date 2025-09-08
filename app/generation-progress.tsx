// app/generation-progress.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import GenerationPollingService, { GenerationPollingStatus } from '../src/services/generationPollingService';

const { width, height } = Dimensions.get('window');

// Use the same interface as the polling service
type GenerationStatus = GenerationPollingStatus;

export default function GenerationProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'processing',
    progress: 0,
    message: 'Getting it ready',
    estimatedTime: 45
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(45);
  const pollingService = GenerationPollingService.getInstance();

  // Real-time API polling (like website)
  useEffect(() => {
    const jobId = params.jobId as string;
    const runId = params.runId as string;

    if (!jobId || !runId) {
      console.error('Missing jobId or runId for polling');
      setGenerationStatus(prev => ({
        ...prev,
        status: 'failed',
        error: 'Missing generation parameters'
      }));
      return;
    }

    console.log(`🚀 [GenerationProgress] Starting polling for job ${jobId}, run ${runId}`);

    // Start real-time polling
    pollingService.startPolling(jobId, runId, {
      onProgress: (status) => {
        console.log('📊 [GenerationProgress] Progress update:', status);
        setGenerationStatus(status);
        setTimeRemaining(status.estimatedTime || 0);
      },
      onComplete: (result) => {
        console.log('✅ [GenerationProgress] Generation completed:', result);
        setGenerationStatus(result);
        setTimeRemaining(0);
      },
      onError: (error) => {
        console.error('❌ [GenerationProgress] Generation failed:', error);
        setGenerationStatus(prev => ({
          ...prev,
          status: 'failed',
          error: error.message
        }));
      },
      maxAttempts: 30, // 1 minute of polling
      pollInterval: 2000 // Poll every 2 seconds
    });

    // Cleanup on unmount
    return () => {
      pollingService.stopPolling(jobId);
    };
  }, [params.jobId, params.runId]);

  const handleClose = () => {
    router.back();
  };

  const handleViewResult = () => {
    // Navigate to results screen
    router.push('/main');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Processing State */}
        {generationStatus.status === 'processing' && (
          <>
            <Text style={styles.title}>Editing image</Text>
            <Text style={styles.subtitle}>
              Estimated time: ~{timeRemaining} seconds
            </Text>
            <Text style={styles.instruction}>Please don't close the app</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${generationStatus.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{generationStatus.message}</Text>
            </View>
          </>
        )}

        {/* Completed State */}
        {generationStatus.status === 'completed' && (
          <>
            <Text style={styles.title}>Edit Complete!</Text>
            <Text style={styles.subtitle}>Your image is ready</Text>
            
            {generationStatus.imageUrl && (
              <View style={styles.resultImageContainer}>
                <Image 
                  source={{ uri: generationStatus.imageUrl }} 
                  style={styles.resultImage}
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.viewResultButton} onPress={handleViewResult}>
              <Text style={styles.viewResultButtonText}>View Result</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Failed State */}
        {generationStatus.status === 'failed' && (
          <>
            <Text style={styles.title}>Edit Failed</Text>
            <Text style={styles.subtitle}>{generationStatus.error}</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
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
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  resultImageContainer: {
    marginVertical: 30,
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  viewResultButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
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
    marginTop: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
