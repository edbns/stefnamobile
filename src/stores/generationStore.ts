import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenerationService, GenerationStatus, GenerationResponse, Preset } from '../services/generationService';
import { StorageService, StoredMedia } from '../services/storageService';
import { useCreditsStore } from './creditsStore';
import { useUserStore } from './userStore';
import { useMediaStore } from './mediaStore';
import { useAuthStore } from './authStore';
import { useErrorStore, errorHelpers } from './errorStore';
import { useNotificationsStore, notificationHelpers } from './notificationsStore';
import type { GenerationJob } from '../types/generation';

interface GenerationState {
  currentJob: GenerationJob | null;
  isGenerating: boolean;
  jobQueue: GenerationJob[];
  presets: Preset[];
  startGeneration: (jobData: {
    imageUri: string;
    mode: 'presets' | 'custom-prompt' | 'edit-photo' | 'emotion-mask' | 'ghibli-reaction' | 'neo-glitch';
    presetId?: string;
    customPrompt?: string;
  }) => Promise<GenerationResponse>;
  loadPresets: () => Promise<void>;
  loadJobHistory: () => Promise<void>;
  saveJobHistory: () => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  currentJob: null,
  isGenerating: false,
  jobQueue: [],
  presets: [],

  startGeneration: async (jobData) => {
    const job: GenerationJob = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
    };

    set({ currentJob: job, isGenerating: true });

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

      // Call the generation API (userId will be extracted from JWT by backend)
      const response = await GenerationService.startGeneration({
        imageUri: job.imageUri,
        mode: job.mode,
        presetId: job.presetId,
        customPrompt: job.customPrompt,
        // userId removed - backend extracts from JWT token
      });

      if (response.success && response.jobId) {
        // Update job with API job ID
        const updatedJob = { ...job, id: response.jobId };
        set({ currentJob: updatedJob });

        // Show generation started notification
        useNotificationsStore.getState().addNotification(
          notificationHelpers.info(
            'Generation Started',
            'Your image is being created. This may take a few moments.'
          )
        );

        // Return the response for navigation (polling handled by generation-progress screen)
        return response;
      } else {
        // Refund credits on generation failure
        await useCreditsStore.getState().finalizeCredits('refund');
        console.log('💰 Refunded credits due to generation failure');

        // Use centralized error handling
        useErrorStore.getState().setError(
          errorHelpers.generation(
            response.error || 'Generation failed to start',
            { jobData },
            async () => { await get().startGeneration(jobData); } // Retry action
          )
        );

        // Handle error
        const failedJob = {
          ...job,
          status: 'failed' as const,
          error: response.error,
        };
        set({
          currentJob: failedJob,
          isGenerating: false,
          jobQueue: [...get().jobQueue, failedJob]
        });
        
        // Return error response
        return {
          success: false,
          error: response.error || 'Generation failed'
        };
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

      // Use centralized error handling
      useErrorStore.getState().setError(
        errorHelpers.generation(
          error instanceof Error ? error.message : 'Unknown error',
          { jobData },
          async () => { await get().startGeneration(jobData); } // Retry action
        )
      );

      // Handle error
      const failedJob = {
        ...job,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      set({
        currentJob: failedJob,
        isGenerating: false,
        jobQueue: [...get().jobQueue, failedJob]
      });
      
      // Return error response
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  loadPresets: async () => {
    try {
      const presets = await GenerationService.getPresets();
      set({ presets });
    } catch (error) {
      console.error('Load presets error:', error);
      // Presets will remain empty, component will handle fallback
    }
  },

  loadJobHistory: async () => {
    try {
      const historyString = await AsyncStorage.getItem('generation_history');
      if (historyString) {
        const history: GenerationJob[] = JSON.parse(historyString);
        // Convert date strings back to Date objects
        const parsedHistory = history.map(job => ({
          ...job,
          createdAt: new Date(job.createdAt),
        }));
        set({ jobQueue: parsedHistory });
      }
    } catch (error) {
      console.error('Load job history error:', error);
    }
  },

  saveJobHistory: async () => {
    try {
      const { jobQueue } = get();
      await AsyncStorage.setItem('generation_history', JSON.stringify(jobQueue));
    } catch (error) {
      console.error('Save job history error:', error);
    }
  },
}));