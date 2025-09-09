// User Service - Pure HTTP wrapper for user-related API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  total_likes_received: number;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  balance: number;  // Lifetime credits
  daily: number;    // Daily spending limit
}

export interface UserProfileResponse {
  ok: boolean;
  user: UserProfile;
  credits: UserCredits;
  daily_cap: number;
  media: {
    count: number;
    items: any[]; // Media items array
  };
  neoGlitch?: {
    count: number;
    items: any[];
  };
}

// Pure HTTP functions - no state, no business logic, just API calls
export const userService = {
  // Fetch user profile data from API
  async fetchUserProfile(token: string): Promise<UserProfileResponse> {
    const response = await fetch(config.apiUrl('get-user-profile'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user profile');
    }

    return data;
  },

  // Update user profile via API
  async updateProfile(token: string, updates: Partial<UserProfile>): Promise<UserProfileResponse> {
    // Profile updates are shared between mobile and web
    // Backend will enforce platform permissions via JWT claims
    const response = await fetch(config.apiUrl('update-profile'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data;
  },

  // Validate user identity (whoami)
  async whoami(token: string): Promise<{ ok: boolean; user?: UserProfile }> {
    const response = await fetch(config.apiUrl('whoami'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate user identity');
    }

    return data;
  },
};
