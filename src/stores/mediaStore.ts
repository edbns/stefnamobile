// Media Store - Manages media gallery, uploads, and deletions
// Uses mediaService and cloudinaryService internally for HTTP calls

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mediaService, DeleteMediaResponse, UserMediaResponse } from '../services/mediaService';
import { cloudinaryService, CloudinarySignResponse, CloudinaryUploadResult } from '../services/cloudinaryService';
import { StorageService, StoredMedia } from '../services/storageService';

interface MediaItem extends StoredMedia {
  cloudId?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

interface MediaState {
  // Media collection
  media: MediaItem[];
  isLoading: boolean;

  // Upload state
  currentUpload: {
    id: string;
    progress: number;
    fileName: string;
  } | null;

  // Error handling
  error: string | null;

  // Actions
  loadUserMedia: () => Promise<void>;
  deleteMedia: (mediaId: string, cloudId?: string) => Promise<boolean>;
  uploadToCloudinary: (imageUri: string, folder?: string) => Promise<CloudinaryUploadResult | null>;
  clearError: () => void;
  reset: () => void;

  // Sync with local storage
  syncWithLocalStorage: () => Promise<void>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  media: [],
  isLoading: false,

  currentUpload: null,

  error: null,

  loadUserMedia: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: UserMediaResponse = await mediaService.getUserMedia(token);

      if (!response.error) {
        // Transform cloud media to local format and merge with local storage
        const cloudMedia: MediaItem[] = (response.media || []).map(item => ({
          id: item.id || `cloud_${Date.now()}_${Math.random()}`,
          localUri: item.url || '',
          cloudUrl: item.url,
          cloudId: item.id,
          filename: `cloud_${item.id}.jpg`,
          createdAt: new Date(item.timestamp || Date.now()),
          synced: true,
          generationJobId: item.id,
        }));

        // Load local media
        const localMedia = await StorageService.getStoredMedia();

        // Merge and deduplicate (prefer local if exists)
        const mergedMedia = [...localMedia, ...cloudMedia].reduce((acc: MediaItem[], item) => {
          const existing = acc.find(m => m.id === item.id);
          if (!existing) {
            acc.push(item);
          }
          return acc;
        }, []);

        // Sort by creation date (newest first)
        const sortedMedia = mergedMedia.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        set({ media: sortedMedia, isLoading: false });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Load user media error:', error);

      // Fallback to local storage only
      try {
        const localMedia = await StorageService.getStoredMedia();
        set({ media: localMedia, isLoading: false });
      } catch (localError) {
        console.error('Local storage fallback error:', localError);
        set({ isLoading: false });
      }
    }
  },

  deleteMedia: async (mediaId: string, cloudId?: string): Promise<boolean> => {
    try {
      set({ error: null });

      const token = await AsyncStorage.getItem('auth_token');
      const userString = await AsyncStorage.getItem('user_profile');
      const user = userString ? JSON.parse(userString) : null;

      if (!user) {
        throw new Error('User not found');
      }

      // Delete from cloud first (if cloudId provided and token exists)
      if (cloudId && token) {
        const cloudResponse: DeleteMediaResponse = await mediaService.deleteMedia(token, {
          mediaId: cloudId,
          userId: user.id,
        });

        if (!cloudResponse.success) {
          console.warn('Cloud deletion failed, proceeding with local deletion:', cloudResponse.error);
        }
      }

      // Always delete from local storage
      await StorageService.deleteMedia(mediaId);

      // Update state
      const { media } = get();
      const updatedMedia = media.filter(item => item.id !== mediaId);
      set({ media: updatedMedia });

      return true;
    } catch (error) {
      console.error('Delete media error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete media'
      });
      return false;
    }
  },

  uploadToCloudinary: async (imageUri: string, folder?: string): Promise<CloudinaryUploadResult | null> => {
    try {
      set({ error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Start upload tracking
      const uploadId = `upload_${Date.now()}`;
      const filename = imageUri.split('/').pop() || 'image.jpg';

      set({
        currentUpload: {
          id: uploadId,
          progress: 0,
          fileName: filename,
        }
      });

      // Get Cloudinary signature
      const signatureData: CloudinarySignResponse = await cloudinaryService.getSignature({ folder });

      // Upload to Cloudinary
      const result: CloudinaryUploadResult = await cloudinaryService.uploadImage(imageUri, signatureData);

      // Clear upload tracking
      set({ currentUpload: null });

      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      set({
        currentUpload: null,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    media: [],
    isLoading: false,
    currentUpload: null,
    error: null,
  }),

  syncWithLocalStorage: async () => {
    try {
      const localMedia = await StorageService.getStoredMedia();
      const { media } = get();

      // Update synced status for local media
      const syncedMedia = media.map(item => {
        const localItem = localMedia.find(local => local.id === item.id);
        return {
          ...item,
          synced: !!localItem?.synced,
        };
      });

      set({ media: syncedMedia });
    } catch (error) {
      console.error('Sync with local storage error:', error);
    }
  },
}));
