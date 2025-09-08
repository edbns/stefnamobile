// Credits Service - Pure HTTP wrapper for credit management API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

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

// Pure HTTP functions - no state, no business logic, just API calls
export const creditsService = {
  // Reserve credits before generation
  async reserveCredits(
    token: string,
    request: CreditReservationRequest
  ): Promise<CreditReservationResponse> {
    const payload = {
      cost: request.cost,
      action: request.action,
      request_id: request.request_id,
    };

    const response = await fetch(config.apiUrl('credits-reserve'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        request_id: request.request_id || '',
        balance: 0,
        cost: request.cost,
        action: request.action,
        error: data.error || data.message || 'Failed to reserve credits',
        message: data.message,
        currentBalance: data.currentBalance,
        requiredCredits: data.requiredCredits,
      };
    }

    return {
      ok: true,
      request_id: data.request_id,
      balance: data.balance,
      cost: data.cost,
      action: data.action,
    };
  },

  // Finalize credits after generation
  async finalizeCredits(
    token: string,
    request: CreditFinalizationRequest
  ): Promise<CreditFinalizationResponse> {
    const payload = {
      request_id: request.request_id,
      disposition: request.disposition,
    };

    const response = await fetch(config.apiUrl('credits-finalize'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        disposition: request.disposition,
        error: data.error || data.message || 'Failed to finalize credits',
      };
    }

    return {
      ok: true,
      disposition: data.disposition,
      deductAmount: data.deductAmount,
      newCredits: data.newCredits,
      message: data.message,
    };
  },
};

// Utility functions - can be moved to a separate utils file if needed
export const creditsUtils = {
  generateRequestId(): string {
    return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};
