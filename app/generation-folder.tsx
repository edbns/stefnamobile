import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function GenerationFolderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const folderName = params.folderName as string;
  const folderData = JSON.parse(params.folderData as string);

  const handleMediaPress = (item: any) => {
    // Navigate to fullscreen media view
    router.push({
      pathname: '/media-viewer',
      params: { 
        imageUrl: item.cloudUrl || item.localUri,
        prompt: item.prompt || '',
        preset: folderName,
        date: new Date(item.createdAt).toLocaleDateString()
      }
    });
  };

  const renderMediaItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.mediaItem} 
      onPress={() => handleMediaPress(item)}
    >
      <Image 
        source={{ uri: item.cloudUrl || item.localUri }} 
        style={styles.mediaImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{folderName}</Text>
          <Text style={styles.headerSubtitle}>{folderData.length} photos</Text>
        </View>
      </View>

      {/* Photo Grid */}
      <FlatList
        data={folderData}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 16,
    marginTop: 4,
  },
  gridContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
});
