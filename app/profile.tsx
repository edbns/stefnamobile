import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { Feather } from '@expo/vector-icons';
import { StorageService } from '../src/services/storageService';
import { navigateBack } from '../src/utils/navigation';
import { config } from '../src/config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { balance, refreshBalance, initializeFromCache } = useCreditsStore();
  
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    mediaCount: 0,
    syncedCount: 0,
  });

  // Invite friends state
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  
  // Change email state
  const [showChangeEmailDropdown, setShowChangeEmailDropdown] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Legal dropdown state
  const [showLegalDropdown, setShowLegalDropdown] = useState(false);
  
  // Community dropdown state
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  
  // Referral stats state
  const [referralStats, setReferralStats] = useState({
    invites: 0,
    tokensEarned: 0,
    referralCode: user?.id || ''
  });

  useEffect(() => {
    loadStorageInfo();
    loadReferralStats();
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

  const loadReferralStats = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(config.apiUrl('get-referral-stats'), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success && data.stats) {
        setReferralStats({
          invites: data.stats.totalReferrals || 0,
          tokensEarned: data.stats.totalCreditsEarned || 0,
          referralCode: data.stats.referralCode || user?.id || ''
        });
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError('Please enter a valid email address');
      return;
    }

    setIsSendingInvite(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(config.apiUrl('send-referral-invite-v2'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          referrerEmail: user?.email || '',
          friendEmail: inviteEmail.trim(),
          referralCode: referralStats.referralCode
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setInviteSuccess('Invitation sent successfully!');
        setInviteEmail('');
        setReferralStats(prev => ({ ...prev, invites: prev.invites + 1 }));
      } else {
        setInviteError(data.error || 'Failed to send invitation. Please try again.');
      }
    } catch (error) {
      setInviteError('Failed to send invitation. Please try again.');
      console.error('Invite error:', error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://stefna.xyz?ref=${referralStats.referralCode}`;
    try {
      await Share.share({
        message: `Join me on Stefna! Use my referral link to get +10 credits: ${referralLink}`,
        url: referralLink,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleSendOtpForEmailChange = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Enter a new email address');
      return;
    }
    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setIsChangingEmail(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(config.apiUrl('request-email-change-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail: newEmail.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Verification code sent to your new email address!');
        setOtpSent(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      Alert.alert('Error', 'Failed to send verification code. Try again.');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !otpCode.trim()) {
      Alert.alert('Error', 'Enter new email and verification code');
      return;
    }

    setIsChangingEmail(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(config.apiUrl('change-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail: newEmail.trim(), otp: otpCode.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Email updated successfully!');
        setNewEmail('');
        setOtpCode('');
        setOtpSent(false);
        setShowChangeEmailDropdown(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to update email');
      }
    } catch (error) {
      console.error('Email change error:', error);
      Alert.alert('Error', 'Failed to update email. Please try again.');
    } finally {
      setIsChangingEmail(false);
    }
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, images, and account will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will permanently delete your account and all data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const token = await AsyncStorage.getItem('auth_token');
                      await fetch(config.apiUrl('delete-account'), {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      });
                      Alert.alert(
                        'Account Deletion Requested',
                        'Your account deletion request has been submitted. You will receive an email confirmation shortly.',
                        [{ text: 'OK', onPress: () => router.replace('/auth') }]
                      );
                    } catch (e) {
                      Alert.alert('Error', 'Failed to request account deletion.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
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

  const navigateToHelpCenter = () => {
    router.push('/help-center');
  };

  const navigateToPrivacy = () => {
    router.push('/privacy');
  };

  const navigateToTerms = () => {
    router.push('/terms');
  };


  const settingsItems = [
    {
      iconName: 'award' as const,
      title: 'Tokens',
      subtitle: '',
      onPress: undefined,
      showCount: true,
    },
    {
      iconName: 'users' as const,
      title: 'Invite Friends',
      subtitle: '',
      onPress: () => setShowInviteDropdown(!showInviteDropdown),
      hasDropdown: true,
    },
    {
      iconName: 'mail' as const,
      title: 'Change Email',
      subtitle: '',
      onPress: () => setShowChangeEmailDropdown(!showChangeEmailDropdown),
      hasDropdown: true,
    },
    {
      iconName: 'help-circle' as const,
      title: 'Help Center',
      subtitle: '',
      onPress: navigateToHelpCenter,
    },
    {
      iconName: 'users' as const,
      title: 'Community',
      subtitle: '',
      onPress: () => setShowCommunityDropdown(!showCommunityDropdown),
      hasDropdown: true,
    },
    {
      iconName: 'file-text' as const,
      title: 'Legal',
      subtitle: '',
      onPress: () => setShowLegalDropdown(!showLegalDropdown),
      hasDropdown: true,
    },
    {
      iconName: 'trash-2' as const,
      title: 'Delete Account',
      subtitle: '',
      onPress: handleDeleteAccount,
      isDestructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.greetingText}>Reality is optional.</Text>
        {settingsItems.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <View style={styles.settingIcon}>
                <Feather name={item.iconName} size={20} color={item.isDestructive ? "#ff4444" : "#ffffff"} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, item.isDestructive && styles.destructiveText]}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              {item.showCount ? (
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>{balance || 0}</Text>
                </View>
              ) : item.onPress ? (
                <View style={styles.settingArrow}>
                  {item.hasDropdown ? (
                    (item.title === 'Invite Friends' ? showInviteDropdown : 
                     item.title === 'Change Email' ? showChangeEmailDropdown : 
                     item.title === 'Community' ? showCommunityDropdown :
                     item.title === 'Legal' ? showLegalDropdown : false) ? 
                    <Feather name="chevron-up" size={16} color="#ffffff" /> : 
                    <Feather name="chevron-down" size={16} color="#ffffff" />
                  ) : (
                    <Feather name="chevron-right" size={16} color={item.isDestructive ? "#ff4444" : "#ffffff"} />
                  )}
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Invite Friends Dropdown */}
            {item.hasDropdown && item.title === 'Invite Friends' && showInviteDropdown && (
              <View style={styles.inviteDropdown}>
                {/* Benefits Info */}
                <View style={styles.benefitsContainer}>
                  <View style={styles.benefitCard}>
                    <Text style={styles.benefitTitle}>You Get</Text>
                    <Text style={styles.benefitText}>+10 credits after friend's first media</Text>
                  </View>
                  <View style={styles.benefitCard}>
                    <Text style={styles.benefitTitle}>Friend Gets</Text>
                    <Text style={styles.benefitText}>+10 credits on signup</Text>
                  </View>
                </View>

                {/* Email Form */}
                <View style={styles.emailForm}>
                  <Text style={styles.formLabel}>Friend's Email</Text>
                  <TextInput
                    style={styles.emailInputFull}
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="Enter friend's email address"
                    placeholderTextColor="#666666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSendingInvite}
                  />
                  <TouchableOpacity
                    style={[styles.sendButtonFull, (!inviteEmail.trim() || isSendingInvite) && styles.sendButtonDisabled]}
                    onPress={handleSendInvite}
                    disabled={!inviteEmail.trim() || isSendingInvite}
                  >
                    {isSendingInvite ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.sendButtonText}>Send Invite</Text>
                    )}
                  </TouchableOpacity>

                  {inviteError && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{inviteError}</Text>
                    </View>
                  )}

                  {inviteSuccess && (
                    <View style={styles.successContainer}>
                      <Text style={styles.successText}>{inviteSuccess}</Text>
                    </View>
                  )}
                </View>

                {/* Referral Link */}
                <View style={styles.referralSection}>
                  <Text style={styles.referralLabel}>Your Referral Link</Text>
                  <View style={styles.referralLinkContainer}>
                    <Text style={styles.referralLink}>
                      https://stefna.xyz?ref={referralStats.referralCode}
                    </Text>
                    <TouchableOpacity onPress={copyReferralLink} style={styles.copyButton}>
                      <Feather name="share" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{referralStats.invites}</Text>
                    <Text style={styles.statLabel}>Friends Invited</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{referralStats.tokensEarned}</Text>
                    <Text style={styles.statLabel}>Credits Earned</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Change Email Dropdown */}
            {item.hasDropdown && item.title === 'Change Email' && showChangeEmailDropdown && (
              <View style={styles.inviteDropdown}>
                <View style={styles.emailForm}>
                  <Text style={styles.formLabel}>Current Email</Text>
                  <Text style={styles.currentEmailDisplay}>{user?.email}</Text>
                  
                  <Text style={styles.formLabel}>New Email</Text>
                  <TextInput
                    style={styles.emailInputFull}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="Enter new email address"
                    placeholderTextColor="#666666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isChangingEmail}
                  />
                  
                  {otpSent && (
                    <>
                      <Text style={styles.formLabel}>Verification Code</Text>
                      <TextInput
                        style={styles.emailInputFull}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="#666666"
                        keyboardType="numeric"
                        maxLength={6}
                      />
                    </>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.sendButtonFull, (!newEmail.trim() || isChangingEmail) && styles.sendButtonDisabled]}
                    onPress={otpSent ? handleChangeEmail : handleSendOtpForEmailChange}
                    disabled={!newEmail.trim() || isChangingEmail}
                  >
                    {isChangingEmail ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                    <Text style={styles.sendButtonText}>
                        {otpSent ? 'Update Email' : 'Send Verification Code'}
                    </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Community Dropdown */}
            {item.hasDropdown && item.title === 'Community' && showCommunityDropdown && (
              <View style={styles.inviteDropdown}>
                <View style={styles.communityContainer}>
                  <TouchableOpacity 
                    style={styles.communityItem}
                    onPress={() => {
                      smoothNavigate.push('/community-guidelines');
                    }}
                  >
                    <View style={styles.communityIcon}>
                      <Feather name="users" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.communityContent}>
                      <Text style={styles.communityTitle}>Community Guidelines</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Legal Dropdown */}
            {item.hasDropdown && item.title === 'Legal' && showLegalDropdown && (
              <View style={styles.inviteDropdown}>
                <View style={styles.legalContainer}>
                  <TouchableOpacity 
                    style={styles.legalItem}
                    onPress={navigateToTerms}
                  >
                    <View style={styles.legalIcon}>
                      <Feather name="file-text" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.legalContent}>
                      <Text style={styles.legalTitle}>Terms of Service</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.legalItem}
                    onPress={navigateToPrivacy}
                  >
                    <View style={styles.legalIcon}>
                      <Feather name="shield" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.legalContent}>
                      <Text style={styles.legalTitle}>Privacy Policy</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutIcon}>
            <Feather name="log-out" size={20} color="#ffffff" />
          </View>
          <View style={styles.logoutContent}>
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#ffffff" />
        </TouchableOpacity>
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
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 1,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  destructiveText: {
    color: '#ff4444',
  },
  settingArrow: {
    marginLeft: 8,
  },
  countContainer: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  inviteDropdown: {
    backgroundColor: '#1a1a1a',
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 10,
    padding: 12,
  },
  benefitsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  benefitText: {
    fontSize: 11,
    color: '#cccccc',
    textAlign: 'center',
  },
  emailForm: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 6,
  },
  currentEmailDisplay: {
    fontSize: 16,
    color: '#cccccc',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailInputFull: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
    letterSpacing: 0,
  },
  sendButtonFull: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666666',
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
  },
  successContainer: {
    backgroundColor: '#00aa00',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  successText: {
    color: '#ffffff',
    fontSize: 12,
  },
  referralSection: {
    marginBottom: 16,
  },
  referralLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  referralLink: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
  },
  copyButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
  },
  legalContainer: {
    paddingVertical: 8,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  communityContainer: {
    paddingVertical: 8,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutContent: {
    flex: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
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