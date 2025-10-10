import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMediaStore } from '../src/stores/mediaStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../src/constants/colors';
import { X, Download, Share2, Trash2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { media, deleteMedia } = useMediaStore();

  const mediaId = params.mediaId as string;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Find current media item
  const mediaIndex = media?.findIndex((m: any) => m.id === mediaId) || 0;
  
  // Set initial index
  React.useEffect(() => {
    setCurrentIndex(mediaIndex);
  }, [mediaIndex]);

  const currentMedia = media?.[currentIndex];
  const imageUrl = currentMedia?.cloudUrl || currentMedia?.localUri;

  const handleSave = async () => {
    if (!imageUrl) return;
    
    try {
      setIsSaving(true);
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access.');
        return;
      }

      const filename = `stefna_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.createAssetAsync(fileUri);
      
      Alert.alert('Saved', 'Image saved to your photos');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      setIsSharing(true);
      
      const filename = `stefna_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.downloadAsync(imageUrl, fileUri);
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    if (!currentMedia) return;
    
    Alert.alert(
      'Delete Image',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteMedia(currentMedia.id, currentMedia.cloudId);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderImage = ({ item }: { item: any }) => {
    const url = item.cloudUrl || item.localUri;
    
    console.log('🖼️ [MediaViewer] Rendering image:', {
      id: item.id,
      url: url?.substring(0, 50),
      hasCloudUrl: !!item.cloudUrl,
      hasLocalUri: !!item.localUri,
    });
    
    if (!url) {
      return (
        <View style={styles.imageSlide}>
          <Text style={styles.errorText}>Image URL not found</Text>
        </View>
      );
    }

  return (
      <View style={styles.imageSlide}>
          <Image
          source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
          onError={(error) => console.error('Image load error:', error)}
          onLoad={() => console.log('✅ Image loaded:', url.substring(0, 50))}
        />
      </View>
    );
  };

  if (!media || media.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No media found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={media}
        renderItem={renderImage}
        keyExtractor={(item: any) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={mediaIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={() => {
          // Fallback if initial scroll fails
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: mediaIndex, animated: false });
          }, 100);
        }}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(newIndex);
        }}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        {/* Image Counter */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {media.length}
            </Text>
          </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <>
              <Download size={20} color={COLORS.text} />
              <Text style={styles.actionButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <>
              <Share2 size={20} color={COLORS.text} />
              <Text style={styles.actionButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <Trash2 size={20} color={COLORS.error} />
              <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
                Delete
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  topBar: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  counter: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: 60,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.sm,
  },
  buttonText: {
    color: COLORS.buttonPrimaryText,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
