// Mobile Generation Store - Simplified version based on website's approach
// Minimal state management, no complex interactions

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenerationService, { GenerationRequest, GenerationResult } from '../services/generationService';
import { useCreditsStore } from './creditsStore';
import { useAuthStore } from './authStore';
import { StorageService } from '../services/storageService';
import { useMediaStore } from './mediaStore';
import { ErrorMessages } from '../constants/errorMessages';

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
    // Get user ID for user-specific storage
    const userString = await AsyncStorage.getItem('user_profile');
    const currentUser = userString ? JSON.parse(userString) : null;
    const userId = currentUser?.id;
    
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
            jobId,
            userId
          );
          
          // Update the saved media with cloud URL and cloud ID
          const updatedMedia = {
            ...savedMedia,
            cloudUrl: result.imageUrl,
            cloudId: extractCloudinaryPublicId(result.imageUrl), // Proper Cloudinary ID extraction
            synced: true,
            type: request.mode // Add the generation mode as the type field
          };
          
          // Update local storage
          await StorageService.updateMediaInStorage(updatedMedia, userId);
          
          // Update media store directly instead of reloading everything
          const { media } = useMediaStore.getState();
          const updatedMediaList = [...media, updatedMedia];
          useMediaStore.setState({ media: updatedMediaList });
          
          console.log('✅ [Background] Media saved successfully to local storage');
        } catch (saveError) {
          console.error('❌ [Background] Failed to save media to local storage:', saveError);
        }
      }

      // Completion handled by ProcessingScreen - no notification needed
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

      // Failure handled by ProcessingScreen - no notification needed
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

    // Error handled by ProcessingScreen - no notification needed
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
