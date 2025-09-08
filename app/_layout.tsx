import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';

export default function Layout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    // Initialize network monitoring
    
    // Cleanup on unmount
    return () => {
    };
  }, [initialize]);

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
