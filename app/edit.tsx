import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function EditScreen() {
  const router = useRouter();

  const modeCards = [
    {
      id: 'custom',
      title: 'Custom',
      subtitle: 'Create with your own prompt',
      icon: 'edit-3',
      color: '#6366f1',
    },
    {
      id: 'studio',
      title: 'Studio',
      subtitle: 'Professional editing',
      icon: 'camera',
      color: '#8b5cf6',
    },
    {
      id: 'emotion_mask',
      title: 'Emotion Mask',
      subtitle: 'Express your emotions',
      icon: 'smile',
      color: '#f59e0b',
    },
    {
      id: 'neo_glitch',
      title: 'Neo Tokyo Glitch',
      subtitle: 'Cyberpunk aesthetic',
      icon: 'zap',
      color: '#10b981',
    },
    {
      id: 'ghibli',
      title: 'Ghibli Reaction',
      subtitle: 'Anime magic',
      icon: 'heart',
      color: '#ef4444',
    },
    {
      id: 'presets',
      title: 'Presets',
      subtitle: 'Quick transformations',
      icon: 'layers',
      color: '#06b6d4',
    },
  ];

  const handleModePress = (modeId: string) => {
    // Navigate to upload/camera screen with selected mode
    router.push({
      pathname: '/upload-mode',
      params: { mode: modeId }
    });
  };

  const renderModeCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.modeCard, { backgroundColor: item.color }]} 
        onPress={() => handleModePress(item.id)}
      >
        <View style={styles.cardContent}>
          <Feather name={item.icon as any} size={32} color="#ffffff" />
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Style</Text>
        <Text style={styles.headerSubtitle}>Select a mode to start creating</Text>
      </View>

      {/* Mode Cards Grid */}
      <FlatList
        data={modeCards}
        keyExtractor={(item) => item.id}
        renderItem={renderModeCard}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for floating footer
  },
  row: {
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
