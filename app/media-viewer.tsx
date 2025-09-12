import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert, Platform, Dimensions, ScrollView, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useMediaStore } from '../src/stores/mediaStore';
import ModernSpinner from '../src/components/ModernSpinner';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 150;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Show visual feedback during gesture
      if (folderData && folderData.length > 1) {
        if (gestureState.dx > 50) {
          setGestureFeedback('← Previous');
        } else if (gestureState.dx < -50) {
          setGestureFeedback('Next →');
        } else {
          setGestureFeedback(null);
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      setGestureFeedback(null);
      
      if (folderData && folderData.length > 1) {
        if (gestureState.dx > 80) {
          // Swipe right - go to previous image
          const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : folderData.length - 1;
          setCurrentImageIndex(newIndex);
        } else if (gestureState.dx < -80) {
          // Swipe left - go to next image
          const newIndex = currentImageIndex < folderData.length - 1 ? currentImageIndex + 1 : 0;
          setCurrentImageIndex(newIndex);
        }
      }
    },
  })).current;

  // Debug logging
  console.log('MediaViewer params:', { mediaId, cloudId, mediaUri, mediaType, folderDataLength: folderData?.length, currentIndex });

  const handleClose = () => {
    navigateBack.toMain();
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
      setIsDeleting(true);
      await deleteMedia(currentImage.id, currentImage.cloudId);
      navigateBack.toMain();
    } catch (e) {
      Alert.alert('Delete Error', 'Unable to delete this image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
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
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
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
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gestureContainer} {...panResponder.panHandlers}>
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
        
        {/* Gesture Feedback Overlay */}
        {gestureFeedback && (
          <View style={styles.gestureFeedbackOverlay}>
            <Text style={styles.gestureFeedbackText}>{gestureFeedback}</Text>
          </View>
        )}
      </View>

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={handleClose}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        
        {/* Media Counter */}
        {folderData && folderData.length > 1 && (
          <View style={styles.mediaCounter}>
            <Text style={styles.mediaCounterText}>
              {currentImageIndex + 1} / {folderData.length}
            </Text>
          </View>
        )}
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.floatingActions}>
        <TouchableOpacity style={styles.floatingActionButton} onPress={handleShare} disabled={isSharing}>
          {isSharing ? (
            <Feather name="loader" size={24} color="#ffffff" />
          ) : (
            <Feather name="share-2" size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.floatingActionButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Feather name="loader" size={24} color="#ffffff" />
          ) : (
            <Feather name="download" size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.floatingActionButton} onPress={handleDelete} disabled={isSaving || isSharing || isDeleting}>
          {isDeleting ? (
            <ModernSpinner size={16} color="#ff4444" />
          ) : (
            <Feather name="trash-2" size={24} color="#ff4444" />
          )}
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
  gestureFeedbackOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  gestureFeedbackText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Floating Back Button
  headerRow: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, 
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
  mediaCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mediaCounterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60, // Space for floating back button
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: height,
    paddingTop: 20,
  },
  image: {
    width: width,
    height: height * 0.75, // Position image under back button
  },
  // Floating Action Buttons
  floatingActions: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  floatingActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});