import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMediaStore } from '../src/stores/mediaStore';
import { Camera, Plus, User, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function MainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { media, loading, loadUserMedia, deleteMedia } = useMediaStore();

  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Load user's media on mount
  useEffect(() => {
    if (user?.id) {
      loadUserMedia();
    }
  }, [user?.id, loadUserMedia]);

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleUploadPress = async () => {
    try {
      console.log('Upload button pressed');

      // Try to request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to upload images. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Try Again',
              onPress: () => handleUploadPress()
            }
          ]
        );
        return;
      }

      console.log('Launching image picker...');

      // Try the simplest possible configuration
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 0.8,
          allowsMultipleSelection: false,
          base64: false,
        });
        console.log('Image picker succeeded with MediaTypeOptions.All');
      } catch (error) {
        console.log('MediaTypeOptions.All failed, trying alternative approach');
        // Fallback to basic configuration
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          quality: 0.8,
          base64: false,
        });
        console.log('Image picker succeeded with basic config');
      }

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage.uri);

        if (selectedImage.uri) {
          // Navigate to generation screen with selected image
          router.push({
            pathname: '/generate',
            params: { selectedImage: selectedImage.uri }
          });
        } else {
          Alert.alert('Error', 'Failed to get image data. Please try again.');
        }
      } else {
        console.log('Image selection was canceled or no assets found');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Unable to access photo library. This might be due to device restrictions. Please try again or use the camera instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Camera',
            onPress: () => handleCameraPress()
          }
        ]
      );
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const renderMediaItem = ({ item }: { item: any }) => {
    const getPresetTag = (item: any) => {
      // Extract preset information from the media item
      if (item.prompt?.includes('neo') || item.prompt?.includes('glitch')) return 'Neo Glitch';
      if (item.prompt?.includes('custom')) return 'Custom';
      if (item.prompt?.includes('studio') || item.prompt?.includes('edit')) return 'Studio';
      if (item.prompt?.includes('emotion') || item.prompt?.includes('mask')) return 'Emotion Mask';
      if (item.prompt?.includes('ghibli')) return 'Ghibli Reaction';
      return 'AI Generated';
    };

    return (
      <TouchableOpacity style={styles.mediaItem}>
        <View style={styles.mediaImage}>
          {item.cloudUrl ? (
            <Image 
              source={{ uri: item.cloudUrl }} 
              style={styles.mediaImageContent}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mediaImagePlaceholder}>
              <Sparkles size={24} color="#666666" />
            </View>
          )}
        </View>
        <View style={styles.mediaInfo}>
          <Text style={styles.presetTag}>{getPresetTag(item)}</Text>
          <Text style={styles.mediaDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Media Gallery - Full Screen */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your creations...</Text>
        </View>
      ) : media && media.length > 0 ? (
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.galleryContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Sparkles size={60} color="#666666" />
          </View>
          <Text style={styles.emptyText}>No creations yet</Text>
          <Text style={styles.emptySubtext}>Upload a photo or take one with the camera to get started</Text>
        </View>
      )}

      {/* Floating Footer */}
      <View style={styles.floatingFooter}>
        <TouchableOpacity style={styles.footerButton} onPress={handleUploadPress}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleCameraPress}>
          <Camera size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleProfilePress}>
          <User size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Gallery
  galleryContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, // Space for floating footer
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Media Item
  mediaItem: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImageContent: {
    width: '100%',
    height: '100%',
  },
  mediaImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    padding: 12,
    alignItems: 'center',
  },
  presetTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  mediaDate: {
    fontSize: 11,
    color: '#cccccc',
  },

  // Floating Footer
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    paddingBottom: 40, // Account for safe area
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
  },
  footerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
});

