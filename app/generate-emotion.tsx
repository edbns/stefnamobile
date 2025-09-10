import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import BaseGenerationScreen from '../src/components/BaseGenerationScreen';

interface EmotionMaskModeProps {
  onGenerate: (presetId?: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

function EmotionMaskMode({ onGenerate }: EmotionMaskModeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetAnims] = useState<{ [key: string]: Animated.Value }>({});

  const handlePresetClick = (presetId: string) => {
    console.log('Emotion preset clicked:', presetId);
    
    // Initialize animation if not exists
    if (!presetAnims[presetId]) {
      presetAnims[presetId] = new Animated.Value(1);
    }
    
    setSelectedPreset(presetId);
    
    // Magic animation on preset click
    Animated.sequence([
      Animated.timing(presetAnims[presetId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[presetId], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(presetAnims[presetId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onGenerate(presetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotion Mask</Text>
      <Text style={styles.subtitle}>Faces that feel.</Text>
      
      <View style={styles.presetContainer}>
        <View style={styles.presetGrid}>
          <View style={styles.presetRow}>
            <Animated.View 
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims['emotion_mask_nostalgia_distance'] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick('emotion_mask_nostalgia_distance')}
                style={styles.presetTouchable}
              >
                <LinearGradient
                  colors={selectedPreset === 'emotion_mask_nostalgia_distance' 
                    ? ['#ffffff', '#f0f0f0'] 
                    : ['#0f0f0f', '#1a1a1a']
                  }
                  style={styles.presetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === 'emotion_mask_nostalgia_distance' && styles.presetTextSelected
                  ]}>
                    Nostalgia + Distance
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims['emotion_mask_joy_sadness'] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick('emotion_mask_joy_sadness')}
                style={styles.presetTouchable}
              >
                <LinearGradient
                  colors={selectedPreset === 'emotion_mask_joy_sadness' 
                    ? ['#ffffff', '#f0f0f0'] 
                    : ['#0f0f0f', '#1a1a1a']
                  }
                  style={styles.presetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === 'emotion_mask_joy_sadness' && styles.presetTextSelected
                  ]}>
                    Joy + Sadness
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims['emotion_mask_conf_loneliness'] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick('emotion_mask_conf_loneliness')}
                style={styles.presetTouchable}
              >
                <LinearGradient
                  colors={selectedPreset === 'emotion_mask_conf_loneliness' 
                    ? ['#ffffff', '#f0f0f0'] 
                    : ['#0f0f0f', '#1a1a1a']
                  }
                  style={styles.presetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === 'emotion_mask_conf_loneliness' && styles.presetTextSelected
                  ]}>
                    Confidence + Loneliness
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <View style={styles.presetRow}>
            <Animated.View 
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims['emotion_mask_peace_fear'] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick('emotion_mask_peace_fear')}
                style={styles.presetTouchable}
              >
                <LinearGradient
                  colors={selectedPreset === 'emotion_mask_peace_fear' 
                    ? ['#ffffff', '#f0f0f0'] 
                    : ['#0f0f0f', '#1a1a1a']
                  }
                  style={styles.presetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === 'emotion_mask_peace_fear' && styles.presetTextSelected
                  ]}>
                    Peace + Fear
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.presetButtonWrapper,
                { transform: [{ scale: presetAnims['emotion_mask_strength_vuln'] || 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => handlePresetClick('emotion_mask_strength_vuln')}
                style={styles.presetTouchable}
              >
                <LinearGradient
                  colors={selectedPreset === 'emotion_mask_strength_vuln' 
                    ? ['#ffffff', '#f0f0f0'] 
                    : ['#0f0f0f', '#1a1a1a']
                  }
                  style={styles.presetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Magical glow overlay */}
                  <View style={styles.magicalGlowOverlay} />
                  
                  <Text style={[
                    styles.presetText,
                    selectedPreset === 'emotion_mask_strength_vuln' && styles.presetTextSelected
                  ]}>
                    Strength + Vulnerability
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function GenerateEmotionScreen() {
  return (
    <BaseGenerationScreen mode="emotion-mask">
      <EmotionMaskMode />
    </BaseGenerationScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  presetContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'column',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  presetTouchable: {
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  presetButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  magicalGlowOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    opacity: 0.3,
    // Radial glow effect
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  presetTextSelected: {
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
  },
});
