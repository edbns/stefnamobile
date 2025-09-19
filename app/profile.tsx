import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { Feather } from '@expo/vector-icons';
import { StorageService } from '../src/services/storageService';
import { navigateBack } from '../src/utils/navigation';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { balance, refreshBalance, initializeFromCache } = useCreditsStore();

  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    mediaCount: 0,
    syncedCount: 0,
  });

  useEffect(() => {
    loadStorageInfo();
    initializeFromCache();
    refreshBalance();
  }, [initializeFromCache, refreshBalance]);

  const loadStorageInfo = async () => {
    try {
      const info = await StorageService.getStorageInfo();
      if (info && typeof info === 'object') {
        setStorageInfo({
          totalSize: info.totalSize || 0,
          mediaCount: info.mediaCount || 0,
          syncedCount: info.syncedCount || 0,
        });
      } else {
        console.warn('StorageService.getStorageInfo() returned invalid data:', info);
        setStorageInfo({
          totalSize: 0,
          mediaCount: 0,
          syncedCount: 0,
        });
      }
    } catch (error) {
      console.error('Load storage info error:', error);
      setStorageInfo({
        totalSize: 0,
        mediaCount: 0,
        syncedCount: 0,
      });
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
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
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

  const handleShareReferral = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User ID not available. Please try again.');
      return;
    }
    
    const referralLink = `https://stefna.xyz?ref=${user.id}`;
    try {
      await Share.share({
        message: `Join me on Stefna! Use my referral link to get +10 credits: ${referralLink}`,
        url: referralLink,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.creditsText}>Credits: {balance || 0}</Text>
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
            <Text style={styles.sectionTitle}>Invite Friends</Text>
            <View style={styles.inviteInfo}>
              <View style={styles.inviteCard}>
                <Text style={styles.inviteTitle}>You Get</Text>
                <Text style={styles.inviteText}>+10 credits after friend's first media</Text>
              </View>
              <View style={styles.inviteCard}>
                <Text style={styles.inviteTitle}>Friend Gets</Text>
                <Text style={styles.inviteText}>+10 credits on signup</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.inviteButton} onPress={handleShareReferral}>
              <Text style={styles.inviteButtonText}>Share Referral Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community</Text>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityText}>Community Guidelines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityText}>Share Your Creations</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
    paddingTop: 60, // Space for floating back button
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
  },
  userInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 16,
    color: '#cccccc',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  storageItem: {
    alignItems: 'center',
    flex: 1,
  },
  storageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  storageLabel: {
    fontSize: 12,
    color: '#cccccc',
  },
  cleanupButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cleanupText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyText: {
    fontSize: 16,
    color: '#cccccc',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  inviteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  inviteCard: {
    alignItems: 'center',
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  inviteText: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  communityButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  communityText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});