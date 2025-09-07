// Mobile generation service - integrates with existing Netlify Functions
// This mirrors the website's generation system

import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

export interface GenerationRequest {
  imageUri: string;
  mode: 'presets' | 'custom' | 'edit';
  presetId?: string;
  customPrompt?: string;
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

      const payload = {
        image: base64Image,
        mode: request.mode,
        presetId: request.presetId,
        customPrompt: request.customPrompt,
        userId: request.userId,
      };

      const response = await fetch(`${config.API_BASE_URL}/generate`, {
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
}
