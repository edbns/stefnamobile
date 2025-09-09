import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CameraScreen() {
  const router = useRouter();
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-launch camera when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      takePicture();
    }, 300);

    return () => clearTimeout(timer);
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

      // Launch camera directly - no preview needed
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        cameraType: ImagePicker.CameraType.back, // Force back camera to avoid flip
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset?.uri) {
          console.log('✅ Photo captured, going directly to generate:', asset.uri);
          // Navigate directly to generate - no double confirmation
          router.replace({
            pathname: '/generate',
            params: { selectedImage: asset.uri }
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

  // Simple loading screen
  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <Feather name="camera" size={48} color="#ffffff" />
        <Text style={styles.loadingText}>Opening Camera...</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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