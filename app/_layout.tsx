import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/colors';
import NotificationManager from '../src/components/NotificationManager';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
    console.log('🚀 App initialized - Expo will handle updates automatically');
    
    // Hide loading after a brief moment to let initialization complete
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 500);
    
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

  // Show simple loading during initialization (not the full splash screen)
  if (showSplash || isLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#f5f5f5" />
      <NotificationManager />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
          animation: 'slide_from_right',
          animationDuration: 200, // Faster animations
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Stefna',
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            title: 'Welcome',
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: 'Sign In',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="verify"
          options={{
            title: 'Verify',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="main"
          options={{
            title: 'Generate',
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="generation-folder"
          options={{
            title: 'Folder',
            animation: 'slide_from_right',
            animationDuration: 200, // Faster animation
          }}
        />
        <Stack.Screen
          name="media-viewer"
          options={{
            title: 'Media Viewer',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="edit"
          options={{
            title: 'Edit',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: 'Camera',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="upload-mode"
          options={{
            title: 'Upload',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="generate-custom"
          options={{
            title: 'Custom',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="generate-studio"
          options={{
            title: 'Edit',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="community-guidelines"
          options={{
            title: 'Community Guidelines',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="help-center"
          options={{
            title: 'Help Center',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            title: 'Terms of Service',
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
