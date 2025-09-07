import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react-native';

export default function UploadScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      // Navigate back to main with the selected image
      router.replace({
        pathname: '/main',
        params: { selectedImage: result.assets[0].uri }
      });
    }
  };

  const closeUpload = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Image</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeUpload}
        >
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={pickImage}
          >
            <View style={styles.iconContainer}>
              <ImageIcon size={48} color="#ffffff" />
            </View>
            <Text style={styles.optionTitle}>From Gallery</Text>
            <Text style={styles.optionSubtitle}>Choose from your photos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Upload Instructions</Text>
          <Text style={styles.instructionText}>
            • Select a high-quality image{'\n'}
            • Square images work best{'\n'}
            • Supported formats: JPG, PNG{'\n'}
            • Maximum size: 10MB
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  uploadOptions: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadOption: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  optionSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});
