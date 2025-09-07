// Notification-related type definitions

export type NotificationType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'achievement'
  | 'promotion'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // in milliseconds
  actionLabel?: string;
  actionHandler?: () => void;
  icon?: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreviews: boolean;
}
