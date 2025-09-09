// Mobile generation service - integrates with existing Netlify Functions
// This mirrors the website's complete unified generation pipeline

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import { config } from '../config/environment';

// Import prompt enhancement utilities (need to copy from website)
const enhancePromptForSpecificity = (originalPrompt: string, options: any = {}) => {
  // Simplified version - in production, copy the full function from website
  return {
    enhancedPrompt: originalPrompt + ' high quality, detailed, professional',
    negativePrompt: 'blurry, low quality, distorted, ugly, deformed'
  };
};

const detectGenderFromPrompt = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('man') || lowerPrompt.includes('male')) return 'male';
  if (lowerPrompt.includes('woman') || lowerPrompt.includes('female')) return 'female';
  return 'unknown';
};

const detectAnimalsFromPrompt = (prompt: string): string[] => {
  const animals = ['dog', 'cat', 'horse', 'bird'];
  return animals.filter(animal => prompt.toLowerCase().includes(animal));
};

const detectGroupsFromPrompt = (prompt: string): string[] => {
  const groups = ['family', 'couple', 'friends', 'group'];
  return groups.filter(group => prompt.toLowerCase().includes(group));
};

const applyAdvancedPromptEnhancements = (prompt: string): string => {
  // Simplified version - in production, copy the full function from website
  if (prompt.includes('(') && prompt.includes(')')) return prompt;
  return prompt + ' high quality, detailed, professional photography, sharp focus';
};

export interface GenerationRequest {
  imageUri: string;
  mode: 'presets' | 'custom-prompt' | 'edit-photo' | 'emotion-mask' | 'ghibli-reaction' | 'neo-glitch';
  presetId?: string;
  customPrompt?: string;
  specialModeId?: string;
  // userId removed - backend will extract from JWT token
}

export interface GenerationResponse {
  success: boolean;
  jobId?: string;
  runId?: string;
  estimatedTime?: number;
  error?: string;
  offline?: boolean;
}

export interface GenerationStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  progress?: number;
  error?: string;
}

export interface Preset {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  prompt: string;
  negativePrompt: string;
  strength: number;
}

