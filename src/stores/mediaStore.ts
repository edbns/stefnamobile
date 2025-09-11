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
  // Optional fields from backend to support grouping
  type?: string; // 'presets' | 'custom_prompt' | 'emotion_mask' | 'ghibli_reaction' | 'neo_glitch' | 'edit'
  prompt?: string;
  presetKey?: string;
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

      // Show locally stored media immediately for fast UX
      try {
        const localMedia = await StorageService.getStoredMedia();
        if (localMedia && localMedia.length > 0) {
          set({ media: localMedia, isLoading: false });
        }
      } catch {}

      // Development bypass - load test media
      if (__DEV__) {
        console.log('🔧 Development mode: Loading test media');
        const testMedia: MediaItem[] = [
          {
            id: 'test-media-1',
            localUri: 'https://picsum.photos/400/400?random=1',
            cloudUrl: 'https://picsum.photos/400/400?random=1',
            filename: 'test_image_1.jpg',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            synced: true,
            prompt: 'neo tokyo glitch aesthetic',
          },
          {
            id: 'test-media-2',
            localUri: 'https://picsum.photos/400/400?random=2',
            cloudUrl: 'https://picsum.photos/400/400?random=2',
            filename: 'test_image_2.jpg',
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            synced: true,
            prompt: 'custom portrait studio lighting',
          },
          {
            id: 'test-media-3',
            localUri: 'https://picsum.photos/400/400?random=3',
            cloudUrl: 'https://picsum.photos/400/400?random=3',
            filename: 'test_image_3.jpg',
            createdAt: new Date(Date.now() - 259200000), // 3 days ago
            synced: true,
            prompt: 'emotion mask ghibli style',
          },
          {
            id: 'test-media-4',
            localUri: 'https://picsum.photos/400/400?random=4',
            cloudUrl: 'https://picsum.photos/400/400?random=4',
            filename: 'test_image_4.jpg',
            createdAt: new Date(Date.now() - 345600000), // 4 days ago
            synced: true,
            prompt: 'abstract digital art',
          },
          {
            id: 'test-media-5',
            localUri: 'https://picsum.photos/400/400?random=5',
            cloudUrl: 'https://picsum.photos/400/400?random=5',
            filename: 'test_image_5.jpg',
            createdAt: new Date(Date.now() - 432000000), // 5 days ago
            synced: true,
            prompt: 'studio edit professional',
          },
          {
            id: 'test-media-6',
            localUri: 'https://picsum.photos/400/400?random=6',
            cloudUrl: 'https://picsum.photos/400/400?random=6',
            filename: 'test_image_6.jpg',
            createdAt: new Date(Date.now() - 518400000), // 6 days ago
            synced: true,
            prompt: 'ghibli reaction anime style',
          },
        ];

        set({ media: testMedia, isLoading: false });
        console.log('✅ Test media loaded successfully');
        return;
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Fetch cloud media in background
      const response: UserMediaResponse = await mediaService.getUserMedia(token);

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
            if (index !== -1) {
              acc[index] = item;
            }
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
          // userId removed - backend extracts from JWT token
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
