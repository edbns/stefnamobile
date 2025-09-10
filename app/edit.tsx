import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

export default function EditScreen() {
  const router = useRouter();

  const modeCards = [
    {
      id: 'custom',
      title: 'Custom',
      subtitle: 'Describe. Create.',
      icon: 'edit-3',
      style: 'custom',
    },
    {
      id: 'studio',
      title: 'Studio',
      subtitle: 'Tools for precision.',
      icon: 'camera',
      style: 'studio',
    },
    {
      id: 'emotion_mask',
      title: 'Emotion Mask',
      subtitle: 'Faces that feel.',
      icon: 'smile',
      style: 'emotion',
    },
    {
      id: 'neo_glitch',
      title: 'Neo Tokyo',
      subtitle: 'Future meets the face.',
      icon: 'zap',
      style: 'glitch',
    },
    {
      id: 'ghibli',
      title: 'Ghibli Reaction',
      subtitle: 'Animated emotions.',
      icon: 'heart',
      style: 'ghibli',
    },
    {
      id: 'presets',
      title: 'Presets',
      subtitle: 'One-tap styles.',
      icon: 'layers',
      style: 'presets',
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
    const getCardContent = () => {
      switch (item.style) {
        case 'custom':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#18181b' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.gridPattern} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        case 'studio':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#0f0f0f' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.techGrid} />
                <View style={styles.cameraFrame} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        case 'emotion':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#0f0f0f' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.emotionGlow} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        case 'glitch':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#0f0f0f' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.glitchPattern} />
                <View style={styles.digitalLines} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        case 'ghibli':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#0f0f0f' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.magicCircles} />
                <View style={styles.sparkleDots} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        case 'presets':
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#0f0f0f' }]}>
              <View style={styles.cardOverlay}>
                <View style={styles.vintageLines} />
                <View style={styles.filmStrip} />
                <View style={styles.cardContent}>
                  <Feather name={item.icon as any} size={32} color="#ffffff" />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          );
        
        default:
          return (
            <View style={[styles.cardWrapper, { backgroundColor: '#18181b' }]}>
              <View style={styles.cardContent}>
                <Feather name={item.icon as any} size={32} color="#ffffff" />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          );
      }
    };

    return (
      <TouchableOpacity 
        style={styles.modeCard} 
        onPress={() => handleModePress(item.id)}
        activeOpacity={0.8}
      >
        {getCardContent()}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Transparent Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main')}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Style it Your Way</Text>
          <Text style={styles.headerSubtitle}>Select a mode to start creating</Text>
        </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
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
    paddingTop: 120,
    paddingBottom: 100, // Space for floating footer
  },
  row: {
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardOverlay: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Pattern Styles
  gridPattern: {
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
  emotionGlow: {
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
});
