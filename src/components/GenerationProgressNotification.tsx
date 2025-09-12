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
          icon: '🚀',
          title: 'Starting Generation',
          message: message || 'Preparing your image for processing...',
          color: '#2196F3',
          showProgress: false,
        };
      case 'processing':
        return {
          icon: '⚡',
          title: 'Processing',
          message: message || 'AI is working on your image...',
          color: '#FF9800',
          showProgress: true,
        };
      case 'completed':
        return {
          icon: '✅',
          title: 'Generation Complete!',
          message: message || 'Your image is ready to view',
          color: '#4CAF50',
          showProgress: false,
        };
      case 'failed':
        return {
          icon: '❌',
          title: 'Generation Failed',
          message: error || message || 'Something went wrong',
          color: '#F44336',
          showProgress: false,
        };
      default:
        return {
          icon: 'ℹ️',
          title: 'Generation Status',
          message: message || 'Processing...',
          color: '#2196F3',
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
          <Text style={styles.icon}>{statusInfo.icon}</Text>
          <Text style={[styles.title, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
        </View>
        
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Feather name="x" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Message */}
      <Text style={styles.message}>{statusInfo.message}</Text>

      {/* Progress Bar */}
      {statusInfo.showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: statusInfo.color,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {status === 'completed' && onViewGallery && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={onViewGallery}
          >
            <Feather name="image" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>View Gallery</Text>
          </TouchableOpacity>
        )}
        
        {status === 'failed' && onDismiss && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
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
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});
