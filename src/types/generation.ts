// Generation-related type definitions

import type { StoredMedia } from './media';

export interface GenerationJob {
  id: string;
  imageUri: string;
  mode: 'presets' | 'custom-prompt' | 'edit-photo' | 'unreal-reflection' | 'ghibli-reaction' | 'neo-glitch';
  presetId?: string; // Now used for all modes - maps to correct database table
  customPrompt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  estimatedTime?: number;
  storedMedia?: StoredMedia;
}

export interface GenerationStatus {
  status: string;
  progress?: number;
  resultUrl?: string;
  error?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface GenerationState {
  // Current generation
  currentJob: GenerationJob | null;
  isGenerating: boolean;

  // Queue management
  jobQueue: GenerationJob[];

  // Data
  presets: Preset[];
}

