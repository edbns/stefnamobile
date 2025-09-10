import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ImagePickerService } from '../src/services/imagePickerService';

export default function CameraScreen() {
  const router = useRouter();
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-launch camera immediately when component mounts
  useEffect(() => {
    takePicture();
  }, []);

  const takePicture = async () => {
    if (isCapturing) {
      console.log('Already capturing, ignoring tap');
      return;
    }

    try {
      console.log('📸 Opening camera - direct to generate flow');
      setIsCapturing(true);

      // Use unified image picker service
      const result = await ImagePickerService.captureFromCamera();

      if (result.success && result.uri) {
        try {
          // Skip normalization to prevent flipping issues
          console.log('✅ Photo captured, going to generate:', result.uri);
          // Navigate directly to generate - no normalization
          router.replace({
            pathname: '/generate',
            params: { selectedImage: result.uri }
          });
          return;
        } catch (error) {
          console.error('❌ Navigation error:', error);
          router.back();
          return;
        }
      }
      
      // Handle errors or cancellation
      if (result.error === 'Camera permission denied') {
        ImagePickerService.showErrorAlert(
          'Camera Permission Required', 
          'Please allow camera access to take photos.',
          () => takePicture(),
          () => router.back()
        );
        return;
      }
      
      if (result.error === 'Camera capture cancelled') {
        console.log('📱 User cancelled camera');
        router.back();
        return;
      }
      
      // Other errors
      ImagePickerService.showErrorAlert(
        'Camera Error', 
        'Unable to access camera. Please try the upload option instead.',
        () => takePicture(),
        () => router.back()
      );

    } catch (error) {
      console.error('❌ Camera error:', error);
      ImagePickerService.showErrorAlert(
        'Camera Error', 
        'Unable to access camera. Please try the upload option instead.',
        () => takePicture(),
        () => router.back()
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // Transparent screen - camera launches in background
  return (
    <View style={styles.container}>
      {/* Camera launches automatically, no UI needed */}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});