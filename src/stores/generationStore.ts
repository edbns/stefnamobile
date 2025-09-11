// Mobile Generation Store - Simplified version based on website's approach
// Minimal state management, no complex interactions

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenerationService, { GenerationRequest, GenerationResult } from '../services/generationService';
import { useCreditsStore } from './creditsStore';
import { useAuthStore } from './authStore';

interface GenerationState {
  // Simple state like website
  isGenerating: boolean;
  currentJob: {
    id: string;
    mode: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: GenerationResult;
    error?: string;
  } | null;
  
  // Simple actions
  startGeneration: (request: GenerationRequest) => Promise<GenerationResult>;
  clearCurrentJob: () => void;
  
  // Legacy compatibility (for existing screens)
  presets: any[];
  loadPresets: () => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  isGenerating: false,
  currentJob: null,
  presets: [],

  startGeneration: async (request: GenerationRequest) => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set generating state
    set({ 
      isGenerating: true,
      currentJob: {
        id: jobId,
        mode: request.mode,
        status: 'pending'
      }
    });

    try {
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
        set({ 
          currentJob: {
            id: jobId,
            mode: request.mode,
            status: 'completed',
            result: result
          }
        });

        // Finalize credits on success
        await useCreditsStore.getState().finalizeCredits('consume');
        console.log('💰 Credits consumed for successful generation');

        return result;
      } else {
        // Refund credits on generation failure
        await useCreditsStore.getState().finalizeCredits('refund');
        console.log('💰 Refunded credits due to generation failure');

        // Update job with failure
        set({ 
          currentJob: {
            id: jobId,
            mode: request.mode,
            status: 'failed',
            error: result.error
          }
        });

        return result;
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
      set({ 
        currentJob: {
          id: jobId,
          mode: request.mode,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      // Return error result
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        type: request.mode
      };
    } finally {
      // Always clear generating state
      set({ isGenerating: false });
    }
  },

  clearCurrentJob: () => {
    set({ currentJob: null });
  },

  loadPresets: async () => {
    // Legacy method - presets are now loaded by GenerationModes component
    console.log('📚 [GenerationStore] loadPresets called (legacy method)');
    // No-op for compatibility
  }
}));
