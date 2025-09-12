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
  cameraType?: ImagePicker.CameraType;
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
      
      // Launch camera with optimized options to prevent black screen
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Always false to avoid crashes
        quality: options.quality || 0.7, // Slightly lower quality for better performance
        allowsMultipleSelection: false,
        cameraType: options.cameraType || ImagePicker.CameraType.back,
        exif: true, // Enable EXIF to get proper orientation data
        base64: false, // Always false to reduce memory usage
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        // Add additional options to prevent black screen
        videoMaxDuration: 0,
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
        exif: (asset as any).exif, // Include EXIF data for orientation handling
        cameraType: options.cameraType || ImagePicker.CameraType.back // Pass camera type for proper handling
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

  // Improved image normalization with proper EXIF handling
  static async normalizeImage(uri: string, exif?: any, cameraType?: ImagePicker.CameraType): Promise<string> {
    try {
      console.log('📸 [ImagePicker] Normalizing image orientation');
      console.log('📸 [ImagePicker] EXIF data:', exif);
      console.log('📸 [ImagePicker] Camera type:', cameraType);
      
      // Validate URI first
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid image URI');
      }
      
      // For front camera, don't apply EXIF orientation correction
      // This prevents the disorienting flip that users experience
      if (cameraType === ImagePicker.CameraType.front) {
        console.log('📸 [ImagePicker] Front camera detected - skipping EXIF orientation correction');
        return uri;
      }
      
      // If no EXIF data, return original URI
      if (!exif || !exif.Orientation) {
        console.log('📸 [ImagePicker] No EXIF orientation data, using original image');
        return uri;
      }
      
      // Handle common orientation values that cause flipping
      const orientation = exif.Orientation;
      console.log('📸 [ImagePicker] Image orientation:', orientation);
      
      // Only normalize if orientation indicates rotation/flipping is needed
      if (orientation === 1) {
        console.log('📸 [ImagePicker] Image already in correct orientation');
        return uri;
      }
      
      // Apply proper rotation based on EXIF orientation
      let rotation = 0;
      let flipHorizontal = false;
      let flipVertical = false;
      
      switch (orientation) {
        case 2:
          flipHorizontal = true;
          break;
        case 3:
          rotation = 180;
          break;
        case 4:
          flipVertical = true;
          break;
        case 5:
          rotation = 90;
          flipHorizontal = true;
          break;
        case 6:
          rotation = 90;
          break;
        case 7:
          rotation = 270;
          flipHorizontal = true;
          break;
        case 8:
          rotation = 270;
          break;
        default:
          console.log('📸 [ImagePicker] Unknown orientation, using original image');
          return uri;
      }
      
      console.log('📸 [ImagePicker] Applying transformations:', { rotation, flipHorizontal, flipVertical });
      
      // Apply transformations using ImageManipulator
      const manipulatorActions = [];
      
      if (rotation !== 0) {
        manipulatorActions.push({ rotate: rotation });
      }
      
      if (flipHorizontal || flipVertical) {
        manipulatorActions.push({ 
          flip: flipHorizontal && flipVertical ? ImageManipulator.FlipType.Horizontal 
              : flipHorizontal ? ImageManipulator.FlipType.Horizontal 
              : ImageManipulator.FlipType.Vertical 
        });
      }
      
      if (manipulatorActions.length === 0) {
        return uri;
      }
      
      const result = await ImageManipulator.manipulateAsync(
        uri,
        manipulatorActions,
        { 
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );
      
      console.log('📸 [ImagePicker] Image normalized successfully');
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
