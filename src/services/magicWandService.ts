// src/services/magicWandService.ts
// Centralized Magic Wand Service for Mobile App
// Eliminates duplicate magic wand logic across Custom and Studio modes

import { config } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MagicWandRequest {
  prompt: string;
  enhanceNegativePrompt?: boolean;
}

export interface MagicWandResponse {
  success: boolean;
  originalPrompt: string;
  enhancedPrompt: string;
  enhancedNegativePrompt?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class MagicWandService {
  static async enhancePrompt(prompt: string, enhanceNegativePrompt: boolean = false): Promise<MagicWandResponse> {
    try {
      console.log('🔮 [Magic Wand] Enhancing prompt:', prompt.substring(0, 50) + '...');
      
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(config.apiUrl('magic-wand'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          enhanceNegativePrompt
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Magic Wand failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔮 [Magic Wand] Enhanced result:', {
        success: result.success,
        confidence: result.confidence,
        originalLength: result.originalPrompt?.length,
        enhancedLength: result.enhancedPrompt?.length
      });
      
      return result;
    } catch (error) {
      console.error('🔮 [Magic Wand] Error:', error);
      throw error;
    }
  }

  // Helper function to determine if a prompt needs enhancement
  static needsEnhancement(prompt: string): boolean {
    const trimmedPrompt = prompt.trim();
    
    // Check length
    if (trimmedPrompt.length < 15) return true;
    
    // Check for vague terms
    const vagueTerms = [
      'style', 'look', 'vibe', 'feel', 'mood', 'aesthetic',
      'ghibli', 'anime', 'cyberpunk', 'vintage', 'retro',
      'sad', 'happy', 'angry', 'scared', 'surprised',
      'eyes', 'face', 'portrait', 'photo', 'picture'
    ];
    
    const words = trimmedPrompt.toLowerCase().split(/\s+/);
    const hasVagueTerms = vagueTerms.some(term => 
      words.some(word => word.includes(term))
    );
    
    // Check for lack of descriptive words
    const descriptiveWords = words.filter(word => 
      word.length > 3 && !['the', 'and', 'with', 'for', 'this', 'that'].includes(word)
    );
    
    return hasVagueTerms || descriptiveWords.length < 2;
  }
}

export default MagicWandService;
