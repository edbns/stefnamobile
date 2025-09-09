import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const columnWidth = (width - 6) / 3; // 3 columns with 2px margin each

// Grid images - 9 images for 3x3 grid
const backgroundImages = [
  require('../assets/w1.jpg'),
  require('../assets/w2.jpg'),
  require('../assets/w3.jpg'),
  require('../assets/w4.jpg'),
  require('../assets/w5.jpg'),
  require('../assets/w6.jpg'),
  require('../assets/w7.jpg'),
  require('../assets/w8.jpg'),
  require('../assets/w9.jpg'),
];

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      {/* Background Image Grid */}
      <View style={styles.imageGrid}>
        {backgroundImages.map((image, index) => {
          const src = Image.resolveAssetSource(image);
          const aspect = src && src.width && src.height ? src.width / src.height : 1;
          return (
            <View key={index} style={styles.imageContainer}> 
              <Image
                source={image}
                style={[styles.backgroundImage, { aspectRatio: aspect }]}
              />
            </View>
          );
        })}
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

        {/* Legal Text with clickable links */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>By proceeding, you agree to our </Text>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}> & </Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
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
    width: columnWidth,
    // No margin, border radius, or overflow for fullscreen effect
  },
  backgroundImage: {
    width: '100%',
    height: undefined,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker for better text readability
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
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    lineHeight: 16,
  },
  legalLink: {
    fontSize: 12,
    color: '#ffffff',
    textDecorationLine: 'underline',
    fontWeight: '600',
    lineHeight: 16,
  },
});
