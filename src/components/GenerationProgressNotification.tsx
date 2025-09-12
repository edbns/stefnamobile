// src/components/GenerationProgressNotification.tsx
// Advanced progress notification that shows real-time generation status
// Replaces the basic "Generation Started" popup with detailed progress

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface GenerationProgressNotificationProps {
  visible: boolean;
  status: 'starting' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  message?: string;
  error?: string;
  onDismiss?: () => void;
  onViewGallery?: () => void;
}

export default function GenerationProgressNotification({
  visible,
  status,
  progress = 0,
  message,
  error,
  onDismiss,
  onViewGallery
}: GenerationProgressNotificationProps) {
  const [animation] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  if (!visible) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'starting':
        return {
          title: 'Added to Queue',
          message: message || 'We will be processing it shortly',
          showProgress: false,
        };
      case 'processing':
        return {
          title: 'Processing',
          message: message || 'AI is working on your image',
          showProgress: false,
        };
      case 'completed':
        return {
          title: 'Media Ready',
          message: message || 'Your media is ready',
          showProgress: false,
        };
      case 'failed':
        return {
          title: 'Generation Failed',
          message: error || message || 'Something went wrong',
          showProgress: false,
        };
      default:
        return {
          title: 'Generation Status',
          message: message || 'Processing',
          showProgress: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            }),
          }],
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {statusInfo.title}
          </Text>
        </View>
        
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Feather name="x" size={14} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Message */}
      <Text style={styles.message}>{statusInfo.message}</Text>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {status === 'completed' && onViewGallery && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onViewGallery}
          >
            <Text style={styles.actionButtonText}>View Gallery</Text>
          </TouchableOpacity>
        )}
        
        {status === 'failed' && onDismiss && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onDismiss}
          >
            <Text style={styles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  dismissButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
  },
});
