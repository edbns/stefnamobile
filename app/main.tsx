import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Image,
  SectionList
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMediaStore } from '../src/stores/mediaStore';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function MainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { media, isLoading, loadUserMedia, deleteMedia } = useMediaStore();
  const [sections, setSections] = useState<any[]>([]);

  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Load user's media on mount
  useEffect(() => {
    if (user?.id) {
      loadUserMedia();
    }
  }, [user?.id, loadUserMedia]);

  // Group media by mode/type
  useEffect(() => {
    const labelFor = (item: any): string => {
      const type = (item.type || '').toLowerCase();
      if (type === 'neo_glitch' || item.prompt?.includes('neo') || item.prompt?.includes('glitch')) return 'Neo Tokyo Glitch';
      if (type === 'emotion_mask' || item.prompt?.includes('emotion') || item.prompt?.includes('mask')) return 'Emotion Mask';
      if (type === 'ghibli_reaction' || item.prompt?.includes('ghibli')) return 'Ghibli Reaction';
      if (type === 'custom_prompt' || item.prompt?.includes('custom')) return 'Custom';
      if (type === 'edit' || item.prompt?.includes('edit') || item.prompt?.includes('studio')) return 'Studio';
      return 'Presets';
    };

    const groups: Record<string, any[]> = {};
    for (const m of media || []) {
      const key = labelFor(m);
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    const s = Object.keys(groups).map(title => ({ title, data: groups[title] }));
    setSections(s);
  }, [media]);

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

      // Prefer images only and avoid editing UI (can crash on some OEMs)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
      });

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
              <Feather name="heart" size={24} color="#666666" />
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your creations...</Text>
        </View>
      ) : media && media.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index, section }) => (
            <View style={[
              styles.sectionItemWrapper, 
              { width: '50%' }, // 2 columns
              index % 2 === 0 ? { paddingRight: 4 } : { paddingLeft: 4 }
            ]}>
              {renderMediaItem({ item })}
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.galleryContainer}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="image" size={60} color="#666666" />
          </View>
          <Text style={styles.emptyText}>No Media</Text>
          <Text style={styles.emptySubtext}>Upload a photo or take one to get started</Text>
        </View>
      )}

      {/* Floating Footer */}
      <View style={styles.floatingFooter}>
        <TouchableOpacity style={styles.footerButton} onPress={handleUploadPress}>
          <Feather name="plus" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleCameraPress}>
          <Feather name="camera" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleProfilePress}>
          <Feather name="user" size={24} color="#000000" />
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
  sectionHeader: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Media Item
  mediaItem: {
    width: '100%',
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
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12, // Reduced from 20
    paddingHorizontal: 20, // Reduced from 40
    backgroundColor: '#1a1a1a',
    borderRadius: 25, // Reduced from 30
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2, // Reduced shadow
    },
    shadowOpacity: 0.2, // Reduced opacity
    shadowRadius: 4, // Reduced radius
    elevation: 4, // Reduced elevation
  },
  footerButton: {
    width: 50, // Reduced from 60
    height: 50, // Reduced from 60
    borderRadius: 25, // Reduced from 30
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
