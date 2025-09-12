import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import SimpleNotification from './SimpleNotification';
import { useNotificationsStore } from '../stores/notificationsStore';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { notifications: storeNotifications, removeNotification } = useNotificationsStore();

  // Listen to store notifications
  useEffect(() => {
    setNotifications(storeNotifications);
  }, [storeNotifications]);

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
