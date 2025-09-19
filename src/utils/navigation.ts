import { router } from 'expo-router';

/**
 * Navigate with smooth transitions
 */
export const smoothNavigate = {
  push: (pathname: string, params?: any) => {
    router.push({ pathname, params });
  },
  replace: (pathname: string, params?: any) => {
    router.replace({ pathname, params });
  },
  back: () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/main');
    }
  }
};

/**
 * Safely navigate back, falling back to main screen if no previous screen exists
 */
export const safeGoBack = (fallbackRoute: string = '/main') => {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  } catch (error) {
    console.warn('Navigation error:', error);
    router.push(fallbackRoute);
  }
};

/**
 * Navigate back with specific fallback routes for different contexts
 */
export const navigateBack = {
  toMain: () => safeGoBack('/main'),
  toEdit: () => safeGoBack('/edit'),
  toProfile: () => safeGoBack('/profile'),
  toWelcome: () => safeGoBack('/welcome'),
};
