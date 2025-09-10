import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImagePickerOptions {
  quality?: number;
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
  base64?: boolean;
  exif?: boolean;
  cameraType?: ImagePicker.CameraType;
  presentationStyle?: ImagePicker.UIImagePickerPresentationStyle;
}

export interface ImagePickerResult {
  success: boolean;
  uri?: string;
  exif?: any;
  error?: string;
}

export class ImagePickerService {
  // Unified camera capture with consistent options
  static async captureFromCamera(options: Partial<ImagePickerOptions> = {}): Promise<ImagePickerResult> {
    try {
      console.log('📸 [ImagePicker] Requesting camera permissions');
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Camera permission denied'
        };
      }

      console.log('📸 [ImagePicker] Launching camera');
      
      // Launch camera with consistent options
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Always false to avoid crashes
        quality: options.quality || 0.8,
        allowsMultipleSelection: false,
        cameraType: options.cameraType || ImagePicker.CameraType.back,
        exif: true, // Always preserve EXIF for orientation handling
        base64: false, // Always false to reduce memory usage
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        ...options
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'Camera capture cancelled'
        };
      }

      const asset = result.assets[0];
      if (!asset?.uri) {
        return {
          success: false,
          error: 'Failed to get image URI'
        };
      }

      console.log('📸 [ImagePicker] Camera capture successful');
      return {
        success: true,
        uri: asset.uri,
        exif: (asset as any).exif // Include EXIF data for orientation handling
      };

    } catch (error) {
      console.error('❌ [ImagePicker] Camera error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Camera error'
      };
    }
  }

  // Unified gallery picker with consistent options
  static async pickFromGallery(options: Partial<ImagePickerOptions> = {}): Promise<ImagePickerResult> {
    try {
      console.log('📸 [ImagePicker] Requesting media library permissions');
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Media library permission denied'
        };
      }

      console.log('📸 [ImagePicker] Launching image library');
      
      // Launch image library with consistent options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Always false to avoid crashes
        quality: options.quality || 0.8,
        allowsMultipleSelection: false,
        base64: false, // Always false to reduce memory usage
        ...options
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'Image selection cancelled'
        };
      }

      const asset = result.assets[0];
      if (!asset?.uri) {
        return {
          success: false,
          error: 'Failed to get image URI'
        };
      }

      console.log('📸 [ImagePicker] Gallery selection successful');
      return {
        success: true,
        uri: asset.uri
      };

    } catch (error) {
      console.error('❌ [ImagePicker] Gallery error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gallery error'
      };
    }
  }

  // Unified image normalization with consistent EXIF handling
  static async normalizeImage(uri: string, exif?: any): Promise<string> {
    try {
      console.log('📸 [ImagePicker] Normalizing image orientation');
      
      // Validate URI first
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid image URI');
      }
      
      // Determine if we need to flip horizontally (front camera mirror effect)
      const needsFlip = exif?.Orientation === 2 || exif?.Orientation === 4 || 
                        exif?.Orientation === 5 || exif?.Orientation === 7;
      
      // Determine rotation needed based on EXIF orientation
      let rotationDegrees = 0;
      if (exif?.Orientation) {
        switch (exif.Orientation) {
          case 3: rotationDegrees = 180; break;
          case 4: rotationDegrees = 180; break;
          case 5: rotationDegrees = 90; break;
          case 6: rotationDegrees = 90; break;
          case 7: rotationDegrees = 270; break;
          case 8: rotationDegrees = 270; break;
        }
      }
      
      const actions: any[] = [];
      
      // Apply rotation if needed
      if (rotationDegrees > 0) {
        actions.push({ rotate: rotationDegrees });
      }
      
      // Apply horizontal flip if needed (typically for front camera)
      if (needsFlip) {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      }
      
      // Always apply some normalization to ensure consistent output
      if (actions.length === 0) {
        // No orientation changes needed, just resize for consistency
        actions.push({ resize: { width: 1920 } });
      } else {
        // Add resize after orientation changes to maintain quality
        actions.push({ resize: { width: 1920 } });
      }
      
      console.log('📸 [ImagePicker] Applying corrections:', actions);
      
      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('✅ [ImagePicker] Image normalized successfully');
      return result.uri;
      
    } catch (error) {
      console.error('❌ [ImagePicker] Image normalization failed:', error);
      // Return original URI if normalization fails
      return uri;
    }
  }

  // Unified error handling with consistent alerts
  static showErrorAlert(title: string, message: string, onRetry?: () => void, onCancel?: () => void) {
    const buttons = [
      { text: 'Cancel', onPress: onCancel },
    ];
    
    if (onRetry) {
      buttons.unshift({ text: 'Try Again', onPress: onRetry });
    }
    
    Alert.alert(title, message, buttons);
  }
}
