import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ImagePickerService } from '../src/services/imagePickerService';

export default function UploadModeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode as string;

  const modeInfo = {
    custom: { title: 'Custom', subtitle: 'Describe. Create.' },
    studio: { title: 'Studio', subtitle: 'Tools for precision.' },
    emotion_mask: { title: 'Emotion Mask', subtitle: 'Faces that feel.' },
    neo_glitch: { title: 'Neo Tokyo', subtitle: 'Future meets the face.' },
    ghibli: { title: 'Ghibli Reaction', subtitle: 'Animated emotions.' },
    presets: { title: 'Presets', subtitle: 'One-tap styles.' },
  };

  const currentMode = modeInfo[mode as keyof typeof modeInfo] || modeInfo.custom;

  const handleCameraPress = async () => {
    try {
      const result = await ImagePickerService.captureFromCamera();
      if (result.success && result.uri) {
        const normalizedUri = await ImagePickerService.normalizeImage(result.uri, result.exif);
        navigateToGeneration(normalizedUri);
      } else {
        ImagePickerService.showErrorAlert(
          'Camera Error',
          result.error || 'Failed to capture image',
          () => handleCameraPress(),
          () => router.back()
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      ImagePickerService.showErrorAlert(
        'Camera Error',
        'Failed to capture image. Please try again.',
        () => handleCameraPress(),
        () => router.back()
      );
    }
  };

  const handleUploadPress = async () => {
    try {
      const result = await ImagePickerService.pickFromGallery();
      if (result.success && result.uri) {
        navigateToGeneration(result.uri);
      } else {
        ImagePickerService.showErrorAlert(
          'Upload Error',
          result.error || 'Failed to select image',
          () => handleUploadPress(),
          () => router.back()
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      ImagePickerService.showErrorAlert(
        'Upload Error',
        'Failed to select image. Please try again.',
        () => handleUploadPress(),
        () => router.back()
      );
    }
  };

  const navigateToGeneration = (imageUri: string) => {
    const generationRoutes = {
      custom: '/generate-custom',
      studio: '/generate-studio',
      presets: '/generate-presets',
      emotion_mask: '/generate-emotion',
      ghibli: '/generate-ghibli',
      neo_glitch: '/generate-neo',
    };

    const route = generationRoutes[mode as keyof typeof generationRoutes] || '/generate-custom';
    
    router.push({
      pathname: route,
      params: { 
        selectedImage: imageUri,
        mode: mode
      }
    });
  };

  const handleBack = () => {
    router.push('/edit');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{currentMode.title}</Text>
          <Text style={styles.headerSubtitle}>{currentMode.subtitle}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Upload or Snap</Text>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
          <Feather name="plus" size={32} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Feather name="camera" size={32} color="#000000" />
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
