import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StorageService, StoredMedia } from '../services/storageService';
import { useMediaStore } from '../stores/mediaStore';
import { useAuthStore } from '../stores/authStore';

interface MediaGalleryProps {
  onMediaSelect?: (media: StoredMedia) => void;
  showDeleteOption?: boolean;
  maxItems?: number;
}

export default function MediaGallery({
  onMediaSelect,
  showDeleteOption = false,
  maxItems,
}: MediaGalleryProps) {
  const {
    media: allMedia,
    isLoading,
    error,
    deleteMedia,
    loadUserMedia,
    syncWithLocalStorage
  } = useMediaStore();

  const { user } = useAuthStore();

  // Filter and sort media based on props
  const media = React.useMemo(() => {
    const sortedMedia = allMedia.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return maxItems ? sortedMedia.slice(0, maxItems) : sortedMedia;
  }, [allMedia, maxItems]);

  const refreshing = false; // We'll use store loading state

  useEffect(() => {
    // Load media when component mounts
    loadUserMedia();
  }, [loadUserMedia]);

  const handleRefresh = async () => {
    await loadUserMedia();
    await syncWithLocalStorage();
  };

  const handleDeleteMedia = async (mediaItem: StoredMedia) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This will also delete it from your cloud account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) {
              Alert.alert('Error', 'User not authenticated');
              return;
            }

            const success = await deleteMedia(mediaItem.id, mediaItem.cloudId);

            if (success) {
              Alert.alert('Success', 'Image deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleMediaPress = (mediaItem: StoredMedia) => {
    if (onMediaSelect) {
      onMediaSelect(mediaItem);
    } else {
      // Default action: show options
      Alert.alert(
        'Image Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save to Photos',
            onPress: async () => {
              try {
                await StorageService.saveToPhotosApp(mediaItem.localUri);
                Alert.alert('Success', 'Image saved to Photos app');
              } catch (error) {
                Alert.alert('Error', 'Failed to save to Photos');
              }
            },
          },
          ...(showDeleteOption ? [{
            text: 'Delete',
            style: 'destructive' as const,
            onPress: () => handleDeleteMedia(mediaItem),
          }] : []),
        ]
      );
    }
  };

  const renderMediaItem = ({ item }: { item: StoredMedia }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => handleMediaPress(item)}
      onLongPress={showDeleteOption ? () => handleDeleteMedia(item) : undefined}
    >
      <Image
        source={{ uri: item.localUri }}
        style={styles.mediaImage}
        resizeMode="cover"
      />
      <View style={styles.mediaOverlay}>
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaDate}>
            {item.createdAt.toLocaleDateString()}
          </Text>
          {!item.synced && (
            <View style={styles.syncIndicator}>
              <Text style={styles.syncText}>Not synced</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your gallery...</Text>
      </View>
    );
  }

  if (media.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No images</Text>
        <Text style={styles.emptySubtitle}>
          Generated images will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cccccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  gridContainer: {
    padding: 4,
  },
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  mediaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaDate: {
    fontSize: 10,
    color: '#ffffff',
  },
  syncIndicator: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  syncText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
