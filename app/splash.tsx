import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

interface GeometricShape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'hexagon';
  size: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  color: string;
  animationDelay: number;
}

const generateRandomShapes = (): GeometricShape[] => {
  const shapes: GeometricShape[] = [];
  const shapeTypes: Array<'circle' | 'square' | 'triangle' | 'hexagon'> = ['circle', 'square', 'triangle', 'hexagon'];
  const colors = [
    'rgba(255, 255, 255, 0.08)',
    'rgba(255, 255, 255, 0.06)',
    'rgba(255, 255, 255, 0.04)',
    'rgba(255, 255, 255, 0.12)',
    'rgba(255, 255, 255, 0.05)',
  ];

  for (let i = 0; i < 25; i++) {
    shapes.push({
      id: `shape-${i}`,
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      size: Math.random() * 60 + 20,
      x: Math.random() * width,
      y: Math.random() * height,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: Math.random() * 1000,
    });
  }
  return shapes;
};

export default function SplashScreen() {
  const [shapes] = useState<GeometricShape[]>(() => generateRandomShapes());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const logoOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate background shapes
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderShape = (shape: GeometricShape) => {
    const animatedStyle = {
      opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, shape.opacity],
      }),
      transform: [
        { rotate: `${shape.rotation}deg` },
        { scale: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }) },
      ],
    };

    const baseStyle = {
      position: 'absolute' as const,
      left: shape.x,
      top: shape.y,
      width: shape.size,
      height: shape.size,
      backgroundColor: shape.color,
    };

    switch (shape.type) {
      case 'circle':
        return (
          <Animated.View
            key={shape.id}
            style={[
              baseStyle,
              { borderRadius: shape.size / 2 },
              animatedStyle,
            ]}
          />
        );
      case 'square':
        return (
          <Animated.View
            key={shape.id}
            style={[
              baseStyle,
              { borderRadius: 8 },
              animatedStyle,
            ]}
          />
        );
      case 'triangle':
        return (
          <Animated.View
            key={shape.id}
            style={[
              baseStyle,
              {
                backgroundColor: 'transparent',
                borderLeftWidth: shape.size / 2,
                borderRightWidth: shape.size / 2,
                borderBottomWidth: shape.size,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: shape.color,
                width: 0,
                height: 0,
              },
              animatedStyle,
            ]}
          />
        );
      case 'hexagon':
        return (
          <Animated.View
            key={shape.id}
            style={[
              baseStyle,
              { borderRadius: shape.size / 4 },
              animatedStyle,
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Animated geometric shapes */}
      {shapes.map(renderShape)}
      
      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={`particle-${i}`}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 0.4 + 0.1],
                }),
              },
            ]}
          />
        ))}
      </View>

      {/* Central logo with branding */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: scaleAnim }] }]}>
          {/* Logo glow effect */}
          <View style={styles.logoGlow} />
          
          {/* Main logo */}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
        </Animated.View>
      </Animated.View>

      {/* Bottom decorative elements */}
      <View style={styles.bottomDecorations}>
        <View style={styles.decorativeLine} />
        <View style={[styles.decorativeLine, { width: '60%', marginTop: 8 }]} />
        <View style={[styles.decorativeLine, { width: '40%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logo: {
    width: 80,
    height: 80,
    zIndex: 2,
  },
  bottomDecorations: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  decorativeLine: {
    height: 2,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
  },
});
