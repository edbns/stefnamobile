import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useCreditsStore } from '../src/stores/creditsStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../src/constants/colors';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Coins, 
  Shield, 
  FileText, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Trash2,
  UserPlus,
  Share2,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { balance } = useCreditsStore();

  const handleInviteFriend = async () => {
    try {
      // Build referral link with user's email
      const referrerEmail = encodeURIComponent(user?.email || '');
      const referralUrl = `https://stefna.xyz/auth?referrer=${referrerEmail}`;
      
      const shareMessage = `Join me on Stefna — the AI photo transformation studio!\n\n` +
        `Sign up and we both get +25 free credits:\n${referralUrl}\n\n` +
        `Create AI-generated images in seconds. No limits.`;
      
      const result = await Share.share({
        message: shareMessage,
        url: referralUrl, // iOS will use this
        title: 'Join Stefna - AI Image Generation',
      });

      if (result.action === Share.sharedAction) {
        console.log('✅ Invite shared successfully');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share invite');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data, images, and credits will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
            // TODO: Call delete-account API
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: Mail,
          label: 'Email',
          value: user?.email || 'Not set',
          onPress: null,
        },
        {
          icon: Coins,
          label: 'Credits',
          value: `${balance || 0} available`,
          onPress: null,
        },
        {
          icon: UserPlus,
          label: 'Invite Friends',
          onPress: handleInviteFriend,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          onPress: () => router.push('/help-center'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: FileText,
          label: 'Terms & Conditions',
          onPress: () => router.push('/terms'),
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onPress: () => router.push('/privacy'),
        },
        {
          icon: Shield,
          label: 'Community Guidelines',
          onPress: () => router.push('/community-guidelines'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
            <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={COLORS.text} />
            </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
                </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={32} color={COLORS.text} />
                    </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress || undefined}
                    disabled={!item.onPress}
                    activeOpacity={0.8}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <item.icon size={16} color={COLORS.text} />
                </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {'value' in item && item.value && (
                        <Text style={styles.menuItemValue}>{item.value}</Text>
                      )}
                      {item.onPress && (
                        <ChevronRight size={16} color={COLORS.textTertiary} />
                      )}
                    </View>
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
              </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Stefna Mobile v1.0.3</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuItemValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 32 + SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: SPACING.md,
  },
  deleteText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
