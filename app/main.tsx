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
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMediaStore } from '../src/stores/mediaStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { useGenerationStore } from '../src/stores/generationStore';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImagePickerService } from '../src/services/imagePickerService';
import ModernSpinner from '../src/components/ModernSpinner';

export default function MainScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { media, isLoading, loadUserMedia, deleteMedia } = useMediaStore();
  const { refreshBalance } = useCreditsStore();
  const { activeGenerations } = useGenerationStore();
  const [sections, setSections] = useState<any[]>([]);

  console.log('🔍 [MainScreen] Current state:', { 
    mediaCount: media?.length || 0, 
    isLoading, 
    sectionsCount: sections.length,
    media: media,
    sections: sections
  });

  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Check if there are any active generations
  const isGenerating = activeGenerations.some(gen => 
    gen.status === 'pending' || gen.status === 'processing'
  );

  // Animation states for footer buttons
  const [profileAnim] = useState(new Animated.Value(1));
  const [mediaAnim] = useState(new Animated.Value(1));
  const [editAnim] = useState(new Animated.Value(1));

  // Load user's media on mount
  useEffect(() => {
    console.log('🚀 [MainScreen] useEffect triggered - loading media');
    // Always load media for demo purposes
    loadUserMedia();
    if (user?.id) {
      refreshBalance();
    }
  }, [user?.id, loadUserMedia, refreshBalance]);

  // Group media by mode/type
  useEffect(() => {
    console.log('📁 [MainScreen] Grouping media - START:', {
      totalMedia: media?.length || 0,
      isLoading: isLoading,
      mediaTypes: media?.map(m => ({ type: m.type, presetKey: m.presetKey, prompt: m.prompt?.substring(0, 50) })) || [],
      media: media
    });

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
    
    // Add "All Media" folder with all media
    if (media && media.length > 0) {
      groups['All Media'] = [...media]; // Copy all media for All Media folder
    }
    
    // Group media by mode/type for individual folders
    for (const m of media || []) {
      const key = labelFor(m);
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    
    // Sort each group by creation date (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
    });
    
    const orderedTitles = ['All Media', 'Neo Tokyo Glitch', 'Emotion Mask', 'Ghibli Reaction', 'Presets', 'Custom', 'Studio'];
    const s = Object.keys(groups)
      .sort((a, b) => orderedTitles.indexOf(a) - orderedTitles.indexOf(b))
      .map(title => ({ title, data: groups[title] }));
    
    console.log('📁 [MainScreen] Final folders:', {
      folderCount: s.length,
      folders: s.map(f => ({ title: f.title, count: f.data.length })),
      sections: s
    });
    
    setSections(s);
  }, [media]);

  const handleCameraPress = async () => {
    try {
      const result = await ImagePickerService.captureFromCamera();
      if (result.success && result.uri) {
        const normalizedUri = await ImagePickerService.normalizeImage(result.uri, result.exif, result.cameraType);
        // Navigate to generate screen with captured image
        router.push({
          pathname: '/generate',
          params: { selectedImage: normalizedUri }
        });
      } else {
        ImagePickerService.showErrorAlert(
          'Camera Error',
          result.error || 'Failed to capture image',
          () => handleCameraPress(),
          () => {}
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      ImagePickerService.showErrorAlert(
        'Camera Error',
        'Failed to capture image. Please try again.',
        () => handleCameraPress(),
        () => {}
      );
    }
  };

  const handleUploadPress = async () => {
    try {
      console.log('Upload button pressed');

      // Use unified image picker service
      const result = await ImagePickerService.pickFromGallery();

      if (result.success && result.uri) {
        console.log('Selected image:', result.uri);
        // Navigate to generate screen with selected image
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

  // Component for folder items that can use hooks
  const FolderItem = ({ section }: { section: any }) => {
    const handleFolderPress = () => {
      router.push({
        pathname: '/generation-folder',
        params: { 
          folderName: section.title,
          folderData: JSON.stringify(section.data)
        }
      });
    };

    const coverImage = section.data[0];

    return (
      <TouchableOpacity style={styles.folderItem} onPress={handleFolderPress}>
        <View style={styles.folderImage}>
          {coverImage?.cloudUrl ? (
            <Image 
              source={{ uri: coverImage.cloudUrl }} 
              style={styles.folderImageContent}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.folderImagePlaceholder}>
              <Feather name="folder" size={40} color="#666666" />
            </View>
          )}
          <View style={styles.folderOverlay}>
            <Text style={styles.folderTitleOverlay}>{section.title}</Text>
            <Text style={styles.folderCountOverlay}>{section.data.length} photos</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFolderItem = ({ item }: { item: any }) => {
    return <FolderItem section={item} />;
  };

  return (
    <View style={styles.container}>
      {/* Media Gallery - Full Screen */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : sections && sections.length > 0 ? (
        <FlatList
          data={sections}
          keyExtractor={(section) => section.title}
          renderItem={renderFolderItem}
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
          <TouchableOpacity 
            style={styles.footerButton} 
            onPress={handleEditPress}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ModernSpinner size={20} color="#ffffff" />
            ) : (
              <Feather name="edit-3" size={20} color="#ffffff" />
            )}
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
    fontSize: 18,
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
    paddingTop: 60, // Increased top margin for better spacing
    paddingBottom: 100, // Space for floating footer
    paddingHorizontal: 16, // Add horizontal padding for 2 columns
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionCount: {
    color: '#888888',
    fontSize: 14,
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
    marginBottom: 12, // Vertical margin between rows
    marginHorizontal: 6, // Horizontal margin between columns (12px total)
    flex: 1, // Ensure equal width for 2 columns
  },
  folderImage: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Square folders
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Less transparent (was 0.8)
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderTitleOverlay: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  folderCountOverlay: {
    color: '#cccccc',
    fontSize: 11,
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
