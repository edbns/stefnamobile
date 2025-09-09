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
    // Force immediate update check and reload
    (async () => {
      try {
        console.log('🔄 FORCE UPDATE CHECK - Starting...');
        console.log('📱 Current update info:', await Updates.getCurrentUpdateAsync());
        
        const update = await Updates.checkForUpdateAsync();
        console.log('📡 Update check result:', JSON.stringify(update, null, 2));
        
        if (update.isAvailable) {
          console.log('📥 Update available! Fetching immediately...');
          const fetchResult = await Updates.fetchUpdateAsync();
          console.log('📦 Fetch result:', JSON.stringify(fetchResult, null, 2));
          console.log('🔄 RELOADING APP NOW...');
          await Updates.reloadAsync();
        } else {
          console.log('❌ NO UPDATE AVAILABLE - This is the problem!');
          console.log('🔍 Debug info - Runtime version:', Updates.runtimeVersion);
          console.log('🔍 Debug info - Update URL:', Updates.updateUrl);
        }
      } catch (error) {
        console.error('❌ UPDATE CHECK COMPLETELY FAILED:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      }
    })();
    // Initialize network monitoring
    
    // Cleanup on unmount
    return () => {
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