export class GenerationService {
  // Network detection
  static async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }

  static async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  // Image compression and processing
  private static async compressAndConvertImage(imageUri: string): Promise<string> {
    try {
      console.log('🖼️ [Mobile] Compressing image:', imageUri);
      
      // Compress image before base64 conversion (fixed: removed invalid compress action)
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024, height: 1024 } } // Resize to max 1024px
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      console.log('✅ [Mobile] Image compressed successfully');
      return await this.convertImageToBase64(compressedImage.uri);
    } catch (error) {
      console.error('❌ [Mobile] Compression failed, using original:', error);
      return await this.convertImageToBase64(imageUri);
    }
  }

  // Offline queue management
  static async queueOfflineGeneration(request: GenerationRequest) {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_generation_queue');
      const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
      
      queue.push({
        ...request,
        timestamp: Date.now(),
        status: 'queued'
      });
      
      await AsyncStorage.setItem('offline_generation_queue', JSON.stringify(queue));
      console.log('📱 [Mobile] Queued offline generation:', request.mode);
    } catch (error) {
      console.error('❌ [Mobile] Failed to queue offline generation:', error);
    }
  }

  static async processOfflineQueue() {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_generation_queue');
      if (!offlineQueue) return;
      
      const queue = JSON.parse(offlineQueue);
      const processed = [];
      
      for (const item of queue) {
        try {
          if (item.status === 'queued') {
            const result = await this.startOnlineGeneration(item);
            processed.push({ ...item, status: 'completed', result });
          } else {
            processed.push(item);
          }
        } catch (error) {
          processed.push({ ...item, status: 'failed', error: error.message });
        }
      }
      
      await AsyncStorage.setItem('offline_generation_queue', JSON.stringify(processed));
      console.log('📱 [Mobile] Processed offline queue');
    } catch (error) {
      console.error('❌ [Mobile] Failed to process offline queue:', error);
    }
  }

  static async getPresets(): Promise<Preset[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(config.apiUrl('get-presets'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch presets');
      }

      return data.presets || [];
    } catch (error) {
      console.error('Get presets error:', error);
      // Return local presets as fallback
      return this.getLocalPresets();
    }
  }

  static async startGeneration(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      // Check network connection
      const isOnline = await this.isOnline();
      if (!isOnline) {
        console.log('📱 [Mobile] Offline mode - queuing generation');
        await this.queueOfflineGeneration(request);
        return {
          success: true,
          jobId: `offline_${Date.now()}`,
          estimatedTime: 0,
          offline: true
        };
      }

      // Compress and convert image URI to base64 for upload
      const base64Image = await this.compressAndConvertImage(request.imageUri);

      // Convert mobile mode names to website's expected format
      const modeMap: Record<string, string> = {
        'presets': 'presets',
        'custom-prompt': 'custom-prompt',
        'edit-photo': 'edit-photo',
        'emotion-mask': 'emotion-mask',
        'ghibli-reaction': 'ghibli-reaction',
        'neo-glitch': 'neo-glitch',
      };

      // Apply complete prompt enhancement pipeline (matching website)
      let processedPrompt = request.customPrompt || '';
      let negativePrompt = '';

      if (processedPrompt) {
        // Step 1: Detect gender, animals, groups from original prompt
        const detectedGender = detectGenderFromPrompt(processedPrompt);
        const detectedAnimals = detectAnimalsFromPrompt(processedPrompt);
        const detectedGroups = detectGroupsFromPrompt(processedPrompt);

        console.log('🔍 [Mobile Prompt Enhancement] Detected:', {
          gender: detectedGender,
          animals: detectedAnimals,
          groups: detectedGroups
        });

        // Step 2: Apply enhanced prompt engineering (matching website)
        const { enhancedPrompt, negativePrompt: enhancedNegative } = enhancePromptForSpecificity(processedPrompt, {
          preserveGender: true,
          preserveAnimals: true,
          preserveGroups: true,
          originalGender: detectedGender,
          originalAnimals: detectedAnimals,
          originalGroups: detectedGroups,
          context: request.mode
        });

        // Step 3: Apply advanced prompt enhancements
        processedPrompt = applyAdvancedPromptEnhancements(enhancedPrompt);
        negativePrompt = enhancedNegative;

        console.log('✨ [Mobile Prompt Enhancement] Original:', processedPrompt);
        console.log('✨ [Mobile Prompt Enhancement] Enhanced:', processedPrompt);
        if (negativePrompt) {
          console.log('✨ [Mobile Prompt Enhancement] Negative:', negativePrompt);
        }
      }

      // Build complete payload matching website's unified-generate-background
      const payload: any = {
        mode: modeMap[request.mode] || request.mode,
        prompt: processedPrompt,
        sourceAssetId: base64Image, // Website expects base64 as sourceAssetId
        userId: request.userId,
        runId: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

        // Mode-specific parameters (matching website)
        ...(request.presetId && { presetKey: request.presetId }),
        ...(request.specialModeId && request.mode === 'emotion-mask' && { emotionMaskPresetId: request.specialModeId }),
        ...(request.specialModeId && request.mode === 'ghibli-reaction' && { ghibliReactionPresetId: request.specialModeId }),
        ...(request.specialModeId && request.mode === 'neo-glitch' && { neoGlitchPresetId: request.specialModeId }),

        // Prompt enhancement results
        ...(negativePrompt && { negative_prompt: negativePrompt }),

        // Mode-specific settings (matching website)
        aspect_ratio: this.getAspectRatioForMode(request.mode),
        image_prompt_strength: this.getImageStrengthForMode(request.mode),
        guidance_scale: this.getGuidanceScaleForMode(request.mode),

        // Quality settings
        prompt_upsampling: true,
        safety_tolerance: 3,
        output_format: 'jpeg',

        // IPA (Identity Preservation Analysis) settings
        ipaThreshold: 0.8,
        ipaRetries: 2,
        ipaBlocking: false,
      };

      console.log('🚀 [Mobile Generation] Sending payload:', {
        mode: payload.mode,
        promptLength: payload.prompt?.length || 0,
        hasSource: !!payload.sourceAssetId,
        runId: payload.runId,
      });

      // Use the unified background endpoint (matching website)
      const response = await fetch(config.apiUrl('unified-generate-background'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Generation failed'
        };
      }

      return {
        success: true,
        jobId: data.jobId,
        runId: data.runId,
        estimatedTime: data.estimatedTime,
      };
    } catch (error) {
      console.error('Start generation error:', error);
      
      // If network error, queue for offline processing
      if (error.message.includes('network') || error.message.includes('fetch')) {
        await this.queueOfflineGeneration(request);
        return {
          success: true,
          jobId: `offline_${Date.now()}`,
          estimatedTime: 0,
          offline: true
        };
      }
      
      return {
        success: false,
        error: this.getUserFriendlyErrorMessage(error.message)
      };
    }
  }

  // Separate method for online generation (used by offline queue processor)
  private static async startOnlineGeneration(request: GenerationRequest): Promise<GenerationResponse> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found');

    // Compress and convert image URI to base64 for upload
    const base64Image = await this.compressAndConvertImage(request.imageUri);

    // Convert mobile mode names to website's expected format
    const modeMap: Record<string, string> = {
      'presets': 'presets',
      'custom-prompt': 'custom-prompt',
      'edit-photo': 'edit-photo',
      'emotion-mask': 'emotion-mask',
      'ghibli-reaction': 'ghibli-reaction',
      'neo-glitch': 'neo-glitch',
    };

    // Apply complete prompt enhancement pipeline (matching website)
    let processedPrompt = request.customPrompt || '';
    let negativePrompt = '';

    if (processedPrompt) {
      // Step 1: Detect gender, animals, groups from original prompt
      const detectedGender = detectGenderFromPrompt(processedPrompt);
      const detectedAnimals = detectAnimalsFromPrompt(processedPrompt);
      const detectedGroups = detectGroupsFromPrompt(processedPrompt);

      console.log('🔍 [Mobile Prompt Enhancement] Detected:', {
        gender: detectedGender,
        animals: detectedAnimals,
        groups: detectedGroups
      });

      // Step 2: Apply enhanced prompt engineering (matching website)
      const { enhancedPrompt, negativePrompt: enhancedNegative } = enhancePromptForSpecificity(processedPrompt, {
        preserveGender: true,
        preserveAnimals: true,
        preserveGroups: true,
        originalGender: detectedGender,
        originalAnimals: detectedAnimals,
        originalGroups: detectedGroups,
        context: request.mode
      });

      // Step 3: Apply advanced prompt enhancements
      processedPrompt = applyAdvancedPromptEnhancements(enhancedPrompt);
      negativePrompt = enhancedNegative;

      console.log('✨ [Mobile Prompt Enhancement] Original:', processedPrompt);
      console.log('✨ [Mobile Prompt Enhancement] Enhanced:', processedPrompt);
      if (negativePrompt) {
        console.log('✨ [Mobile Prompt Enhancement] Negative:', negativePrompt);
      }
    }

    // Build complete payload matching website's unified-generate-background
    const payload: any = {
      mode: modeMap[request.mode] || request.mode,
      prompt: processedPrompt,
      sourceAssetId: base64Image, // Website expects base64 as sourceAssetId
      // userId removed - backend will extract from JWT token
      runId: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      // Mode-specific parameters (matching website)
      ...(request.presetId && { presetKey: request.presetId }),
      ...(request.specialModeId && request.mode === 'emotion-mask' && { emotionMaskPresetId: request.specialModeId }),
      ...(request.specialModeId && request.mode === 'ghibli-reaction' && { ghibliReactionPresetId: request.specialModeId }),
      ...(request.specialModeId && request.mode === 'neo-glitch' && { neoGlitchPresetId: request.specialModeId }),

      // Prompt enhancement results
      ...(negativePrompt && { negative_prompt: negativePrompt }),

      // Mode-specific settings (matching website)
      aspect_ratio: this.getAspectRatioForMode(request.mode),
      image_prompt_strength: this.getImageStrengthForMode(request.mode),
      guidance_scale: this.getGuidanceScaleForMode(request.mode),

      // Quality settings
      prompt_upsampling: true,
      safety_tolerance: 3,
      output_format: 'jpeg',

      // IPA (Identity Preservation Analysis) settings
      ipaThreshold: 0.8,
      ipaRetries: 2,
      ipaBlocking: false,
    };

    console.log('🚀 [Mobile Generation] Sending payload:', {
      mode: payload.mode,
      promptLength: payload.prompt?.length || 0,
      hasSource: !!payload.sourceAssetId,
      runId: payload.runId,
    });

    // Use the unified background endpoint (matching website)
    const response = await fetch(config.apiUrl('unified-generate-background'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Non-JSON response from generation API:', textResponse);
      return {
        success: false,
        error: response.ok ? 'Server returned non-JSON response' : `Server error (${response.status}): ${textResponse.substring(0, 200)}`
      };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      const textResponse = await response.text();
      return {
        success: false,
        error: `Invalid response format: ${textResponse.substring(0, 200)}`
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Generation failed (${response.status})`
      };
    }

    return {
      success: true,
      jobId: data.jobId,
      estimatedTime: data.estimatedTime,
    };
  }

  // User-friendly error messages
  private static getUserFriendlyErrorMessage(error: string): string {
    const friendlyMessages = {
      'INSUFFICIENT_CREDITS': 'You need more credits to generate images. Credits reset daily.',
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'IMAGE_TOO_LARGE': 'The image is too large. Please try a smaller image.',
      'INVALID_IMAGE': 'The image format is not supported. Please try a different image.',
      'GENERATION_TIMEOUT': 'Generation took too long. Please try again.',
      'SERVER_ERROR': 'Our servers are busy. Please try again in a few minutes.',
      'fetch': 'Please check your internet connection and try again.',
      'network': 'Please check your internet connection and try again.'
    };
    
    // Check for partial matches
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }
    
    return 'Something went wrong. Please try again.';
  }

  // Adaptive polling configuration
  private static pollInterval = 2000; // Start with 2 seconds
  private static maxPollInterval = 30000; // Max 30 seconds
  private static pollMultiplier = 1.5; // Increase by 50% each time

  static async getGenerationStatus(jobId: string): Promise<GenerationStatus> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(config.apiUrl(`getMediaByRunId?runId=${encodeURIComponent(jobId)}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      return {
        jobId,
        status: data.status,
        resultUrl: data.resultUrl,
        progress: data.progress,
        error: data.error,
      };
    } catch (error) {
      console.error('Get generation status error:', error);
      return {
        jobId,
        status: 'failed',
        error: this.getUserFriendlyErrorMessage(error.message),
      };
    }
  }

  // Adaptive polling with exponential backoff
  static async pollGenerationStatus(jobId: string): Promise<GenerationStatus> {
    let attempts = 0;
    const maxAttempts = 20; // 5 minutes max
    let currentPollInterval = this.pollInterval;
    
    console.log('🔄 [Mobile] Starting adaptive polling for job:', jobId);
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getGenerationStatus(jobId);
        
        if (status.status === 'completed' || status.status === 'failed') {
          console.log('✅ [Mobile] Polling completed:', status.status);
          return status;
        }
        
        console.log(`🔄 [Mobile] Polling attempt ${attempts + 1}/${maxAttempts}, status: ${status.status}, next poll in ${currentPollInterval}ms`);
        
        // Wait with current interval
        await new Promise(resolve => setTimeout(resolve, currentPollInterval));
        
        // Increase interval for next poll (adaptive backoff)
        currentPollInterval = Math.min(currentPollInterval * this.pollMultiplier, this.maxPollInterval);
        attempts++;
      } catch (error) {
        console.error('❌ [Mobile] Polling error:', error);
        break;
      }
    }
    
    console.log('⏰ [Mobile] Polling timeout after', attempts, 'attempts');
    return { 
      jobId, 
      status: 'failed', 
      error: 'Generation took too long. Please try again.' 
    };
  }

  // Removed: getUserMedia - use mediaService.getUserMedia instead
  // Backend will extract userId from JWT token, no need to pass it

  static async refreshUserCredits(): Promise<number> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(config.apiUrl('get-user-profile'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh credits');
      }

      return data?.credits?.balance ?? 0;
    } catch (error) {
      console.error('Refresh credits error:', error);
      return 0;
    }
  }

  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // For React Native, we need to fetch the image and convert to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw new Error('Failed to process image for upload');
    }
  }

  private static getLocalPresets(): Preset[] {
    // Fallback presets for offline/demo mode
    return [
      {
        id: 'cinematic_glow',
        key: 'cinematic_glow',
        label: 'Cinematic Glow',
        description: 'Cinematic photo with soft lighting',
        category: 'cinematic',
        prompt: 'Cinematic photo with soft lighting, shallow depth of field, filmic glow',
        negativePrompt: 'blurry, low quality, distorted',
        strength: 0.8,
      },
      {
        id: 'bright_airy',
        key: 'bright_airy',
        label: 'Bright & Airy',
        description: 'Bright and airy portrait',
        category: 'bright',
        prompt: 'Bright and airy portrait, pastel tones, soft sunlight',
        negativePrompt: 'blurry, low quality, distorted',
        strength: 0.8,
      },
      {
        id: 'vivid_pop',
        key: 'vivid_pop',
        label: 'Vivid Pop',
        description: 'Vivid photo with bold colors',
        category: 'vivid',
        prompt: 'Vivid photo with bold colors, strong contrast, high saturation',
        negativePrompt: 'blurry, low quality, distorted',
        strength: 0.8,
      },
    ];
  }

  // Mode-specific settings (matching website's unified-generate-background)
  private static getAspectRatioForMode(mode: string): string {
    switch (mode) {
      case 'ghibli-reaction':
      case 'emotion-mask':
      case 'custom-prompt':
      case 'presets':
        return '4:5'; // Instagram/Facebook/X-friendly portrait
      case 'neo-glitch':
        return '16:9'; // Cinematic wide (Stability.ai)
      case 'edit-photo':
        return '4:5'; // Safe default for edits
      default:
        return '1:1'; // Safe fallback
    }
  }

  private static getImageStrengthForMode(mode: string): number {
    switch (mode) {
      case 'ghibli-reaction':
        return 0.55;
      case 'neo-glitch':
        return 0.35;
      case 'emotion-mask':
        return 0.45;
      case 'custom-prompt':
      case 'presets':
        return 0.45;
      case 'edit-photo':
        return 0.5;
      default:
        return 0.45;
    }
  }

  private static getGuidanceScaleForMode(mode: string): number {
    switch (mode) {
      case 'ghibli-reaction':
      case 'emotion-mask':
        return 7.0; // Lower guidance for subtler effect
      case 'neo-glitch':
        return 8.5;
      case 'custom-prompt':
      case 'presets':
        return 7.5;
      case 'edit-photo':
        return 8.0;
      default:
        return 7.5;
    }
  }
}
