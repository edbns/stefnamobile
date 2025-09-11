import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ImagePickerService } from '../src/services/imagePickerService';

export default function CameraScreen() {
  const router = useRouter();

  // Auto-launch camera immediately when component mounts
  React.useEffect(() => {
    handleCameraCapture();
  }, []);

  const handleCameraCapture = async () => {
    try {
      console.log('📸 Opening camera - direct to generate flow');
      
      // Use unified image picker service
      const result = await ImagePickerService.captureFromCamera();

      if (result.success && result.uri) {
        try {
          // Apply proper normalization to fix orientation issues
          const normalizedUri = await ImagePickerService.normalizeImage(result.uri, result.exif);
          console.log('✅ Photo captured and normalized, going to generate:', normalizedUri);
          
          // Navigate directly to generate
          router.replace({
            pathname: '/generate',
            params: { selectedImage: normalizedUri }
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
          () => handleCameraCapture(),
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
        () => handleCameraCapture(),
        () => router.back()
      );

    } catch (error) {
      console.error('❌ Camera error:', error);
      ImagePickerService.showErrorAlert(
        'Camera Error', 
        'Unable to access camera. Please try the upload option instead.',
        () => handleCameraCapture(),
        () => router.back()
      );
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
});