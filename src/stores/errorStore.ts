// Mobile Error Store - Simplified version
// Basic error handling without over-engineering

import { create } from 'zustand';

interface ErrorState {
  currentError: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  currentError: null,
  
  setError: (error: string | null) => set({ currentError: error }),
  clearError: () => set({ currentError: null })
}));

// Simple error helpers
export const errorHelpers = {
  generation: (message: string, context?: any, retryAction?: () => Promise<void>) => ({
    message,
    context,
    retryAction
  })
};
