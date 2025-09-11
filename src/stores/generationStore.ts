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
    console.log('🚀 [GenerationStore] startGeneration called with:', {
      mode: request.mode,
      hasImage: !!request.imageUri,
      hasPreset: !!request.presetId,
      hasCustomPrompt: !!request.customPrompt
    });
    
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

    console.log('📝 [GenerationStore] Added job to active generations:', jobId);

    // Start background processing
    processGenerationInBackground(jobId, request);
    
    console.log('🔄 [GenerationStore] Background processing started for job:', jobId);
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
  console.log('🔄 [Background] Starting background processing for job:', jobId);
  console.log('🔄 [Background] Request details:', {
    mode: request.mode,
    hasImage: !!request.imageUri,
    hasPreset: !!request.presetId,
    hasCustomPrompt: !!request.customPrompt
  });
  
  try {
    // Update status to processing
    console.log('📝 [Background] Updating job status to processing...');
    useGenerationStore.setState(state => ({
      activeGenerations: state.activeGenerations.map(job =>
        job.id === jobId ? { ...job, status: 'processing' as const } : job
      )
    }));

    // Get user from auth store
    console.log('👤 [Background] Getting user from auth store...');
    const { user } = useAuthStore.getState();
    if (!user) {
      console.error('❌ [Background] No user found in auth store');
      throw new Error('Not authenticated');
    }
    console.log('✅ [Background] User found:', user.id);

    // Reserve credits using creditsStore
    const creditCost = 2; // Standard cost for image generation
    console.log('💰 [Background] Attempting to reserve credits...');
    
    const creditsReserved = await useCreditsStore.getState().reserveCredits(creditCost, 'image.gen');

    if (!creditsReserved) {
      const { error } = useCreditsStore.getState();
      console.error('❌ [GenerationStore] Credit reservation failed:', error);
      
      // Update job with credit failure
      useGenerationStore.setState(state => ({
        activeGenerations: state.activeGenerations.map(job =>
          job.id === jobId ? { 
            ...job, 
            status: 'failed' as const,
            error: error || 'Insufficient credits'
          } : job
        )
      }));
      
      // Show error notification
      showCompletionNotification(jobId, request.mode, false, error || 'Insufficient credits');
      return; // Exit early
    }

    console.log(`💰 Reserved ${creditCost} credits for generation`);

    // Call the generation service
    console.log('🚀 [Background] Calling GenerationService.generate...');
    console.log('🚀 [Background] Request being sent:', {
      mode: request.mode,
      imageUri: request.imageUri ? 'present' : 'missing',
      presetId: request.presetId,
      customPrompt: request.customPrompt ? 'present' : 'missing'
    });
    
    const result = await GenerationService.generate(request);
    
    console.log('📊 [Background] GenerationService result:', {
      success: result.success,
      hasError: !!result.error,
      error: result.error
    });

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
