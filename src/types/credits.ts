// Credits-related type definitions

export interface CreditReservationRequest {
  cost: number;
  action: string;
  request_id?: string;
}

export interface CreditReservationResponse {
  ok: boolean;
  request_id: string;
  balance: number;
  cost: number;
  action: string;
  error?: string;
  message?: string;
  currentBalance?: number;
  requiredCredits?: number;
}

export interface CreditFinalizationRequest {
  request_id: string;
  disposition: 'commit' | 'refund';
}

export interface CreditFinalizationResponse {
  ok: boolean;
  disposition: 'commit' | 'refund';
  deductAmount?: number;
  newCredits?: number;
  message?: string;
  error?: string;
}

export interface CreditTransaction {
  id: string;
  action: string;
  cost: number;
  status: 'reserved' | 'committed' | 'refunded' | 'failed';
  createdAt: Date;
}

export interface CreditsState {
  // Current balance
  balance: number;
  dailyCap: number;

  // Transaction tracking
  currentTransaction: CreditTransaction | null;
  transactionHistory: CreditTransaction[];

  // Loading states
  isReserving: boolean;
  isFinalizing: boolean;
  isLoading: boolean;

  // Error handling
  error: string | null;
}
