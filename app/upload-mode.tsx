import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';
import { ImagePickerService } from '../src/services/imagePickerService';

export default function UploadModeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode as string;

  const modeInfo = {
    custom: { title: 'Custom', subtitle: 'Describe. Create.' },
    studio: { title: 'Studio', subtitle: 'Tools for precision.' },
    unreal_reflection: { title: 'Unreal Reflection', subtitle: 'Not who you are. Who you could\'ve been.' },
    neo_glitch: { title: 'Neo Tokyo', subtitle: 'Future meets the face.' },
    ghibli: { title: 'Ghibli Reaction', subtitle: 'Animated emotions.' },
    presets: { title: 'Presets', subtitle: 'One-tap styles.' },
  };

  const currentMode = modeInfo[mode as keyof typeof modeInfo] || modeInfo.custom;

  const handleCameraPress = async () => {
    try {
      const result = await ImagePickerService.captureFromCamera();
      if (result.success && result.uri) {
        const normalizedUri = await ImagePickerService.normalizeImage(result.uri, result.exif, result.cameraType);
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
      unreal_reflection: '/generate-unreal-reflection',
      ghibli: '/generate-ghibli',
      neo_glitch: '/generate-neo',
    };

    const route = generationRoutes[mode as keyof typeof generationRoutes] || '/generate-custom';
    
    router.push({
      pathname: route,
      params: { 
        selectedImage: imageUri,
        mode: mode === 'ghibli' ? 'ghibli-reaction' : 
              mode === 'unreal_reflection' ? 'unreal-reflection' :
              mode === 'neo_glitch' ? 'neo-glitch' :
              mode === 'custom' ? 'custom-prompt' :
              mode === 'studio' ? 'edit-photo' :
              mode
      }
    });
  };

  const handleBack = () => {
    // Always go back to main screen to avoid navigation loops
    router.push('/main');
  };

  return (
    <View style={styles.container}>
      {/* Title at Top */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{currentMode.title}</Text>
        <Text style={styles.subtitle}>{currentMode.subtitle}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Start with a Photo</Text>
        <Text style={styles.description}>Upload or capture a moment to transform.</Text>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
          <Feather name="plus" size={20} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Feather name="camera" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, // Space for floating back button
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#888888',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    textAlign: 'center',
  },
  // Floating Back Button
  headerRow: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    paddingTop: 40, 
    paddingLeft: 8, 
    zIndex: 1000 
  },
  iconBackButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#000000', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 80,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
