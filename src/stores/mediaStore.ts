// Media Store - Handles media gallery, uploads, and deletions
// Mobile app can read/write media - this is a shared feature

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem, UserMediaResponse, DeleteMediaResponse } from '../types/media';
import { CloudinaryUploadResult, CloudinarySignResponse } from '../types/cloudinary';
import { mediaService } from '../services/mediaService';
import { cloudinaryService } from '../services/cloudinaryService';
import { StorageService } from '../services/storageService';

interface MediaState {
  media: MediaItem[];
  isLoading: boolean;
  currentUpload: {
    id: string;
    progress: number;
    fileName: string;
  } | null;
  error: string | null;

  loadUserMedia: () => Promise<void>;
  deleteMedia: (mediaId: string, cloudId?: string) => Promise<boolean>;
  uploadToCloudinary: (imageUri: string, folder?: string) => Promise<CloudinaryUploadResult | null>;
  clearError: () => void;
  reset: () => void;
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

      // Show locally stored media immediately for fast UX
      try {
        const localMedia = await StorageService.getStoredMedia();
        if (localMedia && localMedia.length > 0) {
          set({ media: localMedia, isLoading: false });
        }
      } catch {}

      // Load real user media from API
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Fetch cloud media in background
      console.log('🌐 [MediaStore] Fetching user media from server...');
      const response: UserMediaResponse = await mediaService.getUserMedia(token);

      console.log('🌐 [MediaStore] Server response:', {
        hasError: !!response.error,
        mediaCount: response.media?.length || 0,
        error: response.error
      });

      if (!response.error) {
        // Transform cloud media to local format and merge with local storage
        const cloudMedia: MediaItem[] = (response.media || []).map((item: any) => ({
          id: item.id || `cloud_${Date.now()}_${Math.random()}`,
          localUri: item.url || item.finalUrl || '',
          cloudUrl: item.url || item.finalUrl,
          cloudId: item.id,
          filename: `cloud_${item.id}.jpg`,
          createdAt: new Date(item.timestamp || item.createdAt || Date.now()),
          synced: true,
          generationJobId: item.runId || item.id,
          type: item.type,
          prompt: item.prompt,
          presetKey: item.presetKey,
        }));

        console.log('🌐 [MediaStore] Transformed cloud media:', {
          count: cloudMedia.length,
          types: cloudMedia.map(m => m.type).filter(Boolean),
          sample: cloudMedia.slice(0, 2)
        });

        // Load local media (may already be displayed)
        const localMedia = await StorageService.getStoredMedia();

        // Merge and deduplicate (prefer cloud entry, match by generationJobId or id)
        const mergedMedia = [...(localMedia || []), ...cloudMedia].reduce((acc: MediaItem[], item) => {
          // First try to match by generationJobId (for generated media)
          const existing = acc.find(m => 
            (m.generationJobId && item.generationJobId && m.generationJobId === item.generationJobId) ||
            m.id === item.id
          );
          if (!existing) {
            acc.push(item);
          } else if (item.cloudUrl && !existing.cloudUrl) {
            // If cloud item has URL but local doesn't, replace with cloud version
            const index = acc.findIndex(m => m === existing);
            acc[index] = item;
          }
          return acc;
        }, []);

        console.log('🌐 [MediaStore] Final merged media:', {
          total: mergedMedia.length,
          local: localMedia?.length || 0,
          cloud: cloudMedia.length,
          types: mergedMedia.map(m => m.type).filter(Boolean)
        });

        set({ media: mergedMedia, isLoading: false });
        await StorageService.storeMedia(mergedMedia);
      } else {
        console.error('🌐 [MediaStore] Server error:', response.error);
        set({ error: response.error, isLoading: false });
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
      // Mobile can delete media - this is a shared feature
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
          userId: 'temp' // Temporary fix - backend should extract from JWT
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
      // Mobile can upload to Cloudinary - this is a shared feature
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

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      media: [],
      isLoading: false,
      currentUpload: null,
      error: null
    });
  },

  syncWithLocalStorage: async () => {
    try {
      const { media } = get();
      await StorageService.storeMedia(media);
    } catch (error) {
      console.error('Sync with local storage error:', error);
    }
  },
}));