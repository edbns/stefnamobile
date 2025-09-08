import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Your 7 generated photos from the website
const backgroundImages = [
  { uri: '/Sparckle .jpg' },
  { uri: '/Love.jpg' },
  { uri: '/Tropical Boost .jpg' },
  { uri: '/Ghibli Shock .jpg' },
  { uri: '/n1.webp' },
  { uri: '/fEPl_JYGAuU_JRdHY3R5L.jpeg' },
  { uri: '/owl.webp' },
  // Add 2 more to fill the 3x3 grid (9 total)
  { uri: '/Sparckle .jpg' },
  { uri: '/Love.jpg' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/main');
  };

  return (
    <View style={styles.container}>
      {/* Background Image Grid */}
      <View style={styles.imageGrid}>
        {backgroundImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={image} 
              style={styles.backgroundImage}
              onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
              onLoad={() => console.log('Image loaded:', image.uri)}
            />
          </View>
        ))}
      </View>

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>Welcome to Stefna</Text>
          <Text style={styles.subtitle}>One photo. One transformation. Which preset?</Text>
          
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Text */}
        <Text style={styles.legalText}>
          By proceeding, you agree to our Terms of Use & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    width: width / 3,
    height: height / 3,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
});
