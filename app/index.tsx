import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
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
