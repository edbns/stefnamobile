export type ErrorType = 'auth' | 'network' | 'generation' | 'media' | 'credits' | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context?: any;
  retryAction?: () => Promise<void>;
}

export interface ErrorState {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
}
