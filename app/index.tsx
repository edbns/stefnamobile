import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Hide the splash screen immediately when component mounts
    SplashScreen.hideAsync();
    
    // Don't add artificial delay - let the app load naturally
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/main');
      } else {
        router.replace('/welcome');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing - let Expo's splash screen handle the loading
  return null;
}
