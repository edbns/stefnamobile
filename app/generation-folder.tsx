import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Image, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useMediaStore } from '../src/stores/mediaStore';

export default function GenerationFolderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();
  
  const folderName = params.folderName as string;
  const folderData = JSON.parse(params.folderData as string);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
      router.push({
        pathname: '/media-viewer',
        params: { 
          imageUrl: item.cloudUrl || item.localUri,
          prompt: item.prompt || '',
          preset: folderName,
          date: new Date(item.createdAt).toLocaleDateString()
        }
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
    setSelectedItems(new Set(allIds));
  };

  const downloadSelected = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
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

            // Download image
            const download = await FileSystem.downloadAsync(imageUrl, localPath);
            if (download.status === 200) {
              // Save to photo library
              await MediaLibrary.createAssetAsync(localPath);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        Alert.alert('Success', `${successCount} images saved to your photo library!`);
      }
      if (errorCount > 0) {
        Alert.alert('Error', `Failed to download ${errorCount} images.`);
      }

      exitSelectionMode();
    } catch (error) {
      Alert.alert('Download Error', 'Unable to download images. Please try again.');
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
            for (const itemId of selectedItems) {
              const item = folderData.find((m: any) => m.id === itemId);
              if (item) {
                await deleteMedia(item.id, item.cloudId);
              }
            }
            exitSelectionMode();
            router.back(); // Go back to refresh main page
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
            router.back(); // Go back to refresh main page
          }
        }
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.has(item.id);
    
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
              await deleteMedia(item.id, item.cloudId);
              router.back(); // Go back to refresh main page
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
        />
        {/* Individual delete button - only show when not in selection mode */}
        {!isSelectionMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Feather name="trash-2" size={16} color="#ffffff" />
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

  return (
    <View style={styles.container}>
      {/* Transparent Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{folderName}</Text>
          <Text style={styles.headerSubtitle}>
            {isSelectionMode ? `${selectedItems.size} selected` : `${folderData.length} photos`}
          </Text>
        </View>
        {isSelectionMode && (
          <TouchableOpacity style={styles.actionButton} onPress={exitSelectionMode}>
            <Feather name="x" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Photo Grid */}
      <FlatList
        data={folderData}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {/* Action Bar - appears when in selection mode */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBarButton} onPress={selectAll}>
            <Feather name="check-square" size={20} color="#ffffff" />
            <Text style={styles.actionBarText}>Select All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, selectedItems.size === 0 && styles.actionBarButtonDisabled]} 
            onPress={downloadSelected}
            disabled={selectedItems.size === 0}
          >
            <Feather name="download" size={20} color={selectedItems.size === 0 ? "#666666" : "#4CAF50"} />
            <Text style={[styles.actionBarText, selectedItems.size === 0 && styles.actionBarTextDisabled]}>
              Download
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, selectedItems.size === 0 && styles.actionBarButtonDisabled]} 
            onPress={deleteSelected}
            disabled={selectedItems.size === 0}
          >
            <Feather name="trash-2" size={20} color={selectedItems.size === 0 ? "#666666" : "#ff4444"} />
            <Text style={[styles.actionBarText, selectedItems.size === 0 && styles.actionBarTextDisabled]}>
              Delete
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
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 16,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  gridContainer: {
    padding: 16,
    paddingTop: 100,
    paddingBottom: 100, // Space for action bar when in selection mode
  },
  row: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '49.5%',
    marginBottom: 4,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    aspectRatio: undefined, // Allow natural aspect ratio
    resizeMode: 'contain', // Show full image in original proportions
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  actionBarTextDisabled: {
    color: '#666666',
  },
});
