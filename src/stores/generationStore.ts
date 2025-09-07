import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenerationService, GenerationStatus, Preset } from '../services/generationService';
import { StorageService, StoredMedia } from '../services/storageService';

interface GenerationJob {
  id: string;
  imageUri: string;
  mode: 'presets' | 'custom' | 'edit' | 'emotionmask' | 'ghiblireact' | 'neotokyoglitch' | 'storytime';
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
      // Call the generation API
      const response = await GenerationService.startGeneration({
        imageUri: job.imageUri,
        mode: job.mode,
        presetId: job.presetId,
        customPrompt: job.customPrompt,
        specialModeId: job.specialModeId,
        userId: 'current_user_id', // TODO: Get from auth store
      });

      if (response.success && response.jobId) {
        // Update job with API job ID
        const updatedJob = { ...job, id: response.jobId };
        set({ currentJob: updatedJob });

        // Start polling for status
        get().pollJobStatus(response.jobId);
      } else {
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
      const failedJob = {
        ...job,
        status: 'failed' as const,
        error: 'Network error',
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
