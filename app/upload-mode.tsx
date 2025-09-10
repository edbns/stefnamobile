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
    custom: { title: 'Custom', subtitle: 'Create with your own prompt' },
    studio: { title: 'Studio', subtitle: 'Professional editing' },
    emotion_mask: { title: 'Emotion Mask', subtitle: 'Express your emotions' },
    neo_glitch: { title: 'Neo Tokyo Glitch', subtitle: 'Cyberpunk aesthetic' },
    ghibli: { title: 'Ghibli Reaction', subtitle: 'Anime magic' },
    presets: { title: 'Presets', subtitle: 'Quick transformations' },
  };

  const currentMode = modeInfo[mode as keyof typeof modeInfo] || modeInfo.custom;

  const handleCameraPress = async () => {
    try {
      const result = await ImagePickerService.captureFromCamera();
      if (result.success && result.uri) {
        const normalizedUri = await ImagePickerService.normalizeImage(result.uri, result.exif);
        router.push({
          pathname: '/generate',
          params: { 
            selectedImage: normalizedUri,
            mode: mode
          }
        });
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
        router.push({
          pathname: '/generate',
          params: { 
            selectedImage: result.uri,
            mode: mode
          }
        });
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

  const handleBack = () => {
    router.back();
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

      {/* Upload Options */}
      <View style={styles.content}>
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Add Your Photo</Text>
          <Text style={styles.uploadSubtitle}>Choose how you'd like to add your image</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
              <Feather name="image" size={24} color="#000000" />
              <Text style={styles.buttonText}>Upload from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
              <Feather name="camera" size={24} color="#000000" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
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
  uploadCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  uploadButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cameraButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
