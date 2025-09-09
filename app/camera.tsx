import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<{ uri: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Request permission on mount if not granted
  useEffect(() => {
    if (permission && !permission.granted && !hasRequestedPermission) {
      setHasRequestedPermission(true);
      requestPermission();
    }
  }, [permission, requestPermission, hasRequestedPermission]);

  // Show loading while checking permissions or requesting
  if (!permission || (!permission.granted && hasRequestedPermission)) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {!permission ? 'Loading camera...' : 'Requesting camera permission...'}
          </Text>
        </View>
      </View>
    );
  }

  // If permission denied, show error and go back
  if (permission && !permission.granted && hasRequestedPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Camera permission denied</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      if (!permission?.granted) {
        await requestPermission();
        if (!permission?.granted) {
          Alert.alert('Permission needed', 'Please allow camera access to take photos.');
          return;
        }
      }

      if (!cameraRef.current || !isCameraReady || isCapturing) {
        console.error('Camera not ready or already capturing');
        Alert.alert('Error', 'Camera is not ready. Please wait a moment and try again.');
        return;
      }

      console.log('Taking picture...');
      setIsCapturing(true);
      const cameraAny: any = cameraRef.current as any;
      if (typeof cameraAny?.takePictureAsync !== 'function') {
        throw new Error('CAMERA_METHOD_UNAVAILABLE');
      }
      const photo = await cameraAny.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('No photo URI returned');
      }

      console.log('Photo taken:', photo.uri);
      setCapturedPhoto(photo);
      setShowPreview(true);
    } catch (error) {
      console.error('Camera error:', error);
      // Fallback to ImagePicker camera if CameraView fails
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please allow camera access to take photos.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          base64: false,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          if (asset?.uri) {
            setCapturedPhoto({ uri: asset.uri });
            setShowPreview(true);
            return;
          }
        }
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } catch (pickerError) {
        console.error('Picker fallback error:', pickerError);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
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
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

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

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        key={facing}
        onCameraReady={() => setIsCameraReady(true)}
      >
        {/* Camera Controls Overlay */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={closeCamera}
            >
              <Feather name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls - centered shutter with flip on the right */}
          <View style={styles.bottomControls}>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            />
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Feather name="refresh-ccw" size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#cccccc',
    marginHorizontal: 30,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 50,
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Preview styles
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  previewTopControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  previewBottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  retakeButton: {
    backgroundColor: '#ffffff',
  },
  confirmButton: {
    backgroundColor: '#ffffff',
  },
  previewButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

