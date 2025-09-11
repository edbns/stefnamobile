import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import SimpleNotification from './SimpleNotification';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for generation notifications
    const handleGenerationNotification = (event: any) => {
      const { message, type } = event.detail;
      addNotification(message, type);
    };

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('generationNotification', handleGenerationNotification);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('generationNotification', handleGenerationNotification);
      }
    };
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {notifications.map((notification, index) => (
        <SimpleNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={4000}
          onHide={() => removeNotification(notification.id)}
        />
      ))}
    </View>
  );
}
