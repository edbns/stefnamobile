// Error-related type definitions

export type ErrorType =
  | 'auth'
  | 'generation'
  | 'credits'
  | 'media'
  | 'network'
  | 'validation'
  | 'permission'
  | 'storage'
  | 'cloudinary'
  | 'referral'
  | 'settings'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: any;
  timestamp: Date;
  userMessage?: string;
  canRetry?: boolean;
  retryAction?: () => Promise<void>;
  context?: Record<string, any>;
}

export interface ErrorState {
  currentError: AppError | null;
  errorHistory: AppError[];
  isLoading: boolean;
}
