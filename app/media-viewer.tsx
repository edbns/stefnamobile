import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert, Platform, Dimensions, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useMediaStore } from '../src/stores/mediaStore';

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const imageUrl = params.imageUrl as string;
  const prompt = params.prompt as string;
  const preset = params.preset as string;
  const date = params.date as string;
  const mediaId = (params.id as string) || '';
  const cloudId = (params.cloudId as string) || '';

  // Simple zoom functionality
  const [scale, setScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // Double tap to zoom
  const handleDoubleTap = () => {
    if (scale === 1) {
      setScale(2);
      setIsZoomed(true);
    } else {
      setScale(1);
      setIsZoomed(false);
    }
  };

  // PanResponder for pan when zoomed
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isZoomed,
      onMoveShouldSetPanResponder: () => isZoomed,
      onPanResponderGrant: () => {
        // Allow panning when zoomed
      },
      onPanResponderMove: (evt, gestureState) => {
        // Simple pan implementation could be added here if needed
      },
      onPanResponderRelease: () => {
        // Reset pan if needed
      },
    })
  ).current;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('📱 Starting download for:', imageUrl);
      
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log('📱 Media library permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to download images.');
        return;
      }

      // Download image to local cache first
      const isRemote = imageUrl.startsWith('http');
      const fileName = `stefna_${Date.now()}.jpg`;
      const localPath = FileSystem.cacheDirectory + fileName;
      
      console.log('📱 Local path:', localPath);
      console.log('📱 Is remote:', isRemote);

      if (isRemote) {
        console.log('📱 Downloading image from:', imageUrl);
        const download = await FileSystem.downloadAsync(imageUrl, localPath);
        console.log('📱 Download result:', download);
        
        if (download.status !== 200) {
          throw new Error(`Download failed with status: ${download.status}`);
        }
        console.log('📱 Image downloaded to:', localPath);
      } else {
        // If it's already local, copy it to cache with new name
        console.log('📱 Copying local file...');
        await FileSystem.copyAsync({
          from: imageUrl,
          to: localPath
        });
        console.log('📱 File copied to:', localPath);
      }

      // Save to photo library
      console.log('📱 Saving to photo library...');
      const asset = await MediaLibrary.createAssetAsync(localPath);
      console.log('📱 Image saved to photo library:', asset.id);
      
      Alert.alert('Success', 'Image saved to your photo library!');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert('Download Error', `Unable to download image: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Download to local cache to share raw media (no links)
      const isRemote = imageUrl.startsWith('http');
      const localPath = isRemote
        ? FileSystem.cacheDirectory + `share_${Date.now()}.jpg`
        : imageUrl;

      if (isRemote) {
        const download = await FileSystem.downloadAsync(imageUrl, localPath);
        if (download.status !== 200) {
          throw new Error('Download failed');
        }
      }

      if (Platform.OS === 'ios' || (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(localPath);
      } else {
        await Share.share({ url: localPath });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share image. Please try again.');
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleDelete = async () => {
    try {
      await deleteMedia(mediaId, cloudId);
      router.back();
    } catch (e) {
      Alert.alert('Delete Error', 'Unable to delete this image.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fullscreen Image with Zoom */}
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={styles.imageWrapper}
          onPress={handleDoubleTap}
          activeOpacity={1}
          {...panResponder.panHandlers}
        >
          <Image 
            source={{ uri: imageUrl }} 
            style={[
              styles.fullscreenImage,
              {
                transform: [{ scale: scale }],
              },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topRightGroup}>
          <TouchableOpacity 
            style={[styles.controlButton, isDownloading && styles.controlButtonDisabled]} 
            onPress={handleDownload}
            disabled={isDownloading}
          >
            <Feather 
              name={isDownloading ? "loader" : "download"} 
              size={20} 
              color={isDownloading ? "#888888" : "#4CAF50"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
            <Feather name="share" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Floating Info Card */}
      <View style={styles.floatingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.presetText}>{preset}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <Text style={styles.promptText} numberOfLines={3}>{prompt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60, // Reduced top padding for better full-screen
    paddingBottom: 120,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  promptText: {
    color: '#cccccc',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  dateText: {
    color: '#888888',
    fontSize: 11,
  },
});
