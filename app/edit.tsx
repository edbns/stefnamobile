import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

export default function EditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedImage = params.selectedImage as string;

  const modeCards = [
    {
      id: 'custom',
      title: 'Custom',
    },
    {
      id: 'studio',
      title: 'Studio',
    },
    {
      id: 'unreal_reflection',
      title: 'Unreal Reflection',
    },
    {
      id: 'neo_glitch',
      title: 'Neo Tokyo',
    },
    {
      id: 'ghibli',
      title: 'Ghibli Reaction',
    },
    {
      id: 'presets',
      title: 'Presets',
    },
    {
      id: 'parallel_self',
      title: 'Parallel Self',
    },
  ];

  const handleModePress = (modeId: string) => {
    // Navigate to the specific generation screen for each mode
    const screenMap: { [key: string]: string } = {
      'custom': '/generate-custom',
      'studio': '/generate-studio', 
      'unreal_reflection': '/generate-unreal-reflection',
      'neo_glitch': '/generate-neo',
      'ghibli': '/generate-ghibli',
      'presets': '/generate-presets',
      'parallel_self': '/generate-parallel-self'
    };
    
    const screenPath = screenMap[modeId] || '/generate-presets';
    
    router.push({
      pathname: screenPath,
      params: { 
        selectedImage: selectedImage
      }
    });
  };


  const renderModeCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.modeCard} 
        onPress={() => handleModePress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardWrapper}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Cards Grid */}
      <FlatList
        data={modeCards}
        keyExtractor={(item) => item.id}
        renderItem={renderModeCard}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Style it Your Way</Text>
            <Text style={styles.subtitle}>Select a mode to start creating</Text>
          </View>
        )}
      />

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={() => router.push('/main')}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
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
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 80, // Space for floating back button
    paddingBottom: 100, // Space for floating footer
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-around',
  },
  modeCard: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 16,
    marginHorizontal: '1.5%',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },

  // Floating Back Button
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  techGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'solid',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cameraFrame: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  unrealReflectionGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 50,
    transform: [{ translateX: -50 }, { translateY: -50 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  glitchPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'solid',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  digitalLines: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: '60%',
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  magicCircles: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 50,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sparkleDots: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '70%',
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dotted',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  vintageLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'solid',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  filmStrip: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    width: '80%',
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  // Floating Back Button
  headerRow: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    paddingTop: 40, 
    paddingLeft: 8, 
    zIndex: 1000 
  },
  iconBackButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#000000', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});
