// Error Messages - Centralized error handling
// Based on main Stefna website errorMessages.ts structure

export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    INVALID_TOKEN: 'Invalid or expired token. Please sign in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  },

  // Generation Errors
  GENERATION: {
    INSUFFICIENT_CREDITS: 'Insufficient credits. Please add more credits to continue.',
    GENERATION_FAILED: 'Generation failed. Please try again.',
    INVALID_MODE: 'Invalid generation mode selected.',
    MISSING_PROMPT: 'Prompt is required for this generation mode.',
    UPLOAD_FAILED: 'Failed to upload image. Please try again.',
    PROCESSING_FAILED: 'Failed to process your request. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT: 'Request timed out. Please try again.',
    INVALID_IMAGE: 'Invalid image format. Please upload a valid image.',
    IMAGE_TOO_LARGE: 'Image is too large. Please upload a smaller image.',
    QUOTA_EXCEEDED: 'Daily quota exceeded. Please try again tomorrow.',
  },

  // Media Errors
  MEDIA: {
    SAVE_FAILED: 'Failed to save media to your device.',
    DELETE_FAILED: 'Failed to delete media.',
    SHARE_FAILED: 'Failed to share media.',
    DOWNLOAD_FAILED: 'Failed to download media.',
    LOAD_FAILED: 'Failed to load media.',
    SYNC_FAILED: 'Failed to sync media with server.',
  },

  // Network Errors
  NETWORK: {
    NO_CONNECTION: 'No internet connection. Please check your network.',
    CONNECTION_TIMEOUT: 'Connection timed out. Please try again.',
    SERVER_UNAVAILABLE: 'Server is temporarily unavailable. Please try again later.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  },

  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_FORMAT: 'Invalid format. Please check your input.',
    TOO_SHORT: 'Input is too short.',
    TOO_LONG: 'Input is too long.',
  },

  // General Errors
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    OPERATION_FAILED: 'Operation failed. Please try again.',
    PERMISSION_DENIED: 'Permission denied.',
    NOT_FOUND: 'Requested resource not found.',
    FORBIDDEN: 'Access forbidden.',
  }
} as const;

// Helper function to get error message
export function getErrorMessage(errorKey: string, fallback?: string): string {
  const keys = errorKey.split('.');
  let current: any = ERROR_MESSAGES;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback || ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
    }
  }
  
  return typeof current === 'string' ? current : fallback || ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
}

// Specific error message helpers
export const ErrorMessages = {
  // Generation specific
  insufficientCredits: () => ERROR_MESSAGES.GENERATION.INSUFFICIENT_CREDITS,
  generationFailed: (error?: string) => error || ERROR_MESSAGES.GENERATION.GENERATION_FAILED,
  networkError: () => ERROR_MESSAGES.GENERATION.NETWORK_ERROR,
  serverError: () => ERROR_MESSAGES.GENERATION.SERVER_ERROR,
  
  // Media specific
  saveFailed: () => ERROR_MESSAGES.MEDIA.SAVE_FAILED,
  deleteFailed: () => ERROR_MESSAGES.MEDIA.DELETE_FAILED,
  shareFailed: () => ERROR_MESSAGES.MEDIA.SHARE_FAILED,
  downloadFailed: () => ERROR_MESSAGES.MEDIA.DOWNLOAD_FAILED,
  
  // Auth specific
  unauthorized: () => ERROR_MESSAGES.AUTH.UNAUTHORIZED,
  tokenExpired: () => ERROR_MESSAGES.AUTH.TOKEN_EXPIRED,
  
  // General
  unknownError: (error?: string) => error || ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
} as const;
