// Mobile generation service - integrates with existing Netlify Functions
// This mirrors the website's complete unified generation pipeline

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import { config } from '../config/environment';
import { cloudinaryService } from './cloudinaryService';

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

  // Upload image to backend media_assets table and get UUID
  private static async uploadToMediaAssets(imageUri: string): Promise<string> {
    try {
      console.log('🖼️ [Mobile] Uploading image to media_assets table:', imageUri);
      
      // Compress image before upload
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
      
      // Get Cloudinary signature
      const signatureData = await cloudinaryService.getSignature({
        folder: 'stefna/sources'
      });
      
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        compressedImage.uri,
        signatureData
      );
      
      console.log('☁️ [Mobile] Image uploaded to Cloudinary:', uploadResult.secure_url);
      
      // Now upload to backend media_assets table to get UUID
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }
      
      const mediaAssetResponse = await fetch(config.apiUrl('create-media-asset'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id,
          filename: uploadResult.original_filename || 'image.jpg',
          folder: 'stefna/sources'
        })
      });
      
      if (!mediaAssetResponse.ok) {
        throw new Error(`Failed to create media asset: ${mediaAssetResponse.statusText}`);
      }
      
      const mediaAssetData = await mediaAssetResponse.json();
      console.log('📋 [Mobile] Media asset created with UUID:', mediaAssetData.id);
      
      return mediaAssetData.id; // Return the UUID from media_assets table
      
    } catch (error) {
      console.error('❌ [Mobile] Upload to media_assets failed, trying fallback:', error);
      
      // Fallback: try uploading original image
      try {
        const signatureData = await cloudinaryService.getSignature({
          folder: 'stefna/sources'
        });
        
        const uploadResult = await cloudinaryService.uploadImage(
          imageUri,
          signatureData
        );
        
        console.log('☁️ [Mobile] Fallback upload successful:', uploadResult.secure_url);
        
        // Try to create media asset with fallback upload
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No auth token found');
        }
        
        const mediaAssetResponse = await fetch(config.apiUrl('create-media-asset'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            cloudinaryUrl: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            filename: uploadResult.original_filename || 'image.jpg',
            folder: 'stefna/sources'
          })
        });
        
        if (!mediaAssetResponse.ok) {
          throw new Error(`Failed to create media asset: ${mediaAssetResponse.statusText}`);
        }
        
        const mediaAssetData = await mediaAssetResponse.json();
        console.log('📋 [Mobile] Fallback media asset created with UUID:', mediaAssetData.id);
        
        return mediaAssetData.id;
        
      } catch (fallbackError) {
        console.error('❌ [Mobile] Fallback upload failed:', fallbackError);
        throw new Error('Failed to upload image to media_assets table');
      }
    }
  }

  // Image compression and Cloudinary upload (legacy - kept for compatibility)
  private static async compressAndUploadImage(imageUri: string): Promise<string> {
    try {
      console.log('🖼️ [Mobile] Compressing and uploading image:', imageUri);
      
      // Compress image before upload
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
      
      // Get Cloudinary signature
      const signatureData = await cloudinaryService.getSignature({
        folder: 'stefna/sources'
      });
      
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        compressedImage.uri,
        signatureData
      );
      
      console.log('☁️ [Mobile] Image uploaded to Cloudinary:', uploadResult.secure_url);
      return uploadResult.secure_url;
    } catch (error) {
      console.error('❌ [Mobile] Upload failed, trying original:', error);
      
      // Fallback: try uploading original image
      try {
        const signatureData = await cloudinaryService.getSignature({
          folder: 'stefna/sources'
        });
        
        const uploadResult = await cloudinaryService.uploadImage(
          imageUri,
          signatureData
        );
        
        console.log('☁️ [Mobile] Original image uploaded to Cloudinary:', uploadResult.secure_url);
        return uploadResult.secure_url;
      } catch (fallbackError) {
        console.error('❌ [Mobile] Fallback upload also failed:', fallbackError);
        throw new Error('Failed to upload image to Cloudinary');
      }
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
          const message = error instanceof Error ? error.message : 'Unknown error';
          processed.push({ ...item, status: 'failed', error: message });
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
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      if (!contentType || !contentType.includes('application/json') || !text.trim().startsWith('{')) {
        throw new Error('Invalid presets response');
      }
      const data = JSON.parse(text);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch presets');
      }
      return data.presets || [];
    } catch (error) {
      console.error('Get presets error:', error instanceof Error ? error.message : error);
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

      // Upload image to Cloudinary first (like website)
      const cloudinaryUrl = await this.compressAndUploadImage(request.imageUri);
      console.log('🔗 [Mobile] Cloudinary URL received:', cloudinaryUrl);
      console.log('🔗 [Mobile] Cloudinary URL type:', typeof cloudinaryUrl);
      console.log('🔗 [Mobile] Cloudinary URL length:', cloudinaryUrl?.length);
      
      // Use 'present' like website does - backend will handle the Cloudinary URL
      const sourceAssetId = 'present';

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

      // Build payload matching website's unified-generate-background format
      const runId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const payload: any = {
        mode: modeMap[request.mode] || request.mode,
        prompt: processedPrompt,
        sourceAssetId: sourceAssetId, // Using 'present' like website
        cloudinaryUrl: cloudinaryUrl, // Include Cloudinary URL for backend
        // userId removed - backend will extract from JWT token
        runId,
        additionalImages: 0,
        editImages: 0,
        storyTimePresetId: undefined,

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
        sourceAssetId: payload.sourceAssetId,
        cloudinaryUrl: payload.cloudinaryUrl ? payload.cloudinaryUrl.substring(0, 50) + '...' : 'MISSING',
        runId: payload.runId,
        url: config.apiUrl('unified-generate-background'),
        payloadSize: JSON.stringify(payload).length
      });
      
      // Debug: Show full payload structure
      console.log('📋 [Mobile] Full payload structure:', Object.keys(payload));
      console.log('📋 [Mobile] Payload cloudinaryUrl:', payload.cloudinaryUrl);
      console.log('📋 [Mobile] Payload sourceAssetId:', payload.sourceAssetId);

      // Hermes-safe fetch + parse with timeout and defensive checks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let response: Response | undefined;
      let responseText = '';
      try {
        response = await fetch(config.apiUrl('unified-generate-background'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        responseText = await response.text();

        console.log('📡 [Mobile Generation] Response status:', response.status);
        console.log('📡 [Mobile Generation] Content-Type:', contentType);
        console.log('📄 [Mobile Generation] Raw response:', {
          status: response.status,
          responseLength: responseText.length,
          responseStart: responseText.substring(0, 200),
        });

      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [Mobile Generation] Non-JSON response:', {
          contentType,
          status: response.status,
          responsePreview: responseText.substring(0, 500)
        });
        
        // Handle 202 Accepted responses (async processing started)
        if (response.status === 202) {
          console.log('✅ [Mobile Generation] Request accepted (202), processing started');
          
          // Try to extract jobId from response if it's JSON-like
          let jobId = payload.runId;
          let runId = payload.runId;
          
          if (responseText.trim()) {
            try {
              const parsedResponse = JSON.parse(responseText);
              if (parsedResponse.jobId) jobId = parsedResponse.jobId;
              if (parsedResponse.runId) runId = parsedResponse.runId;
              console.log('📋 [Mobile Generation] Extracted job info from 202 response:', { jobId, runId });
            } catch (parseError) {
              console.log('📋 [Mobile Generation] 202 response not JSON, using fallback jobId');
            }
          }
          
          return {
            success: true,
            jobId: jobId,
            runId: runId,
            estimatedTime: 45, // Default estimate
          };
        }
        
        // Check for common error patterns
        if (responseText.includes('Internal Error') && responseText.includes('ID:')) {
          // Extract error ID for debugging
          const idMatch = responseText.match(/ID:\s*([A-Z0-9]+)/);
          const errorId = idMatch ? idMatch[1] : 'unknown';
          return {
            success: false,
            error: `Server error (ID: ${errorId}). Please try again or contact support.`
          };
        }
        
        return {
          success: false,
          error: `Invalid response format: ${responseText.substring(0, 200)}`
        };
      }

        const trimmed = responseText.trim();
        
        // Handle 202 responses with empty body (common case)
        if (response.status === 202 && trimmed === '') {
          console.log('✅ [Mobile Generation] Empty 202 response - async processing started');
          return {
            success: true,
            jobId: payload.runId,
            runId: payload.runId,
            estimatedTime: 45,
          };
        }
        
        // Check if response is valid JSON
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          return {
            success: false,
            error: `Unexpected response from server (status ${response.status}): ${trimmed.substring(0, 200)}`
          };
        }

        // Safe JSON parsing with error handling
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ [Mobile Generation] JSON parse error:', parseError);
          return {
            success: false,
            error: `Invalid JSON response: ${responseText.substring(0, 200)}`
          };
        }

        if (!response.ok) {
          return {
            success: false,
            error: data.error || 'Generation failed'
          };
        }

        return {
          success: true,
          jobId: data.jobId,
          runId: data.runId || runId,
          estimatedTime: data.estimatedTime,
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('❌ [Mobile Generation] Fetch or JSON error:', {
          message: fetchError?.message,
          responseText,
        });
        if (fetchError?.name === 'AbortError') {
          return { success: false, error: 'Request timeout' };
        }
        return {
          success: false,
          error: `Unexpected error: ${fetchError?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Start generation error:', error instanceof Error ? error.message : error);
      
      // If network error, queue for offline processing
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('network') || message.includes('fetch')) {
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
        error: this.getUserFriendlyErrorMessage(message)
      };
    }
  }

  // Separate method for online generation (used by offline queue processor)
  private static async startOnlineGeneration(request: GenerationRequest): Promise<GenerationResponse> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found');

    // Upload image to Cloudinary first (like website)
    const cloudinaryUrl = await this.compressAndUploadImage(request.imageUri);
    
    // Use 'present' like website does - backend will handle the Cloudinary URL
    const sourceAssetId = 'present';

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

    // Build payload matching website's unified-generate-background format
    const payload: any = {
      mode: modeMap[request.mode] || request.mode,
      prompt: processedPrompt,
        sourceAssetId: sourceAssetId, // Using 'present' like website
        cloudinaryUrl: cloudinaryUrl, // Include Cloudinary URL for backend
      // userId removed - backend will extract from JWT token
      runId: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      additionalImages: 0,
      editImages: 0,
      storyTimePresetId: undefined,

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
      url: config.apiUrl('unified-generate-background'),
      payloadSize: JSON.stringify(payload).length
    });

    // Log the actual payload being sent (truncated for readability)
    console.log('📦 [Mobile Generation] Full payload preview:', {
      ...payload,
      sourceAssetId: payload.sourceAssetId ? `base64:${payload.sourceAssetId.substring(0, 50)}...` : 'none',
      prompt: payload.prompt?.substring(0, 100) + (payload.prompt?.length > 100 ? '...' : '')
    });

    // Use the unified background endpoint (matching website)
    console.log('🌐 [Mobile Generation] Making request to:', config.apiUrl('unified-generate-background'));
    console.log('🔐 [Mobile Generation] Token length:', token.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response | undefined;
    let responseText = '';
    try {
      response = await fetch(config.apiUrl('unified-generate-background'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      responseText = await response.text();

      console.log('📡 [Mobile Generation] Response status:', response.status);
      console.log('📡 [Mobile Generation] Content-Type:', contentType);
      console.log('📄 [Mobile Generation] Raw response:', {
        status: response.status,
        responseLength: responseText.length,
        responseStart: responseText.substring(0, 200),
      });

      // Hermes-safe defensive check before parsing as JSON
      const trimmed = responseText.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return {
          success: false,
          error: `Unexpected response from server (status ${response.status})`
        };
      }

      const data = JSON.parse(responseText);

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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('❌ [Mobile Generation] Fetch or JSON error:', {
        message: fetchError?.message,
        responseText,
      });
      if (fetchError?.name === 'AbortError') {
        return { success: false, error: 'Request timeout' };
      }
      return {
        success: false,
        error: `Unexpected error: ${fetchError?.message || 'Unknown error'}`
      };
    }
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
      const ct = response.headers.get('content-type');
      const raw = await response.text();
      if (!ct || !ct.includes('application/json') || !raw.trim().startsWith('{')) {
        throw new Error('Invalid status response');
      }
      const data = JSON.parse(raw);
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
      console.error('Get generation status error:', error instanceof Error ? error.message : error);
      return {
        jobId,
        status: 'failed',
        error: this.getUserFriendlyErrorMessage(error instanceof Error ? error.message : String(error)),
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
      const ct = response.headers.get('content-type');
      const raw = await response.text();
      if (!ct || !ct.includes('application/json') || !raw.trim().startsWith('{')) {
        throw new Error('Invalid profile response');
      }
      const data = JSON.parse(raw);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh credits');
      }
      return data?.credits?.balance ?? 0;
    } catch (error) {
      console.error('Refresh credits error:', error instanceof Error ? error.message : error);
      return 0;
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
