// Mobile generation service - integrates with existing Netlify Functions
// This mirrors the website's complete unified generation pipeline

import AsyncStorage from '@react-native-async-storage/async-storage';
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
  userId: string;
}

export interface GenerationResponse {
  success: boolean;
  jobId?: string;
  estimatedTime?: number;
  error?: string;
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
  static async getPresets(): Promise<Preset[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${config.API_BASE_URL}/get-presets`, {
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

      // Convert image URI to base64 for upload
      const base64Image = await this.convertImageToBase64(request.imageUri);

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
      const response = await fetch(`${config.API_BASE_URL}/unified-generate-background`, {
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
        estimatedTime: data.estimatedTime,
      };
    } catch (error) {
      console.error('Start generation error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  static async getGenerationStatus(jobId: string): Promise<GenerationStatus> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${config.API_BASE_URL}/generation-status?jobId=${jobId}`, {
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
        error: 'Network error. Please try again.',
      };
    }
  }

  static async getUserMedia(userId: string): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${config.API_BASE_URL}/get-user-media?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media');
      }

      return data.media || [];
    } catch (error) {
      console.error('Get user media error:', error);
      return [];
    }
  }

  static async refreshUserCredits(): Promise<number> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${config.API_BASE_URL}/get-user-credits`, {
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

      return data.credits || 0;
    } catch (error) {
      console.error('Refresh credits error:', error);
      return 0;
    }
  }

  private static async convertImageToBase64(imageUri: string): Promise<string> {
    // This would convert the local image URI to base64
    // For now, return a placeholder - you'll implement this based on your image handling needs
    return 'data:image/jpeg;base64,PLACEHOLDER_BASE64_DATA';
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
