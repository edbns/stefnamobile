import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Image,
  SectionList,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMediaStore } from '../src/stores/mediaStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImagePickerService } from '../src/services/imagePickerService';

export default function MainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { media, isLoading, loadUserMedia, deleteMedia } = useMediaStore();
  const { refreshBalance } = useCreditsStore();
  const [sections, setSections] = useState<any[]>([]);

  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Animation states for footer buttons
  const [profileAnim] = useState(new Animated.Value(1));
  const [mediaAnim] = useState(new Animated.Value(1));
  const [editAnim] = useState(new Animated.Value(1));

  // Load user's media on mount
  useEffect(() => {
    if (user?.id) {
      loadUserMedia();
      refreshBalance();
    }
  }, [user?.id, loadUserMedia, refreshBalance]);

  // Group media by mode/type
  useEffect(() => {
    const normalizeType = (item: any): string => {
      const rawType = (item.type || '').toString().toLowerCase().replace(/-/g, '_');
      if (rawType) return rawType;
      const key = (item.presetKey || '').toString().toLowerCase();
      if (key.startsWith('ghibli')) return 'ghibli_reaction';
      if (key.startsWith('emotion_mask')) return 'emotion_mask';
      if (key.startsWith('neo') || key.includes('glitch')) return 'neo_glitch';
      if (key.includes('edit')) return 'edit';
      if (key.includes('custom')) return 'custom_prompt';
      return 'presets';
    };

    const labelFor = (item: any): string => {
      const type = normalizeType(item);
      switch (type) {
        case 'neo_glitch':
          return 'Neo Tokyo Glitch';
        case 'emotion_mask':
          return 'Emotion Mask';
        case 'ghibli_reaction':
          return 'Ghibli Reaction';
        case 'custom_prompt':
          return 'Custom';
        case 'edit':
          return 'Studio';
        default:
          return 'Presets';
      }
    };

    const groups: Record<string, any[]> = {};
    for (const m of media || []) {
      const key = labelFor(m);
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    const orderedTitles = ['Neo Tokyo Glitch', 'Emotion Mask', 'Ghibli Reaction', 'Presets', 'Custom', 'Studio'];
    const s = Object.keys(groups)
      .sort((a, b) => orderedTitles.indexOf(a) - orderedTitles.indexOf(b))
      .map(title => ({ title, data: groups[title] }));
    setSections(s);
  }, [media]);

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleUploadPress = async () => {
    try {
      console.log('Upload button pressed');

      // Use unified image picker service
      const result = await ImagePickerService.pickFromGallery();

      if (result.success && result.uri) {
        console.log('Selected image:', result.uri);
        // Navigate to generation screen with selected image
        router.push({
          pathname: '/generate',
          params: { selectedImage: result.uri }
        });
      } else {
        // Handle errors or cancellation
        if (result.error === 'Media library permission denied') {
          ImagePickerService.showErrorAlert(
            'Permission Required',
            'Please grant photo library access to upload images. You can enable this in your device settings.',
            () => handleUploadPress(),
            () => {}
          );
          return;
        }
        
        if (result.error === 'Image selection cancelled') {
          console.log('Image selection was canceled');
          return;
        }
        
        // Other errors
        ImagePickerService.showErrorAlert(
          'Upload Failed',
          'Unable to access photo library. This might be due to device restrictions. Please try again or use the camera instead.',
          () => handleUploadPress(),
          () => handleCameraPress()
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      ImagePickerService.showErrorAlert(
        'Upload Failed',
        'Unable to access photo library. This might be due to device restrictions. Please try again or use the camera instead.',
        () => handleUploadPress(),
        () => handleCameraPress()
      );
    }
  };

  const handleEditPress = () => {
    // Magic animation
    Animated.sequence([
      Animated.timing(editAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(editAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    router.push('/edit');
  };

  const handleMediaPress = () => {
    // Magic animation
    Animated.sequence([
      Animated.timing(mediaAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(mediaAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Already on media screen, no action needed
  };

  const handleProfilePress = () => {
    // Magic animation
    Animated.sequence([
      Animated.timing(profileAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(profileAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    router.push('/profile');
  };

  const renderFolderItem = ({ section }: { section: any }) => {
    const handleFolderPress = () => {
      // Navigate to folder view with all photos of this generation type
      router.push({
        pathname: '/generation-folder',
        params: { 
          folderName: section.title,
          folderData: JSON.stringify(section.data)
        }
      });
    };

    // Get the most recent image as folder cover
    const coverImage = section.data[0];

    return (
      <TouchableOpacity style={styles.folderItem} onPress={handleFolderPress}>
        <View style={styles.folderImage}>
          {coverImage?.cloudUrl ? (
            <Image 
              source={{ uri: coverImage.cloudUrl }} 
              style={styles.folderImageContent}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.folderImagePlaceholder}>
              <Feather name="folder" size={40} color="#666666" />
            </View>
          )}
          {/* Transparent overlay with folder name and count */}
          <View style={styles.folderOverlay}>
            <Text style={styles.folderTitleOverlay}>{section.title}</Text>
            <Text style={styles.folderCountOverlay}>{section.data.length} photos</Text>
          </View>
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
        <FlatList
          data={sections}
          keyExtractor={(section) => section.title}
          renderItem={({ item: section, index }) => {
            // 2-column layout for folders
            const isLeft = index % 2 === 0;
            return (
              <View style={[
                styles.sectionItemWrapper, 
                styles.twoColumnItem,
                isLeft ? styles.leftColumn : styles.rightColumn
              ]}>
                {renderFolderItem({ section })}
              </View>
            );
          }}
          contentContainerStyle={styles.galleryContainer}
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
      <View style={styles.footerContainer}>
        <View style={styles.floatingFooter}>
        
        <Animated.View style={[styles.footerButtonWrapper, { transform: [{ scale: profileAnim }] }]}>
          <TouchableOpacity style={styles.footerButton} onPress={handleProfilePress}>
            <Feather name="user" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.footerButtonWrapper, { transform: [{ scale: mediaAnim }] }]}>
          <TouchableOpacity style={styles.footerButton} onPress={handleMediaPress}>
            <Feather name="image" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.footerButtonWrapper, { transform: [{ scale: editAnim }] }]}>
          <TouchableOpacity style={styles.footerButton} onPress={handleEditPress}>
            <Feather name="edit-3" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
        </View>
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionCount: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  twoColumnItem: {
    width: '50%',
  },
  leftColumn: {
    paddingRight: 6,
  },
  rightColumn: {
    paddingLeft: 6,
  },
  sectionItemWrapper: {
    marginBottom: 16,
    paddingTop: 20,
  },
  // Folder styles
  folderItem: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  folderImage: {
    position: 'relative',
    aspectRatio: 1, // Square aspect ratio
  },
  folderImageContent: {
    width: '100%',
    height: '100%',
  },
  folderImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  folderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderTitleOverlay: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  folderCountOverlay: {
    color: '#cccccc',
    fontSize: 13,
    fontWeight: '500',
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
    height: 200, // Fixed height to ensure images display
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

  // Footer Container
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Floating Footer - No background, just floating icons
  floatingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 40,
    position: 'relative',
    minWidth: 280,
    maxWidth: 350,
  },
  techGridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 28,
    opacity: 0.1,
    // Tech grid pattern using borders
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  digitalLinesOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 0.5,
  },
  footerButtonWrapper: {
    zIndex: 2,
  },
  footerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
