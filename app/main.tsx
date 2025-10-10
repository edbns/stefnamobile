import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMediaStore } from '../src/stores/mediaStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { useGenerationStore } from '../src/stores/generationStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../src/constants/colors';
import { Plus, User, LogOut } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SPACING = 2;
const NUM_COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - (GRID_SPACING * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

export default function MainScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { media, isLoading, loadUserMedia } = useMediaStore();
  const { balance, refreshBalance } = useCreditsStore();
  const { activeGenerations } = useGenerationStore();
  const [refreshing, setRefreshing] = useState(false);

  // Check if there are any active generations
  const isGenerating = activeGenerations.some(gen => 
    gen.status === 'pending' || gen.status === 'processing'
  );

  // Load data on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Main screen focused - loading data...');
      loadUserMedia();
      if (user?.id) {
        refreshBalance();
      }
    }, [user?.id, loadUserMedia, refreshBalance])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserMedia();
    await refreshBalance();
    setRefreshing(false);
  };

  const handleMediaPress = (item: any) => {
    router.push({
      pathname: '/media-viewer',
      params: { mediaId: item.id }
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/welcome');
  };

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.mediaItem, { width: IMAGE_SIZE, height: IMAGE_SIZE }]}
        onPress={() => handleMediaPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  // Add loading placeholders for active generations
  const renderGeneratingPlaceholder = ({ index }: { index: number }) => {
    return (
      <View
        style={[
          styles.mediaItem,
          styles.placeholderItem,
          { width: IMAGE_SIZE, height: IMAGE_SIZE }
        ]}
      >
        <ActivityIndicator size="small" color={COLORS.textSecondary} />
      </View>
    );
  };

  const allItems = [
    ...activeGenerations.map((_, i) => ({ id: `gen-${i}`, isPlaceholder: true })),
    ...(media || [])
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>{balance || 0} credits</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <User size={20} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Grid */}
      {isLoading && !media?.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.textSecondary} />
          <Text style={styles.loadingText}>Loading your gallery...</Text>
        </View>
      ) : (
        <FlatList
          data={allItems}
          renderItem={({ item, index }) => 
            'isPlaceholder' in item && item.isPlaceholder
              ? renderGeneratingPlaceholder({ index })
              : renderMediaItem({ item, index })
          }
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.textSecondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No media yet</Text>
              <Text style={styles.emptySubtext}>Create your first image!</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/composer')}
        activeOpacity={0.9}
      >
        <Plus size={24} color={COLORS.buttonPrimaryText} />
      </TouchableOpacity>

      {/* Generation Indicator */}
      {isGenerating && (
        <View style={styles.generatingBanner}>
          <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
          <Text style={styles.generatingText}>Generating...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logo: {
    width: 80,
    height: 30,
  },
  creditsContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  creditsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: GRID_SPACING,
  },
  row: {
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  mediaItem: {
    backgroundColor: COLORS.surface,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  placeholderItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 3,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generatingBanner: {
    position: 'absolute',
    top: 80,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  generatingText: {
    color: COLORS.buttonPrimaryText,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
