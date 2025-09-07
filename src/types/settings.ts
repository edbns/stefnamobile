// Settings-related type definitions

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
