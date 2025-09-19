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
  RefreshControl,
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
import { Skeleton, SkeletonMediaFolder } from '../src/components/Skeleton';

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
  const [refreshing, setRefreshing] = useState(false);

  // Check if there are any active generations
  const isGenerating = activeGenerations.some(gen => 
    gen.status === 'pending' || gen.status === 'processing'
  );


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
      if (key.startsWith('unreal_reflection')) return 'unreal_reflection';
      if (key.startsWith('neo') || key.includes('glitch')) return 'neo_glitch';
      if (key.startsWith('parallel_self') || key.includes('parallel')) return 'parallel_self';
      if (key.includes('edit')) return 'edit_photo';
      if (key.includes('custom')) return 'custom_prompt';
      return 'presets';
    };

    const labelFor = (item: any): string => {
      const type = normalizeType(item);
      switch (type) {
        case 'neo_glitch':
          return 'Neo Tokyo Glitch';
        case 'unreal_reflection':
          return 'Unreal Reflection';
        case 'ghibli_reaction':
          return 'Ghibli Reaction';
        case 'parallel_self':
          return 'Parallel Self';
        case 'custom_prompt':
          return 'Custom';
        case 'edit_photo':
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
    
    const orderedTitles = ['All Media', 'Neo Tokyo Glitch', 'Unreal Reflection', 'Ghibli Reaction', 'Presets', 'Custom', 'Studio'];
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
      // Use the unified image picker that shows both camera and gallery options
      const result = await ImagePickerService.pickFromGallery();
      
      if (result.success && result.uri) {
        // Navigate to edit screen with selected image
        router.push({
          pathname: '/edit',
          params: { selectedImage: result.uri }
        });
      } else {
        // User cancelled or permission denied - stay on current screen
        console.log('Photo selection cancelled or permission denied');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleMediaPress = () => {
    // Already on media screen, no action needed
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserMedia();
      await refreshBalance();
    } finally {
      setRefreshing(false);
    }
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
      {/* Media Gallery */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array.from({ length: 6 })}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => <SkeletonMediaFolder style={styles.skeletonCard} />}
            contentContainerStyle={styles.galleryContainer}
            showsVerticalScrollIndicator={false}
            numColumns={2}
          />
        </View>
      ) : sections && sections.length > 0 ? (
        <FlatList
          data={sections}
          keyExtractor={(section) => section.title}
          renderItem={renderFolderItem}
          contentContainerStyle={styles.galleryContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ffffff"
              colors={['#ffffff']}
            />
          }
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

      {/* Bottom Footer */}
      <View style={styles.bottomFooter}>
        <TouchableOpacity style={styles.footerButton} onPress={handleProfilePress}>
          <Feather name="user" size={24} color="#ffffff" />
          <Text style={styles.footerButtonText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={handleUploadPress}>
          <Feather name="plus" size={24} color="#ffffff" />
          <Text style={styles.footerButtonText}>Upload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={handleMediaPress}>
          <Feather name="image" size={24} color="#ffffff" />
          <Text style={styles.footerButtonText}>Gallery</Text>
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
    paddingHorizontal: 20,
  },
  skeletonCard: {
    marginHorizontal: 6,
    marginBottom: 12,
    flex: 1,
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
    paddingTop: 20, // Reduced top margin since no floating footer
    paddingBottom: 20, // Reduced bottom margin since we have bottom footer
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

  // Bottom Footer
  bottomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 34, // Account for safe area
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: '500',
  },
});

