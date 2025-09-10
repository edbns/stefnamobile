// Auth Store - Simplified to handle only authentication state
// User profile and credits are now managed by userStore and creditsStore

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService';
import { userService } from '../services/userService';
import { useErrorStore, errorHelpers } from './errorStore';
import { useNotificationsStore, notificationHelpers } from './notificationsStore';
import { useCreditsStore } from './creditsStore';
import { AuthState } from '../types/auth';
import { User } from '../types/user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, otp: string): Promise<boolean> => {
    try {
      set({ isLoading: true });

      const result = await AuthService.verifyOTP(email, otp);

      if (result.success && result.user && result.token) {
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          credits: result.user.credits || 0,
          loginTime: Date.now(), // Store login time for 30-day persistence
        };

        // Store auth data
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('user_profile', JSON.stringify(user));

        set({
          user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false
        });

        // Show success notification
        useNotificationsStore.getState().addNotification(
          notificationHelpers.success(
            'Welcome back!',
            'Successfully logged in to Stefna.'
          )
        );

        return true;
      } else {
        console.error('❌ [Mobile Auth] Login failed:', result.error);
        
        // Use centralized error handling with better error messages
        const errorMessage = result.error === 'Invalid OTP' 
          ? 'Invalid code. Please check your email and try again.'
          : result.error || 'Login failed';
          
        useErrorStore.getState().setError(
          errorHelpers.auth(errorMessage)
        );
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);

      // Use centralized error handling
      useErrorStore.getState().setError(
        errorHelpers.network(
          'Login failed due to network error',
          error,
          async () => { await get().login(email, otp); } // Retry action
        )
      );

      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      // Clear all stored data
      await AsyncStorage.multiRemove(['auth_token', 'user_profile', 'user_settings']);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      // Show logout notification
      useNotificationsStore.getState().addNotification(
        notificationHelpers.info(
          'Logged out',
          'You have been successfully logged out.'
        )
      );
      // Note: navigation handled by global guard in _layout via isAuthenticated
    } catch (error) {
      console.error('Logout error:', error);

      // Use centralized error handling
      useErrorStore.getState().setError(
        errorHelpers.auth('Logout failed', error)
      );

      set({ isLoading: false });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Note: Removed development auto-login to enforce proper auth gating

      const [userString, token] = await AsyncStorage.multiGet(['user_profile', 'auth_token']);

      if (userString[1] && token[1]) {
        const user = JSON.parse(userString[1]);
        
        // Check if session is still valid (30 days)
        const loginTime = user.loginTime || Date.now();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        if (loginTime > thirtyDaysAgo) {
          // Session is still valid - keep user logged in
          console.log('🔐 [Mobile Auth] Restoring valid session');
          set({
            user,
            token: token[1],
            isAuthenticated: true,
            isLoading: false
          });
          try { await useCreditsStore.getState().refreshBalance(); } catch {}
        } else {
          // Session expired - clear storage
          console.log('⏰ [Mobile Auth] Session expired, clearing storage');
          await AsyncStorage.multiRemove(['user_profile', 'auth_token']);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else if (!userString[1] && token[1]) {
        // Token exists but user profile missing — try fetching minimal profile
        try {
          const profile = await userService.whoami(token[1]);
          if (profile.ok && profile.user) {
            const restoredUser: User = {
              id: profile.user.id,
              email: profile.user.email,
              credits: 0,
              loginTime: Date.now(),
            };
            await AsyncStorage.setItem('user_profile', JSON.stringify(restoredUser));
            set({ user: restoredUser, token: token[1], isAuthenticated: true, isLoading: false });
            // Kick off background credits/profile refresh to sync numbers
            try { await useCreditsStore.getState().refreshBalance(); } catch {}
          } else {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } catch (e) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);

      // Use centralized error handling
      useErrorStore.getState().setError(
        errorHelpers.auth('Initialization failed', error)
      );

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  validateToken: async (): Promise<boolean> => {
    try {
      const { token } = get();
      if (!token) return false;

      const whoamiResult = await userService.whoami(token);
      return whoamiResult.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
