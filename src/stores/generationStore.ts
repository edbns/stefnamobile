// Mobile Generation Store - Simplified version based on website's approach
// Minimal state management, no complex interactions

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenerationService, { GenerationRequest, GenerationResult } from '../services/generationService';
import { useCreditsStore } from './creditsStore';
import { useAuthStore } from './authStore';

interface GenerationState {
  // Background processing state
  activeGenerations: {
    id: string;
    mode: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: GenerationResult;
    error?: string;
    startedAt: number;
  }[];
  
  // Simple actions
  startGeneration: (request: GenerationRequest) => Promise<void>;
  clearCompletedJobs: () => void;
  
  // Legacy compatibility (for existing screens)
  presets: any[];
  loadPresets: () => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  activeGenerations: [],
  presets: [],

  startGeneration: async (request: GenerationRequest) => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to active generations
    const newGeneration = {
      id: jobId,
      mode: request.mode,
      status: 'pending' as const,
      startedAt: Date.now()
    };
    
    set(state => ({
      activeGenerations: [...state.activeGenerations, newGeneration]
    }));

    // Start background processing
    processGenerationInBackground(jobId, request);
  },

  clearCompletedJobs: () => {
    set(state => ({
      activeGenerations: state.activeGenerations.filter(job => 
        job.status === 'pending' || job.status === 'processing'
      )
    }));
  },

  loadPresets: async () => {
    // Legacy method - presets are now loaded by GenerationModes component
    console.log('📚 [GenerationStore] loadPresets called (legacy method)');
    // No-op for compatibility
  }
}));

// Background processing function
async function processGenerationInBackground(jobId: string, request: GenerationRequest) {
  try {
    // Update status to processing
    useGenerationStore.setState(state => ({
      activeGenerations: state.activeGenerations.map(job =>
        job.id === jobId ? { ...job, status: 'processing' as const } : job
      )
    }));

    // Get user from auth store
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Reserve credits using creditsStore
    const creditCost = 2; // Standard cost for image generation
    const creditsReserved = await useCreditsStore.getState().reserveCredits(creditCost, 'image.gen');

    if (!creditsReserved) {
      const { error } = useCreditsStore.getState();
      throw new Error(error || 'Insufficient credits');
    }

    console.log(`💰 Reserved ${creditCost} credits for generation`);

    // Call the generation service
    const result = await GenerationService.generate(request);

    if (result.success) {
      // Update job with success
      useGenerationStore.setState(state => ({
        activeGenerations: state.activeGenerations.map(job =>
          job.id === jobId ? { 
            ...job, 
            status: 'completed' as const,
            result: result
          } : job
        )
      }));

      // Finalize credits on success
      await useCreditsStore.getState().finalizeCredits('commit');
      console.log('💰 Credits consumed for successful generation');

      // Show completion notification
      showCompletionNotification(jobId, request.mode, true);
    } else {
      // Refund credits on generation failure
      await useCreditsStore.getState().finalizeCredits('refund');
      console.log('💰 Refunded credits due to generation failure');

      // Update job with failure
      useGenerationStore.setState(state => ({
        activeGenerations: state.activeGenerations.map(job =>
          job.id === jobId ? { 
            ...job, 
            status: 'failed' as const,
            error: result.error
          } : job
        )
      }));

      // Show failure notification
      showCompletionNotification(jobId, request.mode, false, result.error);
    }
  } catch (error) {
    console.error('Generation error:', error);

    // Refund credits on any error
    try {
      await useCreditsStore.getState().finalizeCredits('refund');
      console.log('💰 Refunded credits due to generation error');
    } catch (refundError) {
      console.error('Failed to refund credits:', refundError);
    }

    // Update job with error
    useGenerationStore.setState(state => ({
      activeGenerations: state.activeGenerations.map(job =>
        job.id === jobId ? { 
          ...job, 
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : job
      )
    }));

    // Show error notification
    showCompletionNotification(jobId, request.mode, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Simple notification function
function showCompletionNotification(jobId: string, mode: string, success: boolean, error?: string) {
  const message = success 
    ? `${mode} generation completed!` 
    : `Generation failed: ${error || 'Unknown error'}`;
  
  console.log(`📱 Notification: ${message}`);
  
  // Dispatch custom event for notification
  const event = new CustomEvent('generationNotification', {
    detail: {
      message,
      type: success ? 'success' : 'error',
      jobId,
      mode
    }
  });
  
  // Dispatch to window (for React Native, this will be handled by the app)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}
