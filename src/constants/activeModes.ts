// Active generation modes - only modes currently in use
// Keep this updated with what's actually available on the platform

export const ACTIVE_MODES = {
  custom: true,          // Custom text-to-image
  edit: true,            // Edit with prompt (Studio mode)
  parallel_self: true,   // Parallel Self™
  unreal_reflection: true, // Unreal Reflection™
  
  // Disabled modes (keep code but hide from UI)
  ghibli_reaction: false,
  cyber_siren: false,
  presets: false,        // Old weekly rotating presets
  story_time: false,
} as const;

export type ActiveModeName = keyof typeof ACTIVE_MODES;

// Get list of active mode names
export const getActiveModeNames = (): ActiveModeName[] => {
  return Object.entries(ACTIVE_MODES)
    .filter(([_, isActive]) => isActive)
    .map(([mode]) => mode) as ActiveModeName[];
};

// Check if a mode is active
export const isModeActive = (mode: string): boolean => {
  return ACTIVE_MODES[mode as ActiveModeName] ?? false;
};

// User-friendly labels for active modes
export const MODE_LABELS: Record<string, string> = {
  custom: 'Custom',
  edit: 'Studio',
  parallel_self: 'Parallel Self™',
  unreal_reflection: 'Unreal Reflection™',
};

// Mode descriptions
export const MODE_DESCRIPTIONS: Record<string, string> = {
  custom: 'Create from your imagination',
  edit: 'Transform your photos with AI',
  parallel_self: 'Your alternate reality',
  unreal_reflection: 'Mirror dimension version',
};

