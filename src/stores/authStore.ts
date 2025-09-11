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
      console.log('🔐 [Mobile Auth] Starting initialization...');

      const [userString, token] = await AsyncStorage.multiGet(['user_profile', 'auth_token']);
      console.log('🔐 [Mobile Auth] Storage check:', { 
        hasUser: !!userString[1], 
        hasToken: !!token[1],
        tokenLength: token[1]?.length 
      });

      if (token[1]) {
        // Check if this is a test token (bypass validation)
        if (token[1].startsWith('test-token-')) {
          console.log('🧪 [Mobile Auth] Test token detected - bypassing validation');
          if (userString[1]) {
            const user = JSON.parse(userString[1]);
            set({
              user,
              token: token[1],
              isAuthenticated: true,
              isLoading: false
            });
            console.log('✅ [Mobile Auth] Test session restored');
            return;
          }
        }
        
        // We have a token - validate it first
        try {
          console.log('🔐 [Mobile Auth] Validating existing token...');
          const isValid = await userService.whoami(token[1]);
          
          if (isValid.ok && isValid.user) {
            console.log('✅ [Mobile Auth] Token is valid');
            
            // Get full user profile data
            console.log('📋 [Mobile Auth] Fetching full user profile...');
            const profileData = await userService.fetchUserProfile(token[1]);
            
            if (profileData.ok && profileData.user) {
              console.log('✅ [Mobile Auth] Full profile fetched successfully');
              
              // Create user object from full profile data
              const user: User = {
                id: profileData.user.id,
                email: profileData.user.email,
                credits: profileData.credits.balance,
                loginTime: Date.now(),
              };
            
              // Check session age
              const loginTime = user.loginTime || Date.now();
              const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
              
              if (loginTime > thirtyDaysAgo) {
                // Save updated user and restore session
                await AsyncStorage.setItem('user_profile', JSON.stringify(user));
                set({
                  user,
                  token: token[1],
                  isAuthenticated: true,
                  isLoading: false
                });
                console.log('✅ [Mobile Auth] Session restored successfully');
                
                // Initialize credits from cache immediately, then refresh in background
                setTimeout(async () => {
                  const creditsStore = useCreditsStore.getState();
                  await creditsStore.initializeFromCache();
                  creditsStore.refreshBalance().catch(console.error);
                }, 100);
              } else {
                // Session too old
                console.log('⏰ [Mobile Auth] Session expired (>30 days)');
                await AsyncStorage.multiRemove(['user_profile', 'auth_token']);
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false
                });
              }
            } else {
              // Profile fetch failed
              console.log('❌ [Mobile Auth] Failed to fetch user profile');
              await AsyncStorage.multiRemove(['user_profile', 'auth_token']);
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
              });
            }
          } else {
            // Invalid token
            console.log('❌ [Mobile Auth] Token is invalid');
            await AsyncStorage.multiRemove(['user_profile', 'auth_token']);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (e) {
          console.error('❌ [Mobile Auth] Token validation error:', e);
          // Keep existing session if network error
          if (userString[1]) {
            const user = JSON.parse(userString[1]);
            set({
              user,
              token: token[1],
              isAuthenticated: true,
              isLoading: false
            });
            console.log('⚠️ [Mobile Auth] Keeping session due to network error');
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        }
      } else {
        // No token
        console.log('🔐 [Mobile Auth] No token found');
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
