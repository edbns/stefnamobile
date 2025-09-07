// Referral Service - Pure HTTP wrapper for referral-related API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

export interface ProcessReferralRequest {
  referrerEmail: string;
  newUserId: string;
  newUserEmail: string;
}

export interface ProcessReferralResponse {
  ok: boolean;
  message?: string;
  referrerCredits?: number;
  newUserCredits?: number;
  error?: string;
}

export interface SendReferralInviteRequest {
  to: string;
  referrerEmail: string;
}

export interface SendReferralInviteResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface ReferralStatsResponse {
  stats?: any;
  error?: string;
}

// Pure HTTP functions - no state, no business logic, just API calls
export const referralService = {
  // Process referral bonus
  async processReferral(
    token: string,
    request: ProcessReferralRequest
  ): Promise<ProcessReferralResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/process-referral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrerEmail: request.referrerEmail,
        newUserId: request.newUserId,
        newUserEmail: request.newUserEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || data.message || 'Failed to process referral',
      };
    }

    return {
      ok: true,
      message: data.message,
      referrerCredits: data.referrerCredits,
      newUserCredits: data.newUserCredits,
    };
  },

  // Send referral invite email
  async sendReferralInvite(
    token: string,
    request: SendReferralInviteRequest
  ): Promise<SendReferralInviteResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/send-referral-invite-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: request.to,
        referrerEmail: request.referrerEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || 'Failed to send referral invite',
      };
    }

    return {
      ok: true,
      message: data.message,
    };
  },

  // Get referral stats
  async getReferralStats(token: string): Promise<ReferralStatsResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/get-referral-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to fetch referral stats',
      };
    }

    return {
      stats: data,
    };
  },
};
