// Settings Service - Pure HTTP wrapper for user settings API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

export interface UserSettings {
  media_upload_agreed: boolean;
  share_to_feed: boolean;
}

export interface UserSettingsResponse {
  settings: UserSettings;
  success?: boolean;
  message?: string;
  error?: string;
}

// Pure HTTP functions - no state, no business logic, just API calls
export const settingsService = {
  // Get user settings
  async getSettings(token: string): Promise<UserSettingsResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/user-settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        settings: {
          media_upload_agreed: false,
          share_to_feed: false,
        },
        error: data.error || 'Failed to fetch user settings',
      };
    }

    return {
      settings: data.settings || {
        media_upload_agreed: false,
        share_to_feed: false,
      },
    };
  },

  // Update user settings
  async updateSettings(
    token: string,
    updates: Partial<UserSettings>
  ): Promise<UserSettingsResponse> {
    if (config.READ_ONLY) {
      return { settings: { media_upload_agreed: false, share_to_feed: false }, error: 'READ_ONLY_MODE' };
    }
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/user-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        settings: {
          media_upload_agreed: false,
          share_to_feed: false,
        },
        error: data.error || 'Failed to update settings',
      };
    }

    return {
      success: true,
      settings: data.settings,
      message: data.message,
    };
  },
};
