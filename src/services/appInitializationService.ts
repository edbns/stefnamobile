// src/services/appInitializationService.ts
// App Initialization Service - Initializes all services on app startup
// Ensures proper order of service initialization and error handling

import NotificationService from './notificationService';
import CacheService from './cacheService';
import PerformanceService from './performanceService';
import { config } from '../config/environment';

export interface InitializationResult {
  success: boolean;
  services: {
    notifications: boolean;
    cache: boolean;
    performance: boolean;
  };
  errors: string[];
}

class AppInitializationService {
  private static instance: AppInitializationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AppInitializationService {
    if (!AppInitializationService.instance) {
      AppInitializationService.instance = new AppInitializationService();
    }
    return AppInitializationService.instance;
  }

  /**
   * Initialize all app services
   */
  async initialize(): Promise<InitializationResult> {
    console.log('🚀 [AppInit] Starting app initialization...');
    
    const result: InitializationResult = {
      success: true,
      services: {
        notifications: false,
        cache: false,
        performance: false,
      },
      errors: [],
    };

    try {
      // Initialize services in parallel for better performance
      const [notificationResult, cacheResult, performanceResult] = await Promise.allSettled([
        this.initializeNotifications(),
        this.initializeCache(),
        this.initializePerformance(),
      ]);

      // Process notification service result
      if (notificationResult.status === 'fulfilled') {
        result.services.notifications = notificationResult.value;
        console.log('✅ [AppInit] Notifications service initialized');
      } else {
        result.errors.push(`Notifications: ${notificationResult.reason}`);
        console.error('❌ [AppInit] Notifications service failed:', notificationResult.reason);
      }

      // Process cache service result
      if (cacheResult.status === 'fulfilled') {
        result.services.cache = cacheResult.value;
        console.log('✅ [AppInit] Cache service initialized');
      } else {
        result.errors.push(`Cache: ${cacheResult.reason}`);
        console.error('❌ [AppInit] Cache service failed:', cacheResult.reason);
      }

      // Process performance service result
      if (performanceResult.status === 'fulfilled') {
        result.services.performance = performanceResult.value;
        console.log('✅ [AppInit] Performance service initialized');
      } else {
        result.errors.push(`Performance: ${performanceResult.reason}`);
        console.error('❌ [AppInit] Performance service failed:', performanceResult.reason);
      }

      // Determine overall success
      result.success = result.errors.length === 0;

      this.isInitialized = true;
      
      console.log('🎉 [AppInit] App initialization completed:', {
        success: result.success,
        services: result.services,
        errors: result.errors.length,
      });

      return result;

    } catch (error) {
      console.error('❌ [AppInit] Critical initialization error:', error);
      result.success = false;
      result.errors.push(`Critical: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Initialize notifications service
   */
  private async initializeNotifications(): Promise<boolean> {
    try {
      if (!config.ENABLE_PUSH_NOTIFICATIONS) {
        console.log('📱 [AppInit] Push notifications disabled in config');
        return true; // Not an error, just disabled
      }

      const notificationService = NotificationService.getInstance();
      return await notificationService.initialize();
    } catch (error) {
      console.error('❌ [AppInit] Notifications initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize cache service
   */
  private async initializeCache(): Promise<boolean> {
    try {
      const cacheService = CacheService.getInstance();
      await cacheService.initialize();
      return true;
    } catch (error) {
      console.error('❌ [AppInit] Cache initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize performance service
   */
  private async initializePerformance(): Promise<boolean> {
    try {
      const performanceService = PerformanceService.getInstance();
      await performanceService.initialize();
      return true;
    } catch (error) {
      console.error('❌ [AppInit] Performance initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if app is initialized
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get initialization status
   */
  async getInitializationStatus(): Promise<{
    initialized: boolean;
    services: {
      notifications: boolean;
      cache: boolean;
      performance: boolean;
    };
  }> {
    const notificationService = NotificationService.getInstance();
    const cacheService = CacheService.getInstance();
    const performanceService = PerformanceService.getInstance();

    return {
      initialized: this.isInitialized,
      services: {
        notifications: notificationService.isEnabled(),
        cache: true, // Cache service is always available
        performance: true, // Performance service is always available
      },
    };
  }

  /**
   * Reinitialize failed services
   */
  async reinitializeFailedServices(): Promise<InitializationResult> {
    console.log('🔄 [AppInit] Reinitializing failed services...');
    return await this.initialize();
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🛑 [AppInit] Shutting down services...');
      
      const notificationService = NotificationService.getInstance();
      const performanceService = PerformanceService.getInstance();
      
      // Unregister notifications
      if (notificationService.isEnabled()) {
        await notificationService.unregister();
      }
      
      // End performance session
      performanceService.endSession();
      
      this.isInitialized = false;
      console.log('✅ [AppInit] Services shutdown completed');
      
    } catch (error) {
      console.error('❌ [AppInit] Error during shutdown:', error);
    }
  }
}

export default AppInitializationService;
