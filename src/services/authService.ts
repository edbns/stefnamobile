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
      console.log('📧 [Mobile Auth] Requesting OTP for:', email);
      
      const response = await fetch(config.apiUrl('request-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StefnaMobile/1.0.3',
        },
        body: JSON.stringify({ 
          email,
          platform: 'mobile' // Explicitly specify platform
        }),
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
      console.log('🔐 [Mobile Auth] Verifying OTP:', { 
        email, 
        otpLength: otp.length,
        url: config.apiUrl('verify-otp') 
      });

      const response = await fetch(config.apiUrl('verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StefnaMobile/1.0.3', // Identify as mobile app
        },
        body: JSON.stringify({ 
          email, 
          code: otp,
          platform: 'mobile' // Explicitly specify platform
        }),
      });

      console.log('📡 [Mobile Auth] Response status:', response.status);
      console.log('📡 [Mobile Auth] Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response from verify-otp:', textResponse);
        return {
          success: false,
          error: 'Server error. Please try again.'
        };
      }

      const data = await response.json();
      console.log('📊 [Mobile Auth] Response data:', { 
        success: data.success || !!data.token,
        hasToken: !!data.token,
        hasUser: !!data.user,
        error: data.error 
      });

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
      console.error('❌ [Mobile Auth] Verify OTP error:', error);
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
