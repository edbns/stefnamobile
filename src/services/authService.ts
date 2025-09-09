// Mobile auth service - integrates with existing Netlify Functions
// This mirrors the website's authentication system

import { config } from '../config/environment';

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

export class AuthService {
  static async requestOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(config.apiUrl('request-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send OTP'
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Request OTP error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await fetch(config.apiUrl('verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Invalid OTP'
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  static async refreshUser(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(config.apiUrl('whoami'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to refresh user data'
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Refresh user error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

}
