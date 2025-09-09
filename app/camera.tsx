import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CameraScreen() {
  const router = useRouter();
  const [capturedPhoto, setCapturedPhoto] = useState<{ uri: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-launch camera picker when component mounts
  useEffect(() => {
    // Small delay to allow component to mount properly
    const timer = setTimeout(() => {
      takePicture();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const takePicture = async () => {
    if (isCapturing) {
      console.log('Already capturing, ignoring tap');
      return;
    }

    try {
      console.log('📸 Opening camera - using ImagePicker only');
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

      // Launch camera directly
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset?.uri) {
          console.log('✅ Photo captured successfully:', asset.uri);
          setCapturedPhoto({ uri: asset.uri });
          setShowPreview(true);
          return;
        }
      }
      
      // User cancelled or no image - go back
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

  const confirmPhoto = () => {
    if (capturedPhoto) {
      console.log('Confirming photo and navigating to generate screen...');
      router.replace({
        pathname: '/generate',
        params: { selectedImage: capturedPhoto.uri }
      });
    }
  };

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedPhoto(null);
    setShowPreview(false);
    // Launch camera again after brief delay
    setTimeout(() => takePicture(), 300);
  };

  // Removed toggleCameraFacing - no longer needed without CameraView

  const closeCamera = () => {
    router.back();
  };

  if (showPreview && capturedPhoto) {
    return (
      <View style={styles.container}>
        {/* Photo Preview */}
        <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />

        {/* Preview Controls */}
        <View style={styles.previewOverlay}>
          {/* Top Controls */}
          <View style={styles.previewTopControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={closeCamera}
            >
              <Feather name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.previewBottomControls}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePhoto}
            >
              <Feather name="rotate-ccw" size={24} color="#000000" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewButton, styles.confirmButton]}
              onPress={confirmPhoto}
            >
              <Feather name="check" size={24} color="#000000" />
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Show loading screen while launching camera
  if (!showPreview) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
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

  // Show preview after photo is taken
  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {capturedPhoto && (
          <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
        )}
        
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={confirmPhoto}>
            <Text style={styles.confirmText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retakeButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  retakeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  confirmText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

