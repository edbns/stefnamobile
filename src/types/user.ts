// User-related type definitions

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

export interface User {
  id: string;
  email: string;
  name?: string;
  credits: number;
}
