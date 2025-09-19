import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { navigateBack } from '../src/utils/navigation';

export default function HelpCenterScreen() {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL('mailto:hello@stefna.xyz?subject=Help Request');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>Need assistance? We're here to help.</Text>
          
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Support</Text>
            <Text style={styles.contactText}>
              If you have any questions or need help with Stefna, please contact our support team.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
              <Feather name="mail" size={20} color="#000000" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <Text style={styles.contactEmail}>hello@stefna.xyz</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Stefna</Text>
            <Text style={styles.infoText}>
              Stefna is an AI-powered photo and video editing platform that transforms your photos into stunning AI art with cinematic effects, anime reactions, glitch art, and more.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBackButton} onPress={() => navigateBack.toMain()}>
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
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 32,
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#4A9EFF',
    textDecorationLine: 'underline',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
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