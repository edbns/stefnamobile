import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { useAuthStore } from '../src/stores/authStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { balance, refreshBalance, initializeFromCache } = useCreditsStore();
  
  // State for invite friends dropdown
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  
  // State for change email dropdown
  const [showChangeEmailDropdown, setShowChangeEmailDropdown] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // State for legal dropdown
  const [showLegalDropdown, setShowLegalDropdown] = useState(false);
  
  // State for referral stats
  const [referralStats, setReferralStats] = useState({
    invites: 0,
    tokensEarned: 0,
    referralCode: user?.id || ''
  });

  // Load referral stats and refresh credits on mount
  useEffect(() => {
    console.log('🔄 Profile screen mounted, initializing credits...');
    console.log('📱 Current balance:', balance);
    
    loadReferralStats();
    
    // Initialize credits from cache immediately for instant display
    initializeFromCache();
    
    // Refresh credits once on mount, then less frequently
    refreshBalance();
    
    // Set up periodic refresh (reduced frequency)
    const interval = setInterval(() => {
      refreshBalance();
    }, 60000); // Refresh every 60 seconds instead of 30
    
    return () => clearInterval(interval);
  }, [refreshBalance, initializeFromCache]);

  const loadReferralStats = async () => {
    try {
      // This would normally fetch from your API
      // For now, using mock data
      setReferralStats({
        invites: 0,
        tokensEarned: 0,
        referralCode: user?.id || 'your-id'
      });
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check if new email is different from current email
    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setIsChangingEmail(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { config } = await import('../src/config/environment');
      const response = await fetch(config.apiUrl('change-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail: newEmail.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Email updated successfully!');
        setNewEmail('');
        setShowChangeEmailDropdown(false);
        // Update user in auth store
        // Note: In a real app, you'd refresh the user data from the server
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

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    // Basic email validation
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

      const { referralService } = await import('../src/services/referralService');
      const resp = await referralService.sendReferralInvite(token, {
        to: inviteEmail.trim(),
        referrerEmail: user?.email || ''
      });

      if (resp.ok) {
        setInviteSuccess('Invitation sent successfully!');
        setInviteEmail('');
        // Update stats optimistically
        setReferralStats(prev => ({ ...prev, invites: prev.invites + 1 }));
      } else {
        setInviteError(resp.error || 'Failed to send invitation. Please try again.');
      }
      setIsSendingInvite(false);
    } catch (error) {
      setInviteError('Failed to send invitation. Please try again.');
      setIsSendingInvite(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://stefna.xyz?ref=${referralStats.referralCode}`;
    try {
      await Share.share({
        message: `Join me on Stefna! Use my referral link to get +25 credits: ${referralLink}`,
        url: referralLink,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const navigateToHelpCenter = () => {
    router.push('/help-center');
  };

  const navigateToPrivacy = () => {
    router.push('/privacy');
  };

  const navigateToCommunityGuidelines = () => {
    router.push('/community-guidelines');
  };

  const navigateToTerms = () => {
    router.push('/terms');
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
                      const { config } = await import('../src/config/environment');
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

  const settingsItems = [
    {
      iconName: 'award' as const,
      title: 'Tokens',
      subtitle: '',
      onPress: undefined, // Non-clickable - just display
      showCount: true, // Special flag to show count on the right
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
      iconName: 'users' as const,
      title: 'Community Guidelines',
      subtitle: '',
      onPress: navigateToCommunityGuidelines,
    },
    {
      iconName: 'help-circle' as const,
      title: 'Help Center',
      subtitle: '',
      onPress: navigateToHelpCenter,
    },
    {
      iconName: 'file-text' as const,
      title: 'Legal',
      subtitle: '',
      onPress: () => setShowLegalDropdown(!showLegalDropdown),
      hasDropdown: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Settings List */}
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        {/* Greeting Only */}
        <Text style={styles.greetingText}>Reality is optional.</Text>
        {settingsItems.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <View style={styles.settingIcon}>
                <Feather name={item.iconName} size={20} color="#ffffff" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              {item.showCount ? (
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>{balance}</Text>
                </View>
              ) : item.onPress ? (
                <View style={styles.settingArrow}>
                  {item.hasDropdown ? (
                    (item.title === 'Invite Friends' ? showInviteDropdown : 
                     item.title === 'Change Email' ? showChangeEmailDropdown : 
                     item.title === 'Legal' ? showLegalDropdown : false) ? 
                    <Feather name="chevron-up" size={16} color="#ffffff" /> : 
                    <Feather name="chevron-down" size={16} color="#ffffff" />
                  ) : (
                    <Feather name="chevron-right" size={16} color="#ffffff" />
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
                    <Text style={styles.benefitText}>+50 credits after friend's first media</Text>
                  </View>
                  <View style={styles.benefitCard}>
                    <Text style={styles.benefitTitle}>Friend Gets</Text>
                    <Text style={styles.benefitText}>+25 credits on signup</Text>
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
                    <Text style={styles.sendButtonText}>
                      {isSendingInvite ? 'Sending...' : 'Send Invite'}
                    </Text>
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
                {/* Current Email Display */}
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
                  <TouchableOpacity
                    style={[styles.sendButtonFull, (!newEmail.trim() || isChangingEmail) && styles.sendButtonDisabled]}
                    onPress={handleChangeEmail}
                    disabled={!newEmail.trim() || isChangingEmail}
                  >
                    <Text style={styles.sendButtonText}>
                      {isChangingEmail ? 'Updating...' : 'Update Email'}
                    </Text>
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

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <View style={styles.deleteIcon}>
            <Feather name="trash-2" size={20} color="#ff4444" />
          </View>
          <View style={styles.deleteContent}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#ff4444" />
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

  // User Info
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  // Settings List
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60, // Reduced top padding
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

  // Invite Friends Dropdown
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
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
    letterSpacing: 0,
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
  sendButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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

  // Log Out Button
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
  // Delete Account Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteContent: {
    flex: 1,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff4444',
  },

  // Floating Back Button
  headerRow: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 40, paddingLeft: 8, zIndex: 1000 },
  iconBackButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
});