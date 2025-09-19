import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Image, Alert, Platform, Dimensions, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigateBack, smoothNavigate } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ModernSpinner from '../src/components/ModernSpinner';
import { useMediaStore } from '../src/stores/mediaStore';


export default function GenerationFolderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();
  
  const folderName = params.folderName as string;
  let folderData: any[] = [];
  
  try {
    if (params.folderData && typeof params.folderData === 'string') {
      folderData = JSON.parse(params.folderData);
    }
  } catch (error) {
    console.error('❌ [GenerationFolder] Failed to parse folderData:', error);
    console.error('❌ [GenerationFolder] Raw folderData:', params.folderData);
    folderData = [];
  }
  
  console.log('🔍 [GenerationFolder] Debug info:', {
    folderName,
    folderDataLength: folderData?.length || 0,
    folderData: folderData?.slice(0, 2), // Show first 2 items for debugging
    rawParams: params,
    parsedSuccessfully: folderData?.length > 0
  });
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleMediaPress = (item: any) => {
    if (isSelectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
    } else {
      // Navigate to fullscreen media view
      const currentIndex = folderData.findIndex((mediaItem: any) => mediaItem.id === item.id);
      smoothNavigate.push('/media-viewer', { 
        mediaUri: item.cloudUrl || item.localUri,
        mediaId: item.id,
        cloudId: item.cloudId,
        mediaType: 'image',
        folderData: JSON.stringify(folderData),
        currentIndex: currentIndex.toString()
      });
    }
  };

  const handleLongPress = (item: any) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItems(new Set([item.id]));
    } else {
      // Toggle selection
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const selectAll = () => {
    const allIds = folderData.map((item: any) => item.id);
    console.log('🔍 [SelectAll] Debug info:', {
      folderDataLength: folderData.length,
      allIds: allIds,
      currentSelected: Array.from(selectedItems)
    });
    setSelectedItems(new Set(allIds));
  };

  const downloadSelected = async () => {
    try {
      setIsDownloading(true);
      console.log('📱 Starting bulk download for', selectedItems.size, 'items');
      
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log('📱 Media library permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to download images.');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const itemId of selectedItems) {
        const item = folderData.find((m: any) => m.id === itemId);
        if (item) {
          try {
            const imageUrl = item.cloudUrl || item.localUri;
            const fileName = `stefna_${Date.now()}_${itemId}.jpg`;
            const localPath = FileSystem.cacheDirectory + fileName;
            
            console.log('📱 Downloading item:', itemId, 'from:', imageUrl);

            // Download image
            const download = await FileSystem.downloadAsync(imageUrl, localPath);
            console.log('📱 Download result for', itemId, ':', download);
            
            if (download.status === 200) {
              // Save to photo library
              const asset = await MediaLibrary.createAssetAsync(localPath);
              console.log('📱 Saved to photo library:', asset.id);
              successCount++;
            } else {
              console.error('❌ Download failed for', itemId, 'with status:', download.status);
              errorCount++;
            }
          } catch (error) {
            console.error('❌ Error downloading', itemId, ':', error);
            errorCount++;
          }
        }
      }

      console.log('📱 Download complete - Success:', successCount, 'Errors:', errorCount);

      if (successCount > 0) {
        Alert.alert('Success', `${successCount} images saved to your photo library!`);
      }
      if (errorCount > 0) {
        Alert.alert('Error', `Failed to download ${errorCount} images.`);
      }

      exitSelectionMode();
    } catch (error) {
      console.error('❌ Bulk download error:', error);
      Alert.alert('Download Error', `Unable to download images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareSelected = async () => {
    try {
      setIsSharing(true);
      console.log('📱 Starting bulk share for', selectedItems.size, 'items');
      
      if (selectedItems.size === 0) {
        Alert.alert('No Selection', 'Please select images to share.');
        return;
      }

      // For multiple images, we'll share them one by one
      // First, download all selected images
      const downloadedFiles: string[] = [];
      
      for (const itemId of selectedItems) {
        const item = folderData.find((m: any) => m.id === itemId);
        if (item) {
          try {
            const imageUrl = item.cloudUrl || item.localUri;
            const fileName = `stefna_share_${Date.now()}_${itemId}.jpg`;
            const localPath = FileSystem.cacheDirectory + fileName;
            
            console.log('📱 Downloading item for sharing:', itemId, 'from:', imageUrl);
            const download = await FileSystem.downloadAsync(imageUrl, localPath);
            
            if (download.status === 200) {
              downloadedFiles.push(localPath);
            }
          } catch (error) {
            console.error('❌ Error downloading for share', itemId, ':', error);
          }
        }
      }

      if (downloadedFiles.length === 0) {
        Alert.alert('Share Error', 'Unable to prepare images for sharing.');
        return;
      }

      // Share the images
      if (downloadedFiles.length === 1) {
        // Single image - share directly
        if (Platform.OS === 'ios') {
          await Share.share({
            url: downloadedFiles[0],
            type: 'image/jpeg'
          });
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadedFiles[0], {
              mimeType: 'image/jpeg',
              dialogTitle: 'Share Image'
            });
          } else {
            Alert.alert('Sharing not available', 'Sharing is not available on this device.');
          }
        }
      } else {
        // Multiple images - share one by one
        Alert.alert(
          'Multiple Images',
          `Sharing ${downloadedFiles.length} images. The share dialog will open for each image.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Share All',
              onPress: async () => {
                for (const filePath of downloadedFiles) {
                  try {
                    if (Platform.OS === 'ios') {
                      await Share.share({
                        url: filePath,
                        type: 'image/jpeg'
                      });
                    } else {
                      if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(filePath, {
                          mimeType: 'image/jpeg',
                          dialogTitle: 'Share Image'
                        });
                      }
                    }
                    // Small delay between shares
                    await new Promise(resolve => setTimeout(resolve, 500));
                  } catch (error) {
                    console.error('❌ Error sharing file:', filePath, error);
                  }
                }
              }
            }
          ]
        );
      }

      exitSelectionMode();
    } catch (error) {
      console.error('❌ Bulk share error:', error);
      Alert.alert('Share Error', `Unable to share images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSharing(false);
    }
  };

  const deleteSelected = async () => {
    Alert.alert(
      'Delete Photos',
      `Delete ${selectedItems.size} selected photos?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              for (const itemId of selectedItems) {
                const item = folderData.find((m: any) => m.id === itemId);
                if (item) {
                  await deleteMedia(item.id, item.cloudId);
                }
              }
              exitSelectionMode();
              navigateBack.toMain(); // Go back to refresh main page
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Delete Error', 'Failed to delete photos. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const deleteAll = async () => {
    Alert.alert(
      'Delete All Photos',
      `Delete all ${folderData.length} photos in ${folderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            for (const item of folderData) {
              await deleteMedia(item.id, item.cloudId);
            }
            navigateBack.toMain(); // Go back to refresh main page
          }
        }
      ]
    );
  };

  // Component for media items that can use hooks
  const MediaItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.has(item.id);
    
    // Calculate aspect ratio from metadata or use default
    const getAspectRatio = (item: any) => {
      if (item.metadata && typeof item.metadata === 'object') {
        const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
        if (metadata.width && metadata.height) {
          return metadata.width / metadata.height;
        }
      }
      return 1; // Default to square if no metadata
    };
    
    const aspectRatio = getAspectRatio(item);
    
    const handleDelete = () => {
      Alert.alert(
        'Delete Photo',
        'Delete this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeletingItemId(item.id);
                await deleteMedia(item.id, item.cloudId);
                navigateBack.toMain(); // Go back to refresh main page
              } catch (error) {
                console.error('Delete error:', error);
                Alert.alert('Delete Error', 'Failed to delete photo. Please try again.');
              } finally {
                setDeletingItemId(null);
              }
            }
          }
        ]
      );
    };
    
    return (
      <TouchableOpacity 
        style={[styles.mediaItem, isSelected && styles.selectedItem]} 
        onPress={() => handleMediaPress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <Image 
          source={{ uri: item.cloudUrl || item.localUri }} 
          style={styles.mediaImage}
          resizeMode="cover"
        />
        {/* Individual delete button - only show when not in selection mode */}
        {!isSelectionMode && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
            disabled={deletingItemId === item.id}
          >
            {deletingItemId === item.id ? (
              <ModernSpinner size={16} color="#ffffff" />
            ) : (
              <Feather name="trash-2" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        )}
        {/* Selection indicator - only show when in selection mode */}
        {isSelectionMode && (
          <View style={styles.selectionOverlay}>
            <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
              {isSelected && <Feather name="check" size={16} color="#ffffff" />}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMediaItem = ({ item }: { item: any }) => {
    return <MediaItem item={item} />;
  };

  return (
    <View style={styles.container}>
      {/* Photo Grid */}
      <FlatList
        data={folderData}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={() => (
          <View style={styles.titleContainer}>
            {isSelectionMode && (
              <Text style={styles.subtitle}>
                {selectedItems.size} selected
              </Text>
            )}
          </View>
        )}
      />

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={() => navigateBack.toMain()}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Floating Action Button (when in selection mode) */}
      {isSelectionMode && (
        <View style={styles.floatingActionButton}>
          <TouchableOpacity style={styles.actionButton} onPress={exitSelectionMode}>
            <Feather name="x" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Bar - appears when in selection mode */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBarButton} onPress={selectAll}>
            <Feather name="check-square" size={20} color="#ffffff" />
            <Text style={styles.actionBarText}>Select All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, selectedItems.size === 0 && styles.actionBarButtonDisabled]} 
            onPress={shareSelected}
            disabled={selectedItems.size === 0 || isSharing}
          >
            {isSharing ? (
              <ModernSpinner size={16} color="#ffffff" />
            ) : (
              <Feather name="share-2" size={20} color={selectedItems.size === 0 ? "#666666" : "#ffffff"} />
            )}
            <Text style={[styles.actionBarText, selectedItems.size === 0 && styles.actionBarTextDisabled]}>
              {isSharing ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, selectedItems.size === 0 && styles.actionBarButtonDisabled]} 
            onPress={downloadSelected}
            disabled={selectedItems.size === 0 || isDownloading}
          >
            {isDownloading ? (
              <ModernSpinner size={16} color="#ffffff" />
            ) : (
              <Feather name="download" size={20} color={selectedItems.size === 0 ? "#666666" : "#ffffff"} />
            )}
            <Text style={[styles.actionBarText, selectedItems.size === 0 && styles.actionBarTextDisabled]}>
              {isDownloading ? 'Saving...' : 'Download'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, selectedItems.size === 0 && styles.actionBarButtonDisabled]} 
            onPress={deleteSelected}
            disabled={selectedItems.size === 0 || isDeleting}
          >
            {isDeleting ? (
              <ModernSpinner size={16} color="#ff4444" />
            ) : (
              <Feather name="trash-2" size={20} color={selectedItems.size === 0 ? "#666666" : "#ff4444"} />
            )}
            <Text style={[styles.actionBarText, selectedItems.size === 0 && styles.actionBarTextDisabled]}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 0, // Remove top margin - media should be directly under back button
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },

  // Floating Back Button
  headerRow: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    paddingTop: 40, 
    paddingLeft: 8, 
    zIndex: 1000 
  },
  iconBackButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#000000', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  floatingActionButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingTop: 60, // Reduced space for floating back button - media directly under it
    paddingBottom: 100, // Space for action bar when in selection mode
  },
  row: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '48%', // Slightly less than 50% to allow for gaps
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 6, // Add small margin between items
    borderRadius: 0, // No border radius to match website
    aspectRatio: 1, // Force square for now to ensure display
  },
  mediaImage: {
    width: '100%',
    height: '100%', // Fill the container
    resizeMode: 'cover', // Ensure image covers the container
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Less transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Less transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#ffffff',
  },
  // Action Bar Styles
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionBarButtonDisabled: {
    opacity: 0.5,
  },
  actionBarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  actionBarTextDisabled: {
    color: '#666666',
  },
});
