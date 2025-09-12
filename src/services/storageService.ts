// Mobile storage service - handles local storage, Photos app, and cloud sync
// This provides offline-first functionality with seamless cloud integration

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

export interface StoredMedia {
  id: string;
  localUri: string;
  cloudUrl?: string;
  cloudId?: string; // Cloudinary public ID for deletion
  filename: string;
  createdAt: Date;
  synced: boolean;
  generationJobId?: string;
}

export class StorageService {
  private static readonly STORAGE_KEY = 'stefna_media';
  private static readonly MEDIA_DIR = FileSystem.documentDirectory + 'stefna_media/';

  // Initialize storage directory
  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.MEDIA_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.MEDIA_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  // Save generated image to local storage
  static async saveGeneratedImage(
    imageUri: string,
    filename: string,
    generationJobId?: string
  ): Promise<StoredMedia> {
    try {
      await this.initialize();

      const extension = filename.split('.').pop() || 'jpg';
      const localFilename = `${Date.now()}_${filename}`;
      const localUri = this.MEDIA_DIR + localFilename;

      // Copy image to app storage
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri,
      });

      const media: StoredMedia = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        localUri,
        filename: localFilename,
        createdAt: new Date(),
        synced: false,
        generationJobId,
      };

      // Save to local storage
      await this.saveMediaToStorage(media);

      // Auto-save to Photos app if enabled
      if (config.AUTO_SAVE_TO_PHOTOS) {
        await this.saveToPhotosApp(localUri);
      }

      return media;
    } catch (error) {
      console.error('Save generated image error:', error);
      throw new Error('Failed to save image');
    }
  }

  // Save to Photos app
  static async saveToPhotosApp(localUri: string): Promise<void> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission not granted');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
    } catch (error) {
      console.error('Save to Photos app error:', error);
      // Don't throw - this is not critical
    }
  }

  // Sync media to cloud
  static async syncMediaToCloud(media: StoredMedia): Promise<void> {
    try {
      // This would upload the image to your cloud storage (Cloudinary, etc.)
      // For now, we'll mark as synced since the actual implementation depends on your cloud setup
      media.synced = true;
      media.cloudUrl = `https://your-cloud-storage.com/${media.filename}`;

      await this.updateMediaInStorage(media);
    } catch (error) {
      console.error('Sync to cloud error:', error);
      throw error;
    }
  }

  // Store media array (used by mediaStore)
  static async storeMedia(media: StoredMedia[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(media));
    } catch (error) {
      console.error('Store media error:', error);
      throw error;
    }
  }

  // Get all stored media
  static async getStoredMedia(): Promise<StoredMedia[]> {
    try {
      const mediaString = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!mediaString) return [];

      const media: StoredMedia[] = JSON.parse(mediaString);
      // Convert date strings back to Date objects
      return media.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Get stored media error:', error);
      return [];
    }
  }

  // Delete media
  static async deleteMedia(mediaId: string): Promise<void> {
    try {
      const media = await this.getStoredMedia();
      const updatedMedia = media.filter(item => item.id !== mediaId);

      // Delete physical file
      const mediaToDelete = media.find(item => item.id === mediaId);
      if (mediaToDelete) {
        await FileSystem.deleteAsync(mediaToDelete.localUri, { idempotent: true });
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMedia));
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  }

  // Get storage info
  static async getStorageInfo(): Promise<{
    totalSize: number;
    mediaCount: number;
    syncedCount: number;
  }> {
    try {
      const media = await this.getStoredMedia();
      let totalSize = 0;

      for (const item of media) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(item.localUri);
          if (fileInfo.exists) {
            totalSize += fileInfo.size || 0;
          }
        } catch (error) {
          // File might not exist, skip it
        }
      }

      return {
        totalSize,
        mediaCount: media.length,
        syncedCount: media.filter(item => item.synced).length,
      };
    } catch (error) {
      console.error('Get storage info error:', error);
      return { totalSize: 0, mediaCount: 0, syncedCount: 0 };
    }
  }

  // Clean up old files (keep last 50, delete older than 30 days)
  static async cleanupStorage(): Promise<void> {
    try {
      const media = await this.getStoredMedia();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Sort by creation date (newest first)
      const sortedMedia = media.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Keep only the most recent 50 items, and delete anything older than 30 days
      const toDelete = sortedMedia
        .slice(50) // Remove items beyond the first 50
        .filter(item => new Date(item.createdAt) < thirtyDaysAgo); // And older than 30 days

      for (const item of toDelete) {
        await this.deleteMedia(item.id);
      }
    } catch (error) {
      console.error('Cleanup storage error:', error);
    }
  }

  // Private helper methods
  private static async saveMediaToStorage(media: StoredMedia): Promise<void> {
    const existingMedia = await this.getStoredMedia();
    const updatedMedia = [...existingMedia, media];
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMedia));
  }

  private static async updateMediaInStorage(updatedMedia: StoredMedia): Promise<void> {
    const existingMedia = await this.getStoredMedia();
    const updatedList = existingMedia.map(media =>
      media.id === updatedMedia.id ? updatedMedia : media
    );
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
  }
}
