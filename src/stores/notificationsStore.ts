// Notifications Store - UX Notifications and Banners
// Manages toast messages, banners, and promotional notifications

import { create } from 'zustand';
import { AppNotification, NotificationType, NotificationPriority } from '../types/notification';

interface NotificationsState {
  // Active notifications (shown to user)
  notifications: AppNotification[];

  // Unread count for badges/indicators
  unreadCount: number;

  // Settings
  settings: {
    enabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    showPreviews: boolean;
  };

  // Loading state
  isLoading: boolean;

  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateSettings: (settings: Partial<NotificationsState['settings']>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  settings: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showPreviews: true,
  },
  isLoading: false,

  addNotification: (notificationData) => {
    const notification: AppNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...notificationData,
    };

    // Log the notification
    console.log(`[${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}`);

    // Add to notifications array
    const { notifications, settings } = get();
    const newNotifications = [notification, ...notifications];

    // Update unread count
    const newUnreadCount = get().unreadCount + 1;

    set({
      notifications: newNotifications,
      unreadCount: newUnreadCount,
    });

    // Auto-hide if specified
    if (notification.autoHide && notification.duration) {
      setTimeout(() => {
        get().removeNotification(notification.id);
      }, notification.duration);
    }

    // Trigger platform-specific notifications if enabled
    if (settings.enabled && settings.showPreviews) {
      // Here you could integrate with expo-notifications or react-native-push-notification
      // For now, we'll just log it
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        console.log('🚨 HIGH PRIORITY NOTIFICATION:', notification.title);
      }
    }
  },

  removeNotification: (id) => {
    const { notifications } = get();
    const filteredNotifications = notifications.filter(n => n.id !== id);

    set({
      notifications: filteredNotifications,
      // Recalculate unread count
      unreadCount: filteredNotifications.filter(n => !n.data?.read).length,
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  markAsRead: (id) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, data: { ...n.data, read: true } } : n
    );

    const newUnreadCount = updatedNotifications.filter(n => !n.data?.read).length;

    set({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n => ({
      ...n,
      data: { ...n.data, read: true }
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },

  updateSettings: (newSettings) => {
    const { settings } = get();
    set({
      settings: { ...settings, ...newSettings },
    });
  },
}));

// Convenience functions for common notifications
export const notificationHelpers = {
  success: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'success' as NotificationType,
    priority: 'low' as NotificationPriority,
    title,
    message,
    autoHide: true,
    duration: 3000,
    ...options,
  }),

  error: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'error' as NotificationType,
    priority: 'high' as NotificationPriority,
    title,
    message,
    autoHide: false,
    ...options,
  }),

  info: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'info' as NotificationType,
    priority: 'low' as NotificationPriority,
    title,
    message,
    autoHide: true,
    duration: 5000,
    ...options,
  }),

  warning: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'warning' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title,
    message,
    autoHide: false,
    ...options,
  }),

  achievement: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'achievement' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title,
    message,
    autoHide: true,
    duration: 5000,
    icon: '🏆',
    ...options,
  }),

  promotion: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'promotion' as NotificationType,
    priority: 'low' as NotificationPriority,
    title,
    message,
    autoHide: true,
    duration: 10000,
    icon: '🎉',
    ...options,
  }),

  system: (title: string, message: string, options?: Partial<AppNotification>) => ({
    type: 'system' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title,
    message,
    autoHide: false,
    icon: '⚙️',
    ...options,
  }),

  // Contextual notifications
  creditsLow: (currentCredits: number) => notificationHelpers.warning(
    'Credits Running Low',
    `You have ${currentCredits} credits left. Consider getting more!`,
    {
      actionLabel: 'Get More',
      actionHandler: () => {
        // Navigate to credits/purchase screen
        console.log('Navigate to credits screen');
      },
    }
  ),

  generationComplete: (jobName: string) => notificationHelpers.success(
    'Generation Complete!',
    `${jobName} is ready to view.`,
    {
      actionLabel: 'View',
      actionHandler: () => {
        // Navigate to gallery/result
        console.log('Navigate to gallery');
      },
    }
  ),

  newFeature: (featureName: string) => notificationHelpers.promotion(
    'New Feature Available!',
    `${featureName} is now available. Try it out!`,
    {
      actionLabel: 'Try Now',
      actionHandler: () => {
        // Navigate to feature
        console.log('Navigate to feature');
      },
    }
  ),

  referralBonus: (bonusCredits: number) => notificationHelpers.achievement(
    'Referral Bonus!',
    `You earned ${bonusCredits} credits for referring a friend!`,
    {
      actionLabel: 'Invite More',
      actionHandler: () => {
        // Navigate to referral screen
        console.log('Navigate to referral screen');
      },
    }
  ),
};
