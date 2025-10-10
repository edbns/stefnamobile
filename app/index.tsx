import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../src/constants/colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen() {
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

  // Show loading screen instead of null
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
