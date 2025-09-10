import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMediaStore } from '../src/stores/mediaStore';

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();
  
  const imageUrl = params.imageUrl as string;
  const prompt = params.prompt as string;
  const preset = params.preset as string;
  const date = params.date as string;
  const mediaId = (params.id as string) || '';
  const cloudId = (params.cloudId as string) || '';

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
      {/* Fullscreen Image */}
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.fullscreenImage}
        resizeMode="contain"
      />
      
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topRightGroup}>
          <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
            <Feather name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleDelete}>
            <Feather name="trash-2" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.presetText}>{preset}</Text>
        <Text style={styles.promptText} numberOfLines={2}>{prompt}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  presetText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promptText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dateText: {
    color: '#888888',
    fontSize: 12,
  },
});
