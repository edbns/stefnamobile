import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function MediaViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const imageUrl = params.imageUrl as string;
  const prompt = params.prompt as string;
  const preset = params.preset as string;
  const date = params.date as string;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this AI-generated image I created with Stefna! 
        
Prompt: "${prompt}"
Style: ${preset}
        
Created with Stefna - AI Photo Transformations
Download the app: https://stefna.xyz`,
        url: imageUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share image. Please try again.');
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Fullscreen Image */}
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.fullscreenImage}
        resizeMode="contain"
      />
      
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
          <Feather name="share" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.presetText}>{preset}</Text>
        <Text style={styles.promptText} numberOfLines={2}>{prompt}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  presetText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promptText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dateText: {
    color: '#888888',
    fontSize: 12,
  },
});
