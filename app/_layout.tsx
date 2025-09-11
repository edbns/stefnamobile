import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';

// Conditional import for gesture handler (web fallback)
let GestureHandlerRootView: any;
try {
  const gestureHandler = require('react-native-gesture-handler');
  GestureHandlerRootView = gestureHandler.GestureHandlerRootView;
} catch (error) {
  console.warn('Gesture handler not available, using fallback');
  GestureHandlerRootView = ({ children }: any) => children;
}

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
    
    // Let Expo handle updates automatically via app.config.ts
    // No manual update checking needed since we have:
    // - checkAutomatically: 'ON_LOAD' in app.config.ts
    // - Proper runtime version matching
    console.log('🚀 App initialized - Expo will handle updates automatically');
    
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
