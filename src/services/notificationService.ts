// src/services/notificationService.ts
// Push Notifications Service for Mobile App
// Handles generation completion notifications and app updates

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

export interface NotificationData {
  type: 'generation_complete' | 'generation_failed' | 'app_update' | 'credits_low';
  generationId?: string;
  imageUrl?: string;
  error?: string;
  title: string;
  body: string;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 [Notifications] Initializing push notifications...');

      // Check if device supports notifications
      if (Platform.OS === 'web') {
        console.log('📱 [Notifications] Web platform detected, skipping push notifications');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ [Notifications] Permission not granted for push notifications');
        return false;
      }

      // Get push token
      this.expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('✅ [Notifications] Push token obtained:', this.expoPushToken);

      // Configure notification behavior
      await this.configureNotificationBehavior();

      // Register for push notifications with backend
      await this.registerWithBackend();

      this.isInitialized = true;
      console.log('🎉 [Notifications] Push notifications initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ [Notifications] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Configure notification behavior
   */
  private async configureNotificationBehavior(): Promise<void> {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('generation-updates', {
        name: 'Generation Updates',
        description: 'Notifications for image generation completion',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('app-updates', {
        name: 'App Updates',
        description: 'General app notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Register device with backend for push notifications
   */
  private async registerWithBackend(): Promise<void> {
    try {
      if (!this.expoPushToken) {
        throw new Error('No push token available');
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('⚠️ [Notifications] No auth token, skipping backend registration');
        return;
      }

      const response = await fetch(config.apiUrl('register-push-token'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pushToken: this.expoPushToken,
          platform: Platform.OS,
          deviceId: 'mobile-device', // Simplified for now
        }),
      });

      if (response.ok) {
        console.log('✅ [Notifications] Successfully registered with backend');
      } else {
        console.warn('⚠️ [Notifications] Failed to register with backend:', response.status);
      }

    } catch (error) {
      console.error('❌ [Notifications] Backend registration failed:', error);
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(data: NotificationData): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ [Notifications] Service not initialized, skipping local notification');
        return;
      }

      const channelId = data.type === 'generation_complete' || data.type === 'generation_failed' 
        ? 'generation-updates' 
        : 'app-updates';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: {
            type: data.type,
            generationId: data.generationId,
            imageUrl: data.imageUrl,
            error: data.error,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      console.log('📱 [Notifications] Local notification sent:', data.title);

    } catch (error) {
      console.error('❌ [Notifications] Failed to send local notification:', error);
    }
  }

  /**
   * Send generation completion notification
   */
  async notifyGenerationComplete(generationId: string, imageUrl?: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'generation_complete',
      generationId,
      imageUrl,
      title: '🎉 Generation Complete!',
      body: 'Your image is ready to view',
    });
  }

  /**
   * Send generation failure notification
   */
  async notifyGenerationFailed(generationId: string, error?: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'generation_failed',
      generationId,
      error,
      title: '❌ Generation Failed',
      body: error || 'Something went wrong with your generation',
    });
  }

  /**
   * Send credits low notification
   */
  async notifyCreditsLow(remainingCredits: number): Promise<void> {
    await this.sendLocalNotification({
      type: 'credits_low',
      title: '💰 Credits Running Low',
      body: `You have ${remainingCredits} credits remaining`,
    });
  }

  /**
   * Send app update notification
   */
  async notifyAppUpdate(version: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'app_update',
      title: '🔄 App Update Available',
      body: `Version ${version} is now available`,
    });
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.isInitialized;
  }

  /**
   * Unregister from push notifications
   */
  async unregister(): Promise<void> {
    try {
      if (this.expoPushToken) {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          await fetch(config.apiUrl('unregister-push-token'), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pushToken: this.expoPushToken,
            }),
          });
        }
      }

      this.expoPushToken = null;
      this.isInitialized = false;
      console.log('✅ [Notifications] Unregistered from push notifications');

    } catch (error) {
      console.error('❌ [Notifications] Failed to unregister:', error);
    }
  }
}

export default NotificationService;
