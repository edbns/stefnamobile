import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../src/stores/authStore';
import SplashScreen from './splash';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
    
    console.log('🚀 App initialized - Expo will handle updates automatically');
    
    // Hide splash screen after auth initialization completes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Increased to 2 seconds for smoother transition
    
    return () => clearTimeout(timer);
  }, [initialize]);

  // Global auth guard: redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (isLoading) return;
    const publicRoutes = ['/index', '/', '/welcome', '/auth', '/verify'];
    const isPublic = publicRoutes.includes(pathname || '/');
    if (!isAuthenticated && !isPublic) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show splash screen during initialization
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#000000',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Stefna',
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="verify"
          options={{
            title: 'Verify',
          }}
        />
        <Stack.Screen
          name="main"
          options={{
            title: 'Generate',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="community-guidelines"
          options={{
            title: 'Community Guidelines',
          }}
        />
        <Stack.Screen
          name="help-center"
          options={{
            title: 'Help Center',
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            title: 'Terms of Service',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
