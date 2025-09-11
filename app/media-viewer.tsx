import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert, Platform, Dimensions, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useMediaStore } from '../src/stores/mediaStore';

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deleteMedia } = useMediaStore();

  const mediaId = params.mediaId as string;
  const cloudId = params.cloudId as string;
  const mediaUri = params.mediaUri as string;
  const mediaType = params.mediaType as string;

  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    navigateBack.toMain();
  };

  const handleDelete = async () => {
    try {
      await deleteMedia(mediaId, cloudId);
      navigateBack.toMain();
    } catch (e) {
      Alert.alert('Delete Error', 'Unable to delete this image.');
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      if (Platform.OS === 'ios') {
        await Share.share({
          url: mediaUri,
          message: 'Check out this image generated with Stefna!'
        });
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(mediaUri, {
            mimeType: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
            dialogTitle: 'Share Image'
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share this image.');
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

      const asset = await MediaLibrary.createAssetAsync(mediaUri);
      await MediaLibrary.createAlbumAsync('Stefna', asset, false);
      
      Alert.alert('Success', 'Image saved to your photo library!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Error', 'Unable to save this image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Media Viewer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: mediaUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </ScrollView>

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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 1000,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
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
});