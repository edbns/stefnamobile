// Mobile Generation Service - Simplified version based on website's SimpleGenerationService
// Uses the same unified-generate endpoint and polling logic as the website

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import { config } from '../config/environment';
import { cloudinaryService } from './cloudinaryService';
import { 
  enhancePromptForSpecificity, 
  detectGenderFromPrompt, 
  detectAnimalsFromPrompt, 
  detectGroupsFromPrompt, 
  applyAdvancedPromptEnhancements 
} from '../utils/promptEnhancement';

export type GenerationMode = 'presets' | 'custom-prompt' | 'emotion-mask' | 'ghibli-reaction' | 'neo-glitch' | 'edit-photo';

export interface GenerationRequest {
  imageUri: string;
  mode: GenerationMode;
  presetId?: string;
  customPrompt?: string;
}

export interface GenerationResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  status: 'completed' | 'processing' | 'failed';
  imageUrl?: string;
  error?: string;
  type: GenerationMode;
}

class GenerationService {
  private static instance: GenerationService;
  private lastGenerationRequest?: GenerationRequest;

  private constructor() {}

  static getInstance(): GenerationService {
    if (!GenerationService.instance) {
      GenerationService.instance = new GenerationService();
    }
    return GenerationService.instance;
  }

  /**
   * Generate content using direct function calls with automatic polling
   * Based on website's SimpleGenerationService.generate()
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    console.log('🚀 [Mobile Generation] Starting generation:', {
      mode: request.mode,
      hasImage: !!request.imageUri,
      hasPreset: !!request.presetId,
      hasCustomPrompt: !!request.customPrompt,
      customPrompt: request.customPrompt?.substring(0, 50) + '...',
      presetId: request.presetId
    });

    // Store the request for polling fallback
    this.lastGenerationRequest = request;

    try {
      // Check network connection
      const isOnline = await this.isOnline();
      if (!isOnline) {
        console.log('📱 [Mobile Generation] Offline mode - queuing generation');
        await this.queueOfflineGeneration(request);
        return {
          success: true,
          jobId: `offline_${Date.now()}`,
          runId: `offline_${Date.now()}`,
          status: 'processing',
          type: request.mode
        };
      }

      // Upload image to Cloudinary first (like website)
      const cloudinaryUrl = await this.uploadImageToCloudinary(request.imageUri);
      console.log('☁️ [Mobile Generation] Image uploaded to Cloudinary:', cloudinaryUrl);

      // Preflight: check user quota before calling background function
      try {
        console.log('💰 [Mobile Generation] Preflight quota check before generation');
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) throw new Error('No auth token found');

        const quotaResp = await fetch(config.apiUrl('getQuota'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (quotaResp.ok) {
          const quota = await quotaResp.json();
          const remaining = typeof quota.remaining === 'number' ? quota.remaining : 0;
          if (remaining < 2) {
            console.warn('🚫 [Mobile Generation] Insufficient credits detected in preflight, aborting');
            throw new Error('INSUFFICIENT_CREDITS');
          }
        }
      } catch (preflightError) {
        if (preflightError instanceof Error && preflightError.message === 'INSUFFICIENT_CREDITS') {
          throw preflightError;
        }
        console.debug('ℹ️ [Mobile Generation] Preflight quota check skipped due to error:', preflightError);
      }

      // Prepare request payload based on mode
      const payload = await this.buildPayload(request, cloudinaryUrl);

      console.log('📡 [Mobile Generation] Calling unified-generate endpoint');

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(config.apiUrl('unified-generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Read response body first to check for early failures
      let result;
      let hasJsonBody = false;
      try {
        result = await response.json();
        hasJsonBody = true;
      } catch (parseError) {
        result = null;
        hasJsonBody = false;
      }

      // If this is a Netlify background function, it responds 202 with no body
      if (response.status === 202) {
        console.log('ℹ️ [Mobile Generation] Background accepted (202), starting polling...');
        
        // Start polling for completion
        return await this.pollForCompletion(payload.runId, request.mode);
      }

      // Check for early failure only if we have a JSON body and it indicates failure
      if (hasJsonBody && result && result.success === false && result.status === 'failed') {
        console.warn(`🚨 [Mobile Generation] Early failure detected: ${result.error}`);
        
        // Special handling for insufficient credits
        if (result.error && (result.error.includes('INSUFFICIENT_CREDITS') || result.error.includes('credits but only have'))) {
          console.log('🚨 [Mobile Generation] Throwing INSUFFICIENT_CREDITS error for frontend handling');
          throw new Error('INSUFFICIENT_CREDITS');
        }
        
        // For other failures, throw the error message
        const errorMessage = result.error || result.message || 'Generation failed';
        console.log('🚨 [Mobile Generation] Throwing early failure error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        // Use the parsed result if available, otherwise create error message
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (result && result.error) {
          errorMessage = result.error;
        } else if (result && result.message) {
          errorMessage = result.message;
        }
        
        // Special handling for insufficient credits
        if (result && result.error && (result.error.includes('INSUFFICIENT_CREDITS') || result.error.includes('credits but only have'))) {
          console.log('🚨 [Mobile Generation] Detected INSUFFICIENT_CREDITS, throwing error');
          throw new Error('INSUFFICIENT_CREDITS');
        }
        
        console.log('🚨 [Mobile Generation] Throwing error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Normalize backend unified-generate-background response
      const normalized = {
        success: !!result.success,
        jobId: result.jobId || result.runId || undefined,
        runId: result.runId || undefined,
        status: result.status === 'done' ? 'completed' : result.status,
        imageUrl: result.imageUrl || result.outputUrl || undefined,
        error: result.error,
        type: request.mode as GenerationMode
      } as GenerationResult;

      // Ensure failed-but-with-output is not treated as timeout
      if (normalized.status === 'failed' && normalized.imageUrl) {
        normalized.status = 'completed'; // let polling exit
        normalized.success = false;      // still mark as a failure (e.g. IPA fail)
      }

      console.log('✅ [Mobile Generation] Generation completed (normalized):', {
        success: normalized.success,
        status: normalized.status,
        hasImage: !!normalized.imageUrl
      });

      return normalized;

    } catch (error) {
      console.error('❌ [Mobile Generation] Generation failed:', error);

      // Re-throw INSUFFICIENT_CREDITS errors so frontend can handle them properly
      if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
        console.log('🚨 [Mobile Generation] Re-throwing INSUFFICIENT_CREDITS error for frontend handling');
        throw error;
      }

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        type: request.mode
      };
    }
  }

  /**
   * Poll for generation completion with intelligent detection
   * Based on website's SimpleGenerationService.pollForCompletion()
   */
  private async pollForCompletion(runId: string, mode: GenerationMode): Promise<GenerationResult> {
    const maxAttempts = 72; // 6 minutes with 5-second intervals (increased for longer generations)
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now()
    
    console.log(`🔄 [Mobile Generation] Starting intelligent polling for runId: ${runId}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const elapsed = Date.now() - startTime
        console.log(`📡 [Mobile Generation] Polling attempt ${attempt}/${maxAttempts} (${Math.round(elapsed/1000)}s elapsed) for runId: ${runId}`);
        
        const statusResult = await this.checkStatus(runId, mode);
        
        // Backup check: If we detect a failure response, stop polling immediately
        if (statusResult.success === false && statusResult.status === 'failed' && !statusResult.imageUrl) {
          console.warn(`🚨 [Polling] Generation failed during polling: ${statusResult.error}`);
          console.warn(`🚨 [Polling] Stopping polling and returning failure`);
          return statusResult;
        }
        
        if (statusResult.status === 'completed') {
          console.log(`✅ [Mobile Generation] Generation completed after ${attempt} attempts (${Math.round(elapsed/1000)}s total)`);
          return statusResult;
        }
        
        if (statusResult.status === 'failed') {
          // If there's an image, treat as "soft fail" (IPA failure)
          if (statusResult.imageUrl) {
            console.warn(`⚠️ [Mobile Generation] Generation failed but has output. Returning as completed with warning.`);
            return {
              ...statusResult,
              status: 'completed', // force status to completed
              success: false,      // retain false for UI to show IPA warning
            };
          }

          // No output at all — real failure
          console.log(`❌ [Mobile Generation] Generation failed after ${attempt} attempts (${Math.round(elapsed/1000)}s total)`);
          return statusResult;
        }
        
        // Still processing, wait before next poll
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
      } catch (error) {
        console.warn(`⚠️ [Mobile Generation] Polling attempt ${attempt} failed:`, error);
        
        // Don't fail immediately on polling errors, continue trying
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }
    
    // Timeout reached
    const totalElapsed = Date.now() - startTime
    console.log(`⏰ [Mobile Generation] Polling timeout reached for runId: ${runId} after ${Math.round(totalElapsed/1000)}s`);
    return {
      success: false,
      status: 'failed',
      error: 'Generation timed out. Please try again.',
      type: mode
    };
  }

  /**
   * Check generation status using exact runId matching with fallback
   * Based on website's SimpleGenerationService.checkStatus()
   */
  async checkStatus(runId: string, mode: GenerationMode): Promise<GenerationResult> {
    try {
      console.log(`🔍 [Mobile Generation] Checking status for runId: ${runId}`);
      
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');
      
      // Try the new getMediaByRunId endpoint first
      try {
        const response = await fetch(config.apiUrl(`getMediaByRunId?runId=${runId}`), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 404) {
          // Media not found yet, still processing
          console.log(`⏳ [Mobile Generation] Media not found yet, still processing... (runId: ${runId})`);
          return {
            success: true,
            jobId: runId,
            runId: runId,
            status: 'processing',
            error: undefined,
            type: mode
          };
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success && result.media) {
          console.log(`✅ [Mobile Generation] Generation completed! Found media:`, {
            id: result.media.id,
            runId: result.media.runId,
            type: result.media.type,
            url: result.media.url
          });
          
          return {
            success: true,
            jobId: runId,
            runId: runId,
            status: 'completed',
            imageUrl: result.media.type === 'video' ? undefined : result.media.url,
            error: undefined,
            type: mode
          };
        }

        // Unexpected response format
        console.warn(`⚠️ [Mobile Generation] Unexpected response format:`, result);
        return {
          success: false,
          status: 'failed',
          error: 'Unexpected response format from server',
          type: mode
        };

      } catch (endpointError) {
        console.warn(`⚠️ [Mobile Generation] getMediaByRunId endpoint failed, falling back to getUserMedia:`, endpointError);
        
        // Fallback to the old getUserMedia method
        return await this.checkStatusFallback(runId, mode);
      }

    } catch (error) {
      console.error('❌ [Mobile Generation] Status check failed:', error);

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        type: mode
      };
    }
  }

  /**
   * Fallback status check using getUserMedia (old method)
   */
  private async checkStatusFallback(runId: string, mode: GenerationMode): Promise<GenerationResult> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      // Get user ID from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      
      if (!userId) {
        console.error('❌ [Mobile Generation] No user ID available for polling')
        throw new Error('User not authenticated')
      }
      
      // Use getUserMedia as fallback
      const response = await fetch(config.apiUrl(`getUserMedia?userId=${userId}&limit=50`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Look for media with exact runId match - check all possible field names
      const matchingMedia = result.items?.find((item: any) => {
        return (
          item.runId === runId || 
          item.run_id === runId || 
          item.stability_job_id === runId ||
          item.falJobId === runId ||
          item.stabilityJobId === runId
        );
      });

      if (matchingMedia) {
        console.log(`✅ [Mobile Generation] Found media with exact runId match (fallback):`, {
          id: matchingMedia.id,
          runId: matchingMedia.runId,
          url: matchingMedia.finalUrl || matchingMedia.imageUrl
        });
        
        return {
          success: true,
          jobId: runId,
          runId: runId,
          status: 'completed',
          imageUrl: matchingMedia.finalUrl || matchingMedia.imageUrl || matchingMedia.image_url,
          error: undefined,
          type: mode
        };
      }

      // No matching media found, still processing
      console.log(`⏳ [Mobile Generation] No matching media found, still processing... (runId: ${runId})`);
      return {
        success: true,
        jobId: runId,
        runId: runId,
        status: 'processing',
        error: undefined,
        type: mode
      };

    } catch (error) {
      console.error('❌ [Mobile Generation] Fallback status check failed:', error);

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        type: mode
      };
    }
  }

  /**
   * Build payload for unified generation endpoint
   * Based on website's SimpleGenerationService.buildPayload()
   */
  private async buildPayload(request: GenerationRequest, cloudinaryUrl: string): Promise<any> {
    // Convert mode names to match unified function expectations
    const modeMap: Record<GenerationMode, string> = {
      'presets': 'presets',
      'custom-prompt': 'custom',
      'emotion-mask': 'emotion_mask',
      'ghibli-reaction': 'ghibli_reaction',
      'neo-glitch': 'neo_glitch',
      'edit-photo': 'edit'
    };

    // Get user ID from token
    const getUserFromToken = async (): Promise<string> => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) throw new Error('No auth token found');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch (error) {
        console.error('Failed to get user from token:', error);
        throw new Error('User not authenticated');
      }
    };

    const runId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get the base prompt
    const originalPrompt = this.getPromptForMode(request);
    
    // Apply prompt enhancement (same as website)
    console.log('🔍 [Mobile Generation] Applying prompt enhancement to:', originalPrompt.substring(0, 100) + '...');
    
    // Detect gender, animals, and groups from the prompt
    const detectedGender = detectGenderFromPrompt(originalPrompt);
    const detectedAnimals = detectAnimalsFromPrompt(originalPrompt);
    const detectedGroups = detectGroupsFromPrompt(originalPrompt);
    
    console.log('🔍 [Mobile Generation] Detected:', {
      gender: detectedGender,
      animals: detectedAnimals,
      groups: detectedGroups
    });

    // Apply enhanced prompt engineering
    const { enhancedPrompt, negativePrompt } = enhancePromptForSpecificity(originalPrompt, {
      preserveGender: true,
      preserveAnimals: true,
      preserveGroups: true,
      originalGender: detectedGender,
      originalAnimals: detectedAnimals,
      originalGroups: detectedGroups,
      context: request.mode
    });

    // Apply advanced prompt enhancements
    const ultraEnhancedPrompt = applyAdvancedPromptEnhancements(enhancedPrompt);
    
    console.log('✨ [Mobile Generation] Original:', originalPrompt.substring(0, 100) + '...');
    console.log('✨ [Mobile Generation] Enhanced:', ultraEnhancedPrompt.substring(0, 100) + '...');
    if (negativePrompt) {
      console.log('✨ [Mobile Generation] Negative:', negativePrompt.substring(0, 100) + '...');
    }

    // Get user ID synchronously
    const userId = await getUserFromToken();

    const basePayload = {
      mode: modeMap[request.mode],
      prompt: ultraEnhancedPrompt,
      negative_prompt: negativePrompt,
      sourceAssetId: cloudinaryUrl,
      userId: userId,
      runId: runId,
      meta: {},
      // IPA parameters (matching website defaults)
      ipaThreshold: 0.7, // 70% similarity required (same as website)
      ipaRetries: 3, // 3 retry attempts (same as website)
      ipaBlocking: true // Block if IPA fails (same as website)
    };

    // Add mode-specific parameters
    switch (request.mode) {
      case 'presets':
        return {
          ...basePayload,
          presetKey: request.presetId
        };

      case 'custom-prompt':
        return basePayload;

      case 'emotion-mask':
        return {
          ...basePayload,
          emotionMaskPresetId: request.presetId
        };

      case 'ghibli-reaction':
        return {
          ...basePayload,
          ghibliReactionPresetId: request.presetId
        };

      case 'neo-glitch':
        return {
          ...basePayload,
          neoGlitchPresetId: request.presetId
        };

      case 'edit-photo':
        return {
          ...basePayload,
          editPrompt: request.customPrompt
        };

      default:
        return basePayload;
    }
  }

  /**
   * Get prompt for the generation mode
   */
  private getPromptForMode(request: GenerationRequest): string {
    // Handle undefined mode
    if (!request.mode) {
      console.warn('⚠️ [Mobile Generation] Mode is undefined, defaulting to presets');
      return 'Transform the image with artistic enhancement';
    }

    // For custom-prompt and edit-photo modes, always use the custom prompt
    if (request.mode === 'custom-prompt' || request.mode === 'edit-photo') {
      if (request.customPrompt) {
        return request.customPrompt;
      }
      console.warn('⚠️ [Mobile Generation] No custom prompt provided for', request.mode);
      return 'Transform the image with artistic enhancement';
    }

    // For presets mode, the backend will handle the preset lookup
    if (request.mode === 'presets') {
      if (request.presetId) {
        // The backend will resolve the preset ID to the actual prompt
        // We just pass a placeholder here
        return 'Using preset from database';
      }
      console.warn('⚠️ [Mobile Generation] No preset ID provided for presets mode');
      return 'Transform the image with artistic enhancement';
    }

    // For emotion-mask, ghibli-reaction, and neo-glitch modes, use EXACT prompts from website
    const presetMaps: Record<string, Record<string, string>> = {
      'neo-glitch': {
        'neo_tokyo_base': 'Cyberpunk portrait with Neo Tokyo aesthetics. Face retains core features with glitch distortion and color shifts. Cel-shaded anime style with holographic elements, glitch effects, and neon shimmer. Background: vertical city lights, violet haze, soft scanlines. Colors: electric pink, cyan, sapphire blue, ultraviolet, black. Inspired by Akira and Ghost in the Shell.',
        'neo_tokyo_visor': 'Cyberpunk portrait with a glowing glitch visor covering the eyes. Face retains core features with glitch distortion and color shifts. Add flickering holographic overlays, visor reflections, and neon lighting. Background: animated signs, deep contrast, vertical noise. Colors: vivid magenta visor, cyan-blue reflections, violet haze, black backdrop.',
        'neo_tokyo_tattoos': 'Transform the human face into a cyberpunk glitch aesthetic with vivid neon tattoos and holographic overlays. Retain the subject\'s facial features, gender, and ethnicity. Apply stylized glowing tattoos on the cheeks, jawline, or neck. Add glitch patterns, chromatic distortion, and soft RGB splits. Use cinematic backlighting with a futuristic, dreamlike tone. The skin should retain texture, but colors can be surreal. Preserve facial integrity — no face swap or anime overlay.',
        'neo_tokyo_scanlines': 'Cyberpunk portrait with CRT scanline effects. Face retains core features with glitch distortion and color shifts. Overlay intense CRT scanlines and VHS noise. Simulate broken holographic monitor interface. Use high-contrast neon hues with cel-shaded highlights and neon reflections. Background: corrupted cityscape through broken CRT monitor. Colors: vivid pink, cyan, ultraviolet, blue, black.'
      },
      'ghibli-reaction': {
        'ghibli_tears': 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Add delicate tears and a trembling expression. Add delicate tears under the eyes, a trembling mouth, and a soft pink blush. Keep the face fully intact with original skin tone, gender, and identity. Use soft, cinematic lighting and warm pastel tones like a Ghibli film.',
        'ghibli_shock': 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Widen the eyes and part the lips slightly to show surprise. Slightly widen the eyes, part the lips, and show light tension in the expression. Maintain identity, ethnicity, and facial realism. Add soft sparkles and cinematic warmth — like a frame from a Studio Ghibli film.',
        'ghibli_sparkle': 'Transform the human face into a magical Ghibli-style sparkle reaction while preserving full identity, ethnicity, skin tone, and facial structure. Add medium sparkles around the cheeks only, shimmering golden highlights in the eyes, and soft pink blush on the cheeks. Keep sparkles focused on the cheek area to complement the blush without overwhelming it. Use pastel cinematic tones with gentle sparkle effects and dreamy lighting. Background should have gentle bokeh with soft light flares. Maintain original composition and realism with subtle magical sparkle effects on cheeks.',
        'ghibli_sadness': 'Transform the human face into a realistic Ghibli-style reaction with soft lighting, identity preservation, and subtle emotional exaggeration. Use pastel cinematic tones like a Studio Ghibli frame. Add melancholic emotion with glossy eyes and distant gaze. Emphasize melancholic emotion through glossy, teary eyes, a distant gaze, and softened facial features. Slight tear trails may appear but no crying mouth. Preserve full identity, ethnicity, skin, and structure. Lighting should be dim, cinematic, and pastel-toned like a Ghibli evening scene.',
        'ghibli_love': 'Transform the human face into a romantic Ghibli-style love reaction while preserving full identity, ethnicity, skin tone, and facial structure. Add soft pink blush on the cheeks, warm sparkle in the eyes, and a gentle, shy smile. Include subtle floating hearts or sparkles around the face to enhance emotional expression. Use pastel cinematic tones and soft golden lighting to create a dreamy, cozy atmosphere. Background should have gentle bokeh with subtle Ghibli-style light flares. Maintain original composition and realism with only slight anime influence.'
      },
      'emotion-mask': {
        'emotion_mask_nostalgia_distance': 'Portrait reflecting longing and emotional distance. Subject gazing away as if lost in memory, with a soft, contemplative expression. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.',
        'emotion_mask_joy_sadness': 'Portrait capturing bittersweet emotions, smiling through tears, hopeful eyes with a melancholic undertone. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.',
        'emotion_mask_conf_loneliness': 'Powerful pose with solitary atmosphere. Strong gaze, isolated composition, contrast between inner resilience and quiet sadness. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.',
        'emotion_mask_peace_fear': 'Emotive portrait with calm expression under tense atmosphere. Soft smile with flickers of anxiety in the eyes, dual-toned lighting (cool and warm). Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.',
        'emotion_mask_strength_vuln': 'A cinematic portrait showing inner strength with a subtle vulnerability. Intense eyes, guarded posture, but soft facial micro-expressions. Retain the subject\'s gender expression, ethnicity, facial structure, and skin texture exactly as in the original image. Emotion should be conveyed through facial micro-expressions, especially the eyes and mouth. Scene should feel grounded in real-world lighting and atmosphere, not stylized or fantasy.'
      }
    };

    const modePresets = presetMaps[request.mode];
    if (modePresets && request.presetId && modePresets[request.presetId]) {
      return modePresets[request.presetId];
    }

    console.warn('⚠️ [Mobile Generation] Unknown preset:', { mode: request.mode, presetId: request.presetId });
    return 'Transform the image with artistic enhancement';
  }

  /**
   * Upload image to Cloudinary
   */
  private async uploadImageToCloudinary(imageUri: string): Promise<string> {
    try {
      console.log('🖼️ [Mobile Generation] Compressing and uploading image:', imageUri);
      
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
      
      console.log('✅ [Mobile Generation] Image compressed successfully');
      
      // Get Cloudinary signature
      const signatureData = await cloudinaryService.getSignature({
        folder: 'stefna/sources'
      });
      
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        compressedImage.uri,
        signatureData
      );
      
      console.log('☁️ [Mobile Generation] Image uploaded to Cloudinary:', uploadResult.secure_url);
      return uploadResult.secure_url;
    } catch (error) {
      console.error('❌ [Mobile Generation] Upload failed, trying original:', error);
      
      // Fallback: try uploading original image
      try {
        const signatureData = await cloudinaryService.getSignature({
          folder: 'stefna/sources'
        });
        
        const uploadResult = await cloudinaryService.uploadImage(
          imageUri,
          signatureData
        );
        
        console.log('☁️ [Mobile Generation] Original image uploaded to Cloudinary:', uploadResult.secure_url);
        return uploadResult.secure_url;
      } catch (fallbackError) {
        console.error('❌ [Mobile Generation] Fallback upload also failed:', fallbackError);
        throw new Error('Failed to upload image to Cloudinary');
      }
    }
  }

  /**
   * Network detection
   */
  private async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }

  /**
   * Offline queue management
   */
  private async queueOfflineGeneration(request: GenerationRequest) {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_generation_queue');
      const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
      
      queue.push({
        ...request,
        timestamp: Date.now(),
        status: 'queued'
      });
      
      await AsyncStorage.setItem('offline_generation_queue', JSON.stringify(queue));
      console.log('📱 [Mobile Generation] Queued offline generation:', request.mode);
    } catch (error) {
      console.error('❌ [Mobile Generation] Failed to queue offline generation:', error);
    }
  }
}

export default GenerationService.getInstance();
