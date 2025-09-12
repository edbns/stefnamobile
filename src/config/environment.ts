// Environment configuration for StefnaMobile
// This keeps API endpoints and configuration centralized

const ENV = {
  development: {
    // Use EXPO_PUBLIC_API_URL when provided; otherwise default to production URL
    // Avoid localhost for device builds (causes Invalid URL on device)
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://stefna.xyz',
  },
  production: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://stefna.xyz',
  },
};

// Determine current environment
const isDevelopment = __DEV__; // React Native __DEV__ flag
const currentEnv = isDevelopment ? ENV.development : ENV.production;

export const config = {
  API_BASE_URL: currentEnv.API_BASE_URL,
  apiUrl: (fn: string) => `${currentEnv.API_BASE_URL}/.netlify/functions/${fn}`,
  // Mobile app can write to shared features (generations, media, credits, invites)
  // Backend will enforce platform permissions via JWT claims
  READ_ONLY: false,

  // App configuration
  APP_NAME: 'StefnaMobile',
  APP_VERSION: '1.0.0',

  // Feature flags
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true, // ✅ Implemented - Push notifications system ready

  // Generation settings
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Queue settings
  MAX_CONCURRENT_GENERATIONS: 1,
  POLL_INTERVAL: 2000, // 2 seconds
  MAX_POLL_TIME: 300000, // 5 minutes

  // Storage settings
  ENABLE_LOCAL_STORAGE: true,
  ENABLE_CLOUD_SYNC: true,
  AUTO_SAVE_TO_PHOTOS: true,

  // UI settings
  THEME: 'dark',
  ANIMATION_DURATION: 300,
};

export default config;
