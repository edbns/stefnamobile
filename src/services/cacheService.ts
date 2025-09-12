// src/services/cacheService.ts
// Performance Optimization Service with Intelligent Caching
// Handles image caching, API response caching, and performance monitoring

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { config } from '../config/environment';

export interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // bytes
  enableCompression: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  size: number;
  compressed?: boolean;
}

export interface PerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  totalCacheSize: number;
  lastCleanup: number;
}

class CacheService {
  private static instance: CacheService;
  private cacheConfig: CacheConfig;
  private performanceMetrics: PerformanceMetrics;
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
  };

  private constructor() {
    this.cacheConfig = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 100 * 1024 * 1024, // 100MB
      enableCompression: true,
    };

    this.performanceMetrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      totalCacheSize: 0,
      lastCleanup: Date.now(),
    };
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Initialize cache service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 [Cache] Initializing cache service...');
      
      // Load performance metrics
      await this.loadPerformanceMetrics();
      
      // Clean expired entries
      await this.cleanExpiredEntries();
      
      // Calculate cache size
      await this.calculateCacheSize();
      
      console.log('✅ [Cache] Cache service initialized');
    } catch (error) {
      console.error('❌ [Cache] Failed to initialize:', error);
    }
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      this.cacheStats.totalRequests++;
      
      const cacheKey = this.getCacheKey(key);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        this.cacheStats.misses++;
        this.updateHitRate();
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cachedData);
      
      // Check if expired
      if (this.isExpired(entry)) {
        await this.delete(key);
        this.cacheStats.misses++;
        this.updateHitRate();
        return null;
      }

      this.cacheStats.hits++;
      this.updateHitRate();
      
      console.log('🎯 [Cache] Cache hit for key:', key);
      return entry.data;

    } catch (error) {
      console.error('❌ [Cache] Failed to get cached data:', error);
      this.cacheStats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, customMaxAge?: number): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        size,
        compressed: this.cacheConfig.enableCompression,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Update cache size
      this.performanceMetrics.totalCacheSize += size;
      
      // Check if we need to clean up
      if (this.performanceMetrics.totalCacheSize > this.cacheConfig.maxSize) {
        await this.cleanupOldEntries();
      }

      console.log('💾 [Cache] Cached data for key:', key, `(${this.formatBytes(size)})`);

    } catch (error) {
      console.error('❌ [Cache] Failed to cache data:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      console.log('🗑️ [Cache] Deleted cache for key:', key);
    } catch (error) {
      console.error('❌ [Cache] Failed to delete cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      this.performanceMetrics.totalCacheSize = 0;
      this.cacheStats = { hits: 0, misses: 0, totalRequests: 0 };
      
      console.log('🧹 [Cache] Cleared all cache data');
    } catch (error) {
      console.error('❌ [Cache] Failed to clear cache:', error);
    }
  }

  /**
   * Cache API response with intelligent key generation
   */
  async cacheApiResponse<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    data: T,
    customMaxAge?: number
  ): Promise<void> {
    const cacheKey = this.generateApiCacheKey(endpoint, params);
    await this.set(cacheKey, data, customMaxAge);
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(
    endpoint: string, 
    params: Record<string, any> = {}
  ): Promise<T | null> {
    const cacheKey = this.generateApiCacheKey(endpoint, params);
    return await this.get<T>(cacheKey);
  }

  /**
   * Cache image with local file system
   */
  async cacheImage(url: string, localPath: string): Promise<string | null> {
    try {
      // Check if already cached
      const cachedPath = await this.getCachedImagePath(url);
      if (cachedPath && await FileSystem.getInfoAsync(cachedPath).then(info => info.exists)) {
        console.log('🎯 [Cache] Image cache hit:', url);
        return cachedPath;
      }

      // Download and cache image
      const downloadResult = await FileSystem.downloadAsync(url, localPath);
      
      if (downloadResult.status === 200) {
        // Cache the path
        await this.set(`image_${this.hashString(url)}`, localPath);
        console.log('💾 [Cache] Image cached:', url);
        return localPath;
      }

      return null;
    } catch (error) {
      console.error('❌ [Cache] Failed to cache image:', error);
      return null;
    }
  }

  /**
   * Get cached image path
   */
  async getCachedImagePath(url: string): Promise<string | null> {
    return await this.get<string>(`image_${this.hashString(url)}`);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return { ...this.cacheStats };
  }

  /**
   * Clean expired entries
   */
  private async cleanExpiredEntries(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let cleanedCount = 0;
      let freedSpace = 0;

      for (const key of cacheKeys) {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          const entry: CacheEntry = JSON.parse(cachedData);
          if (this.isExpired(entry)) {
            await AsyncStorage.removeItem(key);
            cleanedCount++;
            freedSpace += entry.size;
          }
        }
      }

      this.performanceMetrics.totalCacheSize -= freedSpace;
      this.performanceMetrics.lastCleanup = Date.now();

      if (cleanedCount > 0) {
        console.log(`🧹 [Cache] Cleaned ${cleanedCount} expired entries, freed ${this.formatBytes(freedSpace)}`);
      }

    } catch (error) {
      console.error('❌ [Cache] Failed to clean expired entries:', error);
    }
  }

  /**
   * Cleanup old entries when cache is full
   */
  private async cleanupOldEntries(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      // Get all entries with timestamps
      const entries = await Promise.all(
        cacheKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const entry: CacheEntry = JSON.parse(data);
            return { key, entry };
          }
          return null;
        })
      );

      // Sort by timestamp (oldest first)
      const validEntries = entries.filter(Boolean).sort((a, b) => a!.entry.timestamp - b!.entry.timestamp);

      // Remove oldest entries until we're under the limit
      let removedSize = 0;
      const targetSize = this.cacheConfig.maxSize * 0.8; // Keep 80% of max size

      for (const entry of validEntries) {
        if (this.performanceMetrics.totalCacheSize - removedSize <= targetSize) {
          break;
        }

        await AsyncStorage.removeItem(entry!.key);
        removedSize += entry!.entry.size;
      }

      this.performanceMetrics.totalCacheSize -= removedSize;
      
      if (removedSize > 0) {
        console.log(`🧹 [Cache] Cleaned up ${this.formatBytes(removedSize)} of old cache entries`);
      }

    } catch (error) {
      console.error('❌ [Cache] Failed to cleanup old entries:', error);
    }
  }

  /**
   * Load performance metrics from storage
   */
  private async loadPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await AsyncStorage.getItem('cache_performance_metrics');
      if (metrics) {
        this.performanceMetrics = JSON.parse(metrics);
      }
    } catch (error) {
      console.error('❌ [Cache] Failed to load performance metrics:', error);
    }
  }

  /**
   * Save performance metrics to storage
   */
  private async savePerformanceMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem('cache_performance_metrics', JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('❌ [Cache] Failed to save performance metrics:', error);
    }
  }

  /**
   * Calculate current cache size
   */
  private async calculateCacheSize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }

      this.performanceMetrics.totalCacheSize = totalSize;
    } catch (error) {
      console.error('❌ [Cache] Failed to calculate cache size:', error);
    }
  }

  /**
   * Update cache hit rate
   */
  private updateHitRate(): void {
    this.performanceMetrics.cacheHitRate = this.cacheStats.hits / this.cacheStats.totalRequests;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.cacheConfig.maxAge;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(key: string): string {
    return `cache_${this.hashString(key)}`;
  }

  /**
   * Generate API cache key
   */
  private generateApiCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${paramString}`;
  }

  /**
   * Hash string for cache key
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default CacheService;
