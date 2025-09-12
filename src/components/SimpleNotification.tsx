import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface SimpleNotificationProps {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export default function SimpleNotification({ 
  title,
  message, 
  type, 
  duration = 3000, 
  onHide 
}: SimpleNotificationProps) {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onHide?.();
    });
  };

  if (!visible) return null;

  const getBackgroundColor = () => {
    // Use consistent dark background for all notifications
    return '#1a1a1a';
  };

  const getIcon = () => {
    // Remove emojis - use simple text indicators
    switch (type) {
      case 'success': return '•';
      case 'error': return '•';
      case 'info': return '•';
      default: return '•';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      <View style={styles.textContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  icon: {
    fontSize: 12,
    marginRight: 8,
    color: '#ffffff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#cccccc',
    fontWeight: '400',
    lineHeight: 16,
  },
});
