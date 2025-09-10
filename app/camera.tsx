import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';

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

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required', 
          'Please allow camera access to take photos.',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Try Upload Instead', onPress: () => router.replace('/main') }
          ]
        );
        return;
      }

      // Launch camera directly - preserve original orientation
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        cameraType: ImagePicker.CameraType.back,
        exif: true, // Preserve EXIF data including orientation
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset?.uri) {
          // Normalize orientation to avoid mirrored/rotated images on some devices
          const normalizedUri = await normalizeCapturedImage(asset.uri, (asset as any).exif);
          console.log('✅ Photo captured, normalized and going to generate:', normalizedUri);
          // Navigate directly to generate - no double confirmation
          router.replace({
            pathname: '/generate',
            params: { selectedImage: normalizedUri }
          });
          return;
        }
      }
      
      // User cancelled - go back to main
      console.log('📱 User cancelled camera');
      router.back();

    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert(
        'Camera Error', 
        'Unable to access camera. Please try the upload option instead.',
        [
          { text: 'OK', onPress: () => router.back() },
          { text: 'Try Upload', onPress: () => router.replace('/main') }
        ]
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

// Normalize image orientation by rasterizing with no flips and preserving EXIF
async function normalizeCapturedImage(uri: string, exif?: any): Promise<string> {
  try {
    // Draw the image onto a new bitmap to strip mirror/rotation
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        // No explicit rotate/flip; manipulateAsync re-encodes the bitmap
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (e) {
    return uri;
  }
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