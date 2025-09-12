import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert, Platform, Dimensions, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useMediaStore } from '../src/stores/mediaStore';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();

  const mediaId = params.mediaId as string;
  const cloudId = params.cloudId as string;
  const mediaUri = params.mediaUri as string;
  const mediaType = params.mediaType as string;
  const folderData = params.folderData ? JSON.parse(params.folderData as string) : null;
  const currentIndex = params.currentIndex ? parseInt(params.currentIndex as string) : 0;

  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

  // Debug logging
  console.log('MediaViewer params:', { mediaId, cloudId, mediaUri, mediaType, folderDataLength: folderData?.length, currentIndex });

  const handleClose = () => {
    navigateBack.toMain();
  };

  const handleSwipeGesture = (event: any) => {
    if (!folderData || folderData.length <= 1) return;
    
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END) {
      const threshold = 50; // Minimum swipe distance
      
      if (translationX > threshold && currentImageIndex > 0) {
        // Swipe right - go to previous image
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (translationX < -threshold && currentImageIndex < folderData.length - 1) {
        // Swipe left - go to next image
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }
  };

  const getCurrentImage = () => {
    if (!folderData || folderData.length === 0) {
      return { uri: mediaUri, id: mediaId, cloudId };
    }
    return folderData[currentImageIndex] || folderData[0];
  };

  const currentImage = getCurrentImage();

  const handleDelete = async () => {
    try {
      await deleteMedia(currentImage.id, currentImage.cloudId);
      navigateBack.toMain();
    } catch (e) {
      Alert.alert('Delete Error', 'Unable to delete this image.');
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      const imageUri = currentImage.cloudUrl || currentImage.localUri;
      
      // Download the image first to get a local file
      const fileName = `stefna_share_${Date.now()}_${currentImage.id}.jpg`;
      const localPath = FileSystem.cacheDirectory + fileName;
      
      console.log('📱 Downloading image for sharing from:', imageUri);
      const download = await FileSystem.downloadAsync(imageUri, localPath);
      
      if (download.status === 200) {
        // Share the actual image file
        if (Platform.OS === 'ios') {
          await Share.share({
            url: localPath,
            type: 'image/jpeg'
          });
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(localPath, {
              mimeType: 'image/jpeg',
              dialogTitle: 'Share Image'
            });
          } else {
            Alert.alert('Sharing not available', 'Sharing is not available on this device.');
          }
        }
      } else {
        throw new Error(`Download failed with status: ${download.status}`);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share this image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your photo library.');
        return;
      }

      // Download the image first
      const imageUri = currentImage.cloudUrl || currentImage.localUri;
      const fileName = `stefna_${Date.now()}_${currentImage.id}.jpg`;
      const localPath = FileSystem.cacheDirectory + fileName;
      
      console.log('📱 Downloading image from:', imageUri);
      const download = await FileSystem.downloadAsync(imageUri, localPath);
      
      if (download.status === 200) {
        // Save to photo library
        const asset = await MediaLibrary.createAssetAsync(localPath);
        await MediaLibrary.createAlbumAsync('Stefna', asset, false);
        
        Alert.alert('Success', 'Image saved to your photo library!');
      } else {
        throw new Error(`Download failed with status: ${download.status}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Error', 'Unable to save this image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
        <View style={styles.gestureContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: currentImage.cloudUrl || currentImage.localUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </PanGestureHandler>

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={handleClose}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Navigation Indicators */}
      {folderData && folderData.length > 1 && (
        <View style={styles.navigationIndicators}>
          <Text style={styles.navigationText}>
            {currentImageIndex + 1} / {folderData.length}
          </Text>
        </View>
      )}

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare} disabled={isLoading}>
          <Feather name="share-2" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSave} disabled={isLoading}>
          <Feather name="download" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete} disabled={isLoading}>
          <Feather name="trash-2" size={20} color="#ff4444" />
          <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gestureContainer: {
    flex: 1,
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
  scrollView: {
    flex: 1,
    paddingTop: 80, // Space for floating back button
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height,
  },
  image: {
    width: width,
    height: height * 0.8,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  // Navigation Indicators
  navigationIndicators: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  navigationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});