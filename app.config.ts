import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StefnaMobile',
  slug: 'stefnamobile',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'stefnamobile',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.stefnamobile.app',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to take photos for AI generation.',
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to upload images for AI generation.',
      NSPhotoLibraryAddUsageDescription: 'This app saves generated images to your photo library.',
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000'
    },
    package: 'com.stefnamobile.app',
    edgeToEdgeEnabled: true,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_MEDIA_LOCATION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_MEDIA_LOCATION'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router'
  ],
  extra: {
    router: {},
    eas: {
      projectId: '20065ae5-0214-413d-8de7-7182c3467641'
    }
  },
  // Force the runtime version to 1.0.1
  runtimeVersion: '1.0.1',
  updates: {
    url: 'https://u.expo.dev/20065ae5-0214-413d-8de7-7182c3467641'
  }
});

