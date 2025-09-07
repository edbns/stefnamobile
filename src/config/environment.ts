// Environment configuration for StefnaMobile
// This keeps API endpoints and configuration centralized

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8888/.netlify/functions',
    // Add your local development Netlify Functions URL here
  },
  production: {
    API_BASE_URL: 'https://stefna.xyz/.netlify/functions',
    // Production Netlify site URL
  },
};

// Determine current environment
const isDevelopment = __DEV__; // React Native __DEV__ flag
const currentEnv = isDevelopment ? ENV.development : ENV.production;

export const config = {
  API_BASE_URL: currentEnv.API_BASE_URL,

  // App configuration
  APP_NAME: 'StefnaMobile',
  APP_VERSION: '1.0.0',

  // Feature flags
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: false, // TODO: Implement later

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
