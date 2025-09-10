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
        exif: false, // Disable EXIF to prevent orientation issues
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
      console.log('📸 [ImagePicker] EXIF data:', exif);
      
      // Validate URI first
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid image URI');
      }
      
      // Skip normalization if no EXIF data - this often causes more problems than it solves
      if (!exif || !exif.Orientation) {
        console.log('📸 [ImagePicker] No EXIF orientation data, skipping normalization');
        return uri;
      }
      
      // TEMPORARY FIX: Skip normalization entirely to prevent flipping issues
      // Many developers have messed up EXIF handling, so we'll disable it for now
      console.log('📸 [ImagePicker] EXIF normalization disabled to prevent flipping issues');
      return uri;
      
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
