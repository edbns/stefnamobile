// Referral-related type definitions

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
