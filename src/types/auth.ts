// Authentication-related type definitions

import type { User } from './user';

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    credits: number;
  };
  token?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (token: string, user: User) => Promise<void>;
  login: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  clearError: () => void;
}
