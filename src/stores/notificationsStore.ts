// Mobile Notifications Store - Simplified version
// Basic notifications without over-engineering

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
  },
  
  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearAll: () => set({ notifications: [] })
}));

// Simple notification helpers
export const notificationHelpers = {
  info: (title: string, message: string) => ({ type: 'info' as const, title, message }),
  success: (title: string, message: string) => ({ type: 'success' as const, title, message }),
  warning: (title: string, message: string) => ({ type: 'warning' as const, title, message }),
  error: (title: string, message: string) => ({ type: 'error' as const, title, message })
};
