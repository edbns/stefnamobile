import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenerationService, GenerationStatus, Preset } from '../services/generationService';
import { StorageService, StoredMedia } from '../services/storageService';
import { useCreditsStore } from './creditsStore';
import { useUserStore } from './userStore';
import { useMediaStore } from './mediaStore';
import { useAuthStore } from './authStore';
import { useErrorStore, errorHelpers } from './errorStore';
import { useNotificationsStore, notificationHelpers } from './notificationsStore';

interface GenerationJob {
  id: string;
  imageUri: string;
  mode: 'presets' | 'custom-prompt' | 'edit-photo' | 'emotion-mask' | 'ghibli-reaction' | 'neo-glitch';
  presetId?: string;
  customPrompt?: string;
  specialModeId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  estimatedTime?: number;
  storedMedia?: StoredMedia;
}

interface GenerationState {
  // Current generation
  currentJob: GenerationJob | null;
  isGenerating: boolean;

  // Queue management
  jobQueue: GenerationJob[];

  // Data
  presets: Preset[];

  // Actions
  startGeneration: (job: Omit<GenerationJob, 'id' | 'status' | 'createdAt' | 'storedMedia'>) => Promise<void>;
  cancelGeneration: () => void;
  clearCompletedJobs: () => void;
  loadPresets: () => Promise<void>;
  pollJobStatus: (jobId: string) => Promise<void>;
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

      // Call the generation API
      const response = await GenerationService.startGeneration({
        imageUri: job.imageUri,
        mode: job.mode,
        presetId: job.presetId,
        customPrompt: job.customPrompt,
        specialModeId: job.specialModeId,
        userId: user.id,
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

        // Start polling for status
        get().pollJobStatus(response.jobId);
      } else {
        // Refund credits on generation failure
        await useCreditsStore.getState().finalizeCredits('refund');
        console.log('💰 Refunded credits due to generation failure');

        // Use centralized error handling
        useErrorStore.getState().setError(
          errorHelpers.generation(
            response.error || 'Generation failed to start',
            { jobData },
            () => get().startGeneration(jobData) // Retry action
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
      }
    } catch (error) {
      console.error('Generation error:', error);

      // Refund credits on any error
      try {
        await useCreditsStore.getState().finalizeCredits('refund');
        console.log('💰 Refunded credits due to error');
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError);
      }

      // Use centralized error handling
      useErrorStore.getState().setError(
        errorHelpers.generation(
          error instanceof Error ? error.message : 'Generation failed',
          { jobData },
          () => get().startGeneration(jobData) // Retry action
        )
      );

      const failedJob = {
        ...job,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Network error',
      };
      set({
        currentJob: failedJob,
        isGenerating: false,
        jobQueue: [...get().jobQueue, failedJob]
      });
    }
  },

  cancelGeneration: () => {
    const { currentJob } = get();
    if (currentJob) {
      const cancelledJob = {
        ...currentJob,
        status: 'failed' as const,
        error: 'Cancelled by user',
      };
      set({
        currentJob: null,
        isGenerating: false,
        jobQueue: [...get().jobQueue, cancelledJob]
      });
    }
  },

  clearCompletedJobs: () => {
    const { jobQueue } = get();
    const activeJobs = jobQueue.filter(job => job.status !== 'completed');
    set({ jobQueue: activeJobs });
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

  pollJobStatus: async (jobId: string) => {
    const poll = async () => {
      try {
        const status = await GenerationService.getGenerationStatus(jobId);
        const { currentJob } = get();

        if (currentJob && currentJob.id === jobId) {
            if (status.status === 'completed' || status.status === 'failed') {
              // Finalize credits using creditsStore
              try {
                const disposition = status.status === 'completed' ? 'commit' : 'refund';
                await useCreditsStore.getState().finalizeCredits(disposition);
                console.log(`💰 ${disposition === 'commit' ? 'Committed' : 'Refunded'} credits for generation ${status.status}`);

                // Refresh user balance after credit changes
                await useUserStore.getState().loadUserProfile();

                // Show appropriate notification
                if (status.status === 'completed') {
                  useNotificationsStore.getState().addNotification(
                    notificationHelpers.generationComplete(currentJob.mode)
                  );
                } else {
                  useErrorStore.getState().setError(
                    errorHelpers.generation(
                      status.error || 'Generation failed',
                      { jobId, status }
                    )
                  );
                }
              } catch (creditError) {
                console.error('Failed to finalize credits:', creditError);
                useErrorStore.getState().setError(
                  errorHelpers.credits('Failed to finalize credits', creditError)
                );
              }

              // Job finished
              let storedMedia: StoredMedia | undefined;

              if (status.status === 'completed' && status.resultUrl) {
                try {
                  // Download and save the result image
                  const filename = `generated_${jobId}.jpg`;
                  storedMedia = await StorageService.saveGeneratedImage(
                    status.resultUrl,
                    filename,
                    jobId
                  );

                  // Sync to cloud if enabled
                  if (storedMedia) {
                    await StorageService.syncMediaToCloud(storedMedia);
                  }

                  // Update media store
                  await useMediaStore.getState().syncWithLocalStorage();
                } catch (error) {
                  console.error('Failed to save generated image:', error);
                }
              }

              const completedJob = {
                ...currentJob,
                status: status.status,
                resultUrl: status.resultUrl,
                error: status.error,
                storedMedia,
              };

              set({
                currentJob: null,
                isGenerating: false,
                jobQueue: [...get().jobQueue, completedJob]
              });

              // Save to history
              get().saveJobHistory();
            } else {
            // Still processing, update progress
            set({
              currentJob: {
                ...currentJob,
                status: status.status,
                progress: status.progress,
              }
            });

            // Continue polling
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('Poll status error:', error);
        // Stop polling on error
      }
    };

    // Start polling
    poll();
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
