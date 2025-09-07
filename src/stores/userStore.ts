// User Store - Manages user profile, credits, and settings state
// Uses services internally for HTTP calls

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, UserProfile, UserProfileResponse } from '../services/userService';
import { settingsService, UserSettings, UserSettingsResponse } from '../services/settingsService';

interface User {
  id: string;
  email: string;
  name?: string;
  credits: number;
}

interface UserState {
  // User profile data
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // User settings
  settings: UserSettings | null;
  settingsLoading: boolean;

  // Actions
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadUserSettings: () => Promise<void>;
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  settings: null,
  settingsLoading: false,

  loadUserProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: UserProfileResponse = await userService.fetchUserProfile(token);

      if (response.ok && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.display_name,
          credits: response.credits.balance,
        };

        // Store in AsyncStorage for persistence
        await AsyncStorage.setItem('user_profile', JSON.stringify(user));

        set({ user, isLoading: false });
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Load user profile error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load user profile',
        isLoading: false
      });
    }
  },

  updateUserProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: UserProfileResponse = await userService.updateProfile(token, updates);

      if (response.ok && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.display_name,
          credits: response.credits.balance,
        };

        // Update AsyncStorage
        await AsyncStorage.setItem('user_profile', JSON.stringify(user));

        set({ user, isLoading: false });
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Update user profile error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update user profile',
        isLoading: false
      });
    }
  },

  loadUserSettings: async () => {
    try {
      set({ settingsLoading: true });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: UserSettingsResponse = await settingsService.getSettings(token);

      if (!response.error) {
        // Store settings in AsyncStorage for offline access
        await AsyncStorage.setItem('user_settings', JSON.stringify(response.settings));

        set({ settings: response.settings, settingsLoading: false });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Load user settings error:', error);
      // Load from AsyncStorage as fallback
      try {
        const cachedSettings = await AsyncStorage.getItem('user_settings');
        if (cachedSettings) {
          set({ settings: JSON.parse(cachedSettings), settingsLoading: false });
        }
      } catch (cacheError) {
        console.error('Cache load error:', cacheError);
        set({ settingsLoading: false });
      }
    }
  },

  updateUserSettings: async (updates: Partial<UserSettings>) => {
    try {
      set({ settingsLoading: true });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: UserSettingsResponse = await settingsService.updateSettings(token, updates);

      if (response.success) {
        // Update AsyncStorage
        await AsyncStorage.setItem('user_settings', JSON.stringify(response.settings));

        set({ settings: response.settings, settingsLoading: false });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Update user settings error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
        settingsLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    user: null,
    isLoading: false,
    error: null,
    settings: null,
    settingsLoading: false,
  }),
}));
