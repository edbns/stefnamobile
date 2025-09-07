import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, RotateCcw, Check, RotateCcw as Retake } from 'lucide-react-native';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission is required to take photos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        console.log('Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        console.log('Photo taken:', photo.uri);
        setCapturedPhoto(photo);
        setShowPreview(true);
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    } else {
      console.error('Camera ref is null');
      Alert.alert('Error', 'Camera is not ready. Please try again.');
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
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.previewBottomControls}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePhoto}
            >
              <Retake size={24} color="#ffffff" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewButton, styles.confirmButton]}
              onPress={confirmPhoto}
            >
              <Check size={24} color="#ffffff" />
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
      >
        {/* Camera Controls Overlay */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={closeCamera}
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            />
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <RotateCcw size={24} color="#ffffff" />
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
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#cccccc',
    marginBottom: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  confirmButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.8)',
  },
  previewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
