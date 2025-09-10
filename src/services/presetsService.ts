// src/services/presetsService.ts
// Mobile app presets service - connects to database, no fallbacks
import { config } from '../config/environment';

export interface DatabasePreset {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  prompt: string;
  negativePrompt: string;
  strength: number;
  rotationIndex: number;
  week: number;
  isActive: boolean;
}

export interface PresetsResponse {
  success: boolean;
  data?: {
    presets: DatabasePreset[];
    currentWeek: number;
    totalAvailable: number;
    rotationInfo: {
      totalPresetsInSystem: number;
      weeksInCycle: number;
      presetsPerWeek: number;
    };
  };
  error?: string;
  message?: string;
}

class PresetsService {
  private static instance: PresetsService;

  private constructor() {}

  static getInstance(): PresetsService {
    if (!PresetsService.instance) {
      PresetsService.instance = new PresetsService();
    }
    return PresetsService.instance;
  }

  /**
   * Fetch available presets from database with rotation system
   * Returns currently available presets for the main presets mode
   * NO FALLBACKS - if database fails, throws user-friendly error
   */
  async getAvailablePresets(): Promise<PresetsResponse> {
    try {
      console.log('🎨 [PresetsService] Fetching available presets from database');

      // Use the same endpoint as the website
      const response = await fetch(config.apiUrl('get-presets'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // Handle different HTTP status codes with user-friendly messages
        if (response.status === 404) {
          throw new Error('Presets service is not available. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else if (response.status >= 400 && response.status < 500) {
          throw new Error('Unable to connect to presets service. Please check your connection.');
        } else {
          throw new Error('Network error occurred. Please check your internet connection.');
        }
      }

      // Try to parse JSON, handle HTML responses gracefully
      let data: PresetsResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Presets service returned invalid data. Please try again later.');
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to load presets. Please try again.');
      }

      console.log('✅ [PresetsService] Successfully fetched', data.data?.totalAvailable, 'presets');
      return data;

    } catch (error) {
      console.error('❌ [PresetsService] Failed to fetch presets:', error);
      
      // Convert technical errors to user-friendly messages
      if (error instanceof Error) {
        // If it's already a user-friendly message, keep it
        if (error.message.includes('Presets service') || 
            error.message.includes('Server error') || 
            error.message.includes('Network error') ||
            error.message.includes('Unable to connect') ||
            error.message.includes('invalid data') ||
            error.message.includes('Failed to load')) {
          throw error;
        }
        
        // Convert technical errors to user-friendly messages
        if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
          throw new Error('Presets service is temporarily unavailable. Please try again later.');
        } else if (error.message.includes('fetch')) {
          throw new Error('Unable to connect to presets service. Please check your internet connection.');
        } else if (error.message.includes('JSON')) {
          throw new Error('Presets service returned invalid data. Please try again later.');
        } else {
          throw new Error('Failed to load presets. Please try again later.');
        }
      }
      
      // Generic fallback for unknown errors
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }

  /**
   * Get current week's available presets (5 presets)
   * NO FALLBACKS - if database fails, throws user-friendly error
   */
  async getCurrentWeekPresets(): Promise<DatabasePreset[]> {
    try {
      console.log('🔍 [Presets] Getting current week presets');
      
      const response = await fetch(config.apiUrl('get-presets'), {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Presets service is not available. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else {
          throw new Error('Unable to connect to presets service. Please check your connection.');
        }
      }

      let presets: DatabasePreset[];
      try {
        presets = await response.json();
      } catch (parseError) {
        throw new Error('Presets service returned invalid data. Please try again later.');
      }

      console.log('✅ [Presets] Current week presets:', presets.length);
      return presets;
    } catch (error) {
      console.error('❌ [Presets] Get current week presets failed:', error);
      
      // Convert technical errors to user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes('Presets service') || 
            error.message.includes('Server error') || 
            error.message.includes('Unable to connect') ||
            error.message.includes('invalid data')) {
          throw error;
        }
        
        if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
          throw new Error('Presets service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error('Failed to load presets. Please try again later.');
        }
      }
      
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }

  /**
   * Get mode-specific presets from their respective database tables
   * Supports: emotion-mask, ghibli-reaction, neo-glitch
   */
  async getModeSpecificPresets(mode: string): Promise<PresetsResponse> {
    try {
      console.log(`🎨 [PresetsService] Fetching ${mode} presets from database`);

      const response = await fetch(`${config.apiUrl('get-presets')}?mode=${mode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`${mode} presets service is not available. Please try again later.`);
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else {
          throw new Error(`Unable to connect to ${mode} presets service. Please check your connection.`);
        }
      }

      let data: PresetsResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`${mode} presets service returned invalid data. Please try again later.`);
      }

      if (!data.success) {
        throw new Error(data.error || data.message || `Failed to load ${mode} presets. Please try again.`);
      }

      console.log(`✅ [PresetsService] Successfully fetched ${mode} presets`);
      return data;

    } catch (error) {
      console.error(`❌ [PresetsService] Failed to fetch ${mode} presets:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('presets service') || 
            error.message.includes('Server error') || 
            error.message.includes('Unable to connect') ||
            error.message.includes('invalid data') ||
            error.message.includes('Failed to load')) {
          throw error;
        }
        
        if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
          throw new Error(`${mode} presets service is temporarily unavailable. Please try again later.`);
        } else if (error.message.includes('fetch')) {
          throw new Error(`Unable to connect to ${mode} presets service. Please check your internet connection.`);
        } else {
          throw new Error(`Failed to load ${mode} presets. Please try again later.`);
        }
      }
      
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }

  /**
   * Get all available presets (25 total)
   * NO FALLBACKS - if database fails, throws user-friendly error
   */
  async getAllPresets(): Promise<DatabasePreset[]> {
    try {
      console.log('🔍 [Presets] Getting all presets');
      
      const response = await fetch(config.apiUrl('get-presets'), {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Presets service is not available. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else {
          throw new Error('Unable to connect to presets service. Please check your connection.');
        }
      }

      let presets: DatabasePreset[];
      try {
        presets = await response.json();
      } catch (parseError) {
        throw new Error('Presets service returned invalid data. Please try again later.');
      }

      console.log('✅ [Presets] All presets:', presets.length);
      return presets;
    } catch (error) {
      console.error('❌ [Presets] Get all presets failed:', error);
      
      // Convert technical errors to user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes('Presets service') || 
            error.message.includes('Server error') || 
            error.message.includes('Unable to connect') ||
            error.message.includes('invalid data')) {
          throw error;
        }
        
        if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
          throw new Error('Presets service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error('Failed to load presets. Please try again later.');
        }
      }
      
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
}

export default PresetsService;
