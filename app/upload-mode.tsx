import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// This screen is now just a redirect to the unified composer
// Keeping it for backward compatibility with existing navigation
export default function UploadModeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Redirect to unified composer
    router.replace({
      pathname: '/composer',
      params: params,
    });
  }, []);

  return null;
}
