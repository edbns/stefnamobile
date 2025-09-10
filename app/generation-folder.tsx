import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems(new Set());
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
            setSelectedItems(new Set());
            setIsSelectionMode(false);
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
    
    return (
      <TouchableOpacity 
        style={[styles.mediaItem, isSelected && styles.selectedItem]} 
        onPress={() => handleMediaPress(item)}
      >
        <Image 
          source={{ uri: item.cloudUrl || item.localUri }} 
          style={styles.mediaImage}
          resizeMode="cover"
        />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{folderName}</Text>
          <Text style={styles.headerSubtitle}>
            {isSelectionMode ? `${selectedItems.size} selected` : `${folderData.length} photos`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleSelectionMode}>
            <Feather name={isSelectionMode ? "x" : "check-square"} size={20} color="#ffffff" />
          </TouchableOpacity>
          {isSelectionMode ? (
            selectedItems.size > 0 && (
              <TouchableOpacity style={styles.actionButton} onPress={deleteSelected}>
                <Feather name="trash-2" size={20} color="#ff4444" />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={deleteAll}>
              <Feather name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
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
  },
  row: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
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
});
