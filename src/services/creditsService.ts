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
    // Mobile can reserve credits - this is a shared feature
    const payload = {
      cost: request.cost,
      action: request.action,
      request_id: request.request_id,
    };

    console.log('🔄 [CreditsService] Reserving credits:', {
      cost: request.cost,
      action: request.action,
      url: config.apiUrl('credits-reserve')
    });

    try {
      const response = await fetch(config.apiUrl('credits-reserve'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Add timeout and retry logic
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [CreditsService] Reserve failed:', {
          status: response.status,
          error: data.error || data.message
        });
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

      console.log('✅ [CreditsService] Credits reserved successfully:', {
        request_id: data.request_id,
        balance: data.balance
      });

      return {
        ok: true,
        request_id: data.request_id,
        balance: data.balance,
        cost: data.cost,
        action: data.action,
      };
    } catch (error) {
      console.error('❌ [CreditsService] Network error:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            ok: false,
            request_id: request.request_id || '',
            balance: 0,
            cost: request.cost,
            action: request.action,
            error: 'Request timeout - please check your internet connection',
          };
        } else if (error.message.includes('Network request failed')) {
          return {
            ok: false,
            request_id: request.request_id || '',
            balance: 0,
            cost: request.cost,
            action: request.action,
            error: 'Network error - please check your internet connection',
          };
        }
      }
      
      return {
        ok: false,
        request_id: request.request_id || '',
        balance: 0,
        cost: request.cost,
        action: request.action,
        error: error instanceof Error ? error.message : 'Unknown network error',
      };
    }
  },

  // Finalize credits after generation
  async finalizeCredits(
    token: string,
    request: CreditFinalizationRequest
  ): Promise<CreditFinalizationResponse> {
    // Mobile can finalize credits - this is a shared feature
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
