// Mobile Generation Store - Simplified version based on website's approach
// Minimal state management, no complex interactions

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenerationService, { GenerationRequest, GenerationResult } from '../services/generationService';
import { useCreditsStore } from './creditsStore';
import { useAuthStore } from './authStore';
import { useNotificationsStore } from './notificationsStore';
import { StorageService } from '../services/storageService';
import { useMediaStore } from './mediaStore';

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
    console.log('[GenerationStore] startGeneration called with:', {
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

    console.log('[GenerationStore] Added job to active generations:', jobId);

    // Start background processing
    processGenerationInBackground(jobId, request);
    
    console.log('[GenerationStore] Background processing started for job:', jobId);
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
  console.log('[Background] Starting background processing for job:', jobId);
  console.log('[Background] Request details:', {
    mode: request.mode,
    hasImage: !!request.imageUri,
    hasPreset: !!request.presetId,
    hasCustomPrompt: !!request.customPrompt
  });
  
  try {
    // Update status to processing
    console.log('[Background] Updating job status to processing...');
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
    console.log('[Background] User found:', user.id);

    // Credits are handled automatically by the backend
    // No need to reserve credits on mobile side to avoid double charging
    console.log('[Background] Skipping credit reservation - backend handles credits automatically');

    // Call the generation service
    console.log('[Background] Calling GenerationService.generate...');
    console.log('[Background] Request being sent:', {
      mode: request.mode,
      imageUri: request.imageUri ? 'present' : 'missing',
      presetId: request.presetId,
      customPrompt: request.customPrompt ? 'present' : 'missing'
    });
    
    const result = await GenerationService.generate(request);
    
    console.log('[Background] GenerationService result:', {
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

      // Credits are handled automatically by the backend
      console.log('Generation completed successfully - credits handled by backend');

      // Save generated media to local storage
      if (result.imageUrl) {
        try {
          console.log('💾 [Background] Saving generated media to local storage:', result.imageUrl);
          
          // Download and save the generated image
          const filename = `generated_${request.mode}_${Date.now()}.jpg`;
          const savedMedia = await StorageService.saveGeneratedImage(
            result.imageUrl,
            filename,
            jobId
          );
          
          // Update the saved media with cloud URL and cloud ID
          const updatedMedia = {
            ...savedMedia,
            cloudUrl: result.imageUrl,
            cloudId: extractCloudinaryPublicId(result.imageUrl), // Proper Cloudinary ID extraction
            synced: true
          };
          
          // Update local storage
          await StorageService.updateMediaInStorage(updatedMedia);
          
          // Refresh media store to show the new media
          const { loadUserMedia } = useMediaStore.getState();
          await loadUserMedia();
          
          console.log('✅ [Background] Media saved successfully to local storage');
        } catch (saveError) {
          console.error('❌ [Background] Failed to save media to local storage:', saveError);
        }
      }

      // Show completion notification
      showCompletionNotification(jobId, request.mode, true);
    } else {
      // Credits are handled automatically by the backend
      console.log('Generation failed - credits handled by backend');

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
      console.log('Refunded credits due to generation error');
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
    ? 'Your media is ready' 
    : error || 'Generation failed';
  
  console.log(`Notification: ${message}`);
  
  // Use the notifications store to show the notification
  const { addNotification } = useNotificationsStore.getState();
  
  if (success) {
    addNotification({
      type: 'success',
      title: 'Media Ready',
      message: 'Your media is ready'
    });
  } else {
    addNotification({
      type: 'error', 
      title: 'Generation Failed',
      message: error || 'Unknown error occurred'
    });
  }
}

// Helper function to extract Cloudinary public ID from URL
function extractCloudinaryPublicId(imageUrl: string): string | undefined {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // Example: https://res.cloudinary.com/dw2xaqjmg/image/upload/v1757651501/stefna/generated/cuix97vhhwnxwzognlro.jpg
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the 'upload' part and get everything after it
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < pathParts.length) {
      // Skip 'upload' and version, get the rest
      const publicIdParts = pathParts.slice(uploadIndex + 2);
      const publicId = publicIdParts.join('/');
      // Remove file extension
      return publicId.replace(/\.[^/.]+$/, '');
    }
    
    return undefined;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return undefined;
  }
}
