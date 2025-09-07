import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useGenerationStore } from '../src/stores/generationStore';
import MediaGallery from '../src/components/MediaGallery';
import { StorageService } from '../src/services/storageService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { jobQueue, loadJobHistory } = useGenerationStore();

  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    mediaCount: 0,
    syncedCount: 0,
  });

  useEffect(() => {
    loadStorageInfo();
    loadJobHistory();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await StorageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Load storage info error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const handleCleanupStorage = async () => {
    Alert.alert(
      'Clean Up Storage',
      'This will delete old images (keeping the 50 most recent). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean Up',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.cleanupStorage();
              await loadStorageInfo();
              Alert.alert('Success', 'Storage cleaned up successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clean up storage');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.creditsText}>Credits: {user?.credits || 0}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Text style={styles.storageValue}>{storageInfo.mediaCount}</Text>
              <Text style={styles.storageLabel}>Images</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageValue}>{formatFileSize(storageInfo.totalSize)}</Text>
              <Text style={styles.storageLabel}>Storage Used</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageValue}>{storageInfo.syncedCount}</Text>
              <Text style={styles.storageLabel}>Synced</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cleanupButton} onPress={handleCleanupStorage}>
            <Text style={styles.cleanupText}>Clean Up Storage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Generations</Text>
          <View style={styles.generationStats}>
            <Text style={styles.statsText}>
              Total: {jobQueue.length} generations
            </Text>
            <Text style={styles.statsText}>
              Completed: {jobQueue.filter(job => job.status === 'completed').length}
            </Text>
            <Text style={styles.statsText}>
              Failed: {jobQueue.filter(job => job.status === 'failed').length}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media Gallery</Text>
          <MediaGallery showDeleteOption={true} maxItems={12} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Invite Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back to Generate</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 14,
    color: '#cccccc',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  settingItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  storageItem: {
    alignItems: 'center',
  },
  storageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  storageLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  cleanupButton: {
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  cleanupText: {
    color: '#ffffff',
    fontSize: 14,
  },
  generationStats: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
  },
  statsText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 4,
  },
  backButton: {
    padding: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
