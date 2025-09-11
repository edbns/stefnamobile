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
  Dimensions,
} from 'react-native';
import { StorageService, StoredMedia } from '../services/storageService';
import { useMediaStore } from '../stores/mediaStore';
import { useAuthStore } from '../stores/authStore';
import { useGenerationStore } from '../stores/generationStore';

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
  const { activeGenerations } = useGenerationStore();

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

  const renderActiveGeneration = (generation: any) => (
    <View style={styles.generationItem}>
      <View style={styles.generationPlaceholder}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.generationText}>
          {generation.status === 'pending' ? 'Starting...' : 'Processing...'}
        </Text>
        <Text style={styles.generationMode}>{generation.mode}</Text>
      </View>
    </View>
  );

  // Component for media items that can use hooks
  const MediaItem = ({ item }: { item: StoredMedia }) => {
    return (
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
  };

  const renderMediaItem = ({ item }: { item: StoredMedia }) => {
    return <MediaItem item={item} />;
  };

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

  // Combine media with active generations
  const combinedData = React.useMemo(() => {
    const generationItems = activeGenerations.map(gen => ({
      type: 'generation',
      id: gen.id,
      data: gen
    }));
    
    const mediaItems = media.map(item => ({
      type: 'media',
      id: item.id,
      data: item
    }));
    
    return [...generationItems, ...mediaItems];
  }, [activeGenerations, media]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'generation') {
      return renderActiveGeneration(item.data);
    } else {
      return renderMediaItem({ item: item.data });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
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
    padding: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    aspectRatio: 1, // Square images
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
  generationItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    minHeight: 150,
    maxHeight: 400,
    height: 200, // Default height for generation placeholders
  },
  generationPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
  },
  generationText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  generationMode: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});
