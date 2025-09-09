import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import { useAuthStore } from '../src/stores/authStore';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
    
    // Check for updates on app launch (safer approach)
    const checkForUpdates = async () => {
      try {
        // Only check for updates if we're not in development mode
        if (__DEV__) {
          console.log('🔧 Development mode - skipping update check');
          return;
        }

        console.log('🔄 Checking for updates...');
        
        // Get current update info safely
        const currentUpdate = await Updates.getCurrentUpdateAsync();
        console.log('📱 Current update info:', {
          updateId: currentUpdate?.updateId,
          channel: currentUpdate?.channel,
          runtimeVersion: currentUpdate?.runtimeVersion
        });
        
        const update = await Updates.checkForUpdateAsync();
        console.log('📡 Update check result:', {
          isAvailable: update.isAvailable,
          manifest: update.manifest ? 'Present' : 'None'
        });
        
        if (update.isAvailable) {
          console.log('📥 Update available! Fetching...');
          const fetchResult = await Updates.fetchUpdateAsync();
          console.log('📦 Fetch completed, restarting app...');
          await Updates.reloadAsync();
        } else {
          console.log('✅ App is up to date');
        }
      } catch (error) {
        console.error('❌ Update check failed:', error.message || error);
        // Don't crash the app if update check fails
      }
    };

    // Check for updates after a short delay to avoid blocking app startup
    const updateTimeout = setTimeout(checkForUpdates, 2000);
    
    return () => {
      clearTimeout(updateTimeout);
    };
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
