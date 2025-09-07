// Error Store - Centralized Error Handling
// Manages toastable messages, retryable errors, and loggable issues

import { create } from 'zustand';
import { AppError, ErrorType, ErrorSeverity } from '../types/error';

interface ErrorState {
  // Current active error (for toast/modal display)
  currentError: AppError | null;

  // Error history for debugging/logging
  errorHistory: AppError[];

  // Loading state for retry operations
  isRetrying: boolean;

  // Actions
  setError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  clearError: () => void;
  retryError: () => Promise<void>;
  dismissError: () => void;
  logError: (error: AppError) => void;
  clearHistory: () => void;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  currentError: null,
  errorHistory: [],
  isRetrying: false,

  setError: (errorData) => {
    const error: AppError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...errorData,
    };

    // Log the error
    console.error(`[${error.type.toUpperCase()}] ${error.message}`, {
      id: error.id,
      severity: error.severity,
      details: error.details,
      context: error.context,
    });

    // Add to history
    const { errorHistory } = get();
    const newHistory = [error, ...errorHistory].slice(0, 100); // Keep last 100 errors

    set({
      currentError: error,
      errorHistory: newHistory,
    });
  },

  clearError: () => {
    set({ currentError: null });
  },

  retryError: async () => {
    const { currentError } = get();

    if (!currentError?.canRetry || !currentError?.retryAction) {
      console.warn('Cannot retry: no retry action available');
      return;
    }

    try {
      set({ isRetrying: true });
      await currentError.retryAction();
      // If retry succeeds, clear the error
      set({ currentError: null, isRetrying: false });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      set({ isRetrying: false });
      // Keep the original error but update it to reflect retry failure
      const updatedError = {
        ...currentError,
        message: `${currentError.message} (Retry failed)`,
        details: { ...currentError.details, retryError },
      };
      set({ currentError: updatedError });
    }
  },

  dismissError: () => {
    const { currentError } = get();
    if (currentError) {
      set({ currentError: null });
    }
  },

  logError: (error) => {
    const { errorHistory } = get();
    const newHistory = [error, ...errorHistory].slice(0, 100);
    set({ errorHistory: newHistory });
  },

  clearHistory: () => {
    set({ errorHistory: [] });
  },
}));

// Convenience functions for common error types
export const errorHelpers = {
  auth: (message: string, details?: any) => ({
    type: 'auth' as ErrorType,
    severity: 'high' as ErrorSeverity,
    message,
    details,
    userMessage: 'Authentication failed. Please try again.',
  }),

  generation: (message: string, details?: any, retryAction?: () => Promise<void>) => ({
    type: 'generation' as ErrorType,
    severity: 'medium' as ErrorSeverity,
    message,
    details,
    userMessage: 'Generation failed. Please try again.',
    canRetry: !!retryAction,
    retryAction,
  }),

  credits: (message: string, details?: any) => ({
    type: 'credits' as ErrorType,
    severity: 'medium' as ErrorSeverity,
    message,
    details,
    userMessage: 'Credit operation failed.',
  }),

  network: (message: string, details?: any, retryAction?: () => Promise<void>) => ({
    type: 'network' as ErrorType,
    severity: 'medium' as ErrorSeverity,
    message,
    details,
    userMessage: 'Connection failed. Check your internet and try again.',
    canRetry: !!retryAction,
    retryAction,
  }),

  media: (message: string, details?: any) => ({
    type: 'media' as ErrorType,
    severity: 'medium' as ErrorSeverity,
    message,
    details,
    userMessage: 'Media operation failed.',
  }),

  validation: (message: string, details?: any) => ({
    type: 'validation' as ErrorType,
    severity: 'low' as ErrorSeverity,
    message,
    details,
    userMessage: message, // Validation messages are usually user-friendly
  }),
};
