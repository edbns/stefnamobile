import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animationDuration?: number;
}

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animationDuration = 1500,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim, animationDuration]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.8, 0.3],
    }),
  };

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

// Predefined skeleton components for common use cases
export const SkeletonText = ({ lines = 1, style }: { lines?: number; style?: any }) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? '70%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCard = ({ style }: { style?: any }) => (
  <View style={[styles.card, style]}>
    <Skeleton height={200} borderRadius={12} style={{ marginBottom: 12 }} />
    <SkeletonText lines={2} />
  </View>
);

export const SkeletonButton = ({ style }: { style?: any }) => (
  <Skeleton height={48} borderRadius={12} style={style} />
);

// Media folder skeleton that matches the actual folder structure
export const SkeletonMediaFolder = ({ style }: { style?: any }) => (
  <View style={[styles.mediaFolder, style]}>
    {/* Main image area */}
    <View style={styles.folderImageSkeleton}>
      <Skeleton 
        height="100%" 
        width="100%" 
        borderRadius={0}
        style={styles.folderImageContent}
      />
      {/* Overlay skeleton */}
      <View style={styles.folderOverlaySkeleton}>
        <Skeleton 
          height={16} 
          width="80%" 
          borderRadius={4}
          style={{ marginBottom: 4 }}
        />
        <Skeleton 
          height={12} 
          width="60%" 
          borderRadius={4}
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2a2a2a',
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mediaFolder: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 6,
    flex: 1,
  },
  folderImageSkeleton: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Square folders
  },
  folderImageContent: {
    width: '100%',
    height: '100%',
  },
  folderOverlaySkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
