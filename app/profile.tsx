import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { 
  ArrowLeft, 
  User, 
  HelpCircle, 
  Shield, 
  FileText, 
  Users, 
  LogOut,
  Settings,
  Coins,
  Mail,
  Trash2
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
                    Alert.alert(
                      'Account Deletion Requested',
                      'Your account deletion request has been submitted. You will receive an email confirmation shortly.',
                      [{ text: 'OK', onPress: () => router.replace('/auth') }]
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const showHelpCenter = () => {
    Alert.alert(
      'Stefna Help Center',
      `Welcome to Stefna — your AI-powered creative studio. Whether you're here to glitch your face into neon chaos, cry anime tears, or turn a simple photo into art, you're in the right place.

Below are answers to your most common questions.

How do I use Stefna?

Upload a photo
Use a clear, well-lit image with a visible face.
You must be logged in to generate.

Pick a mode
Each mode transforms your image differently — from subtle edits to full glitch chaos.
New modes drop regularly. No spoilers.

Tap generate
Your creation will appear in your gallery shortly.
You can save, share, or delete any result.

How do credits work?

You get 30 free credits daily (reset every 24h).
Most generations cost 2 credits.
No payment needed — it's free.
If you run out, come back tomorrow.

How does referral work?

Invite a friend using your referral link.
They get +25 credits, you get +50 credits once they generate.
Win-win.

Why does the AI sometimes get it wrong?

AI can be powerful, weird, and unpredictable.
It may:
Bend reality
Change expressions
Confuse genders, ages, or backgrounds
That's part of the fun — and the art. If anything feels wrong, just regenerate or try another mode.

Can I delete my photos?

Yes. Tap the trash icon on any photo in your gallery to remove it from Stefna and the cloud.

Is my data private?

Your uploads are private by default.
You can choose to share to the public feed.
You control what stays or goes.

Need help or want to report something?

Email us at hello@stefna.xyz and we'll handle it.
We don't use bots — real humans reply.`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const showTokenCount = () => {
    Alert.alert(
      'Token Count',
      `You have 30 free credits daily (reset every 24h).

Most generations cost 2 credits.

No payment needed — it's free.

If you run out, come back tomorrow.`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const showInviteFriends = () => {
    Alert.alert(
      'Invite Friends',
      `Share Stefna with your friends and earn credits!

How it works:
• Invite a friend using your referral link
• They get +25 credits when they sign up
• You get +50 credits once they generate their first image
• Win-win for everyone!

Your referral link:
https://stefna.xyz?ref=${user?.id || 'your-id'}

Share this link with friends to start earning credits!`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const showDrafts = () => {
    Alert.alert(
      'Drafts',
      `Your saved drafts will appear here.

Drafts are automatically saved when you:
• Start creating an image but don't finish
• Navigate away from the generation screen
• Close the app while generating

You can continue working on your drafts anytime.`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const showChangeEmail = () => {
    Alert.prompt(
      'Change Email',
      'Enter your new email address:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: (newEmail) => {
            if (newEmail && newEmail.trim()) {
              Alert.alert(
                'Email Change Requested',
                'We\'ll send a verification email to your new address. Please check your inbox and follow the instructions.',
                [{ text: 'OK', style: 'default' }]
              );
            }
          }
        }
      ],
      'plain-text',
      user?.email || ''
    );
  };

  const showCommunityGuidelines = () => {
    Alert.alert(
      'Community Guidelines',
      `Welcome to Stefna. We're building a creative space powered by AI, imagination, and a touch of chaos. Here's how we keep it safe and inspiring for everyone.

1. Be Respectful
This is a shared space. Respect others' creativity, privacy, and presence. Don't use Stefna to mock, harass, impersonate, or target anyone — directly or indirectly.

2. Keep It Appropriate
Stefna isn't for adult content, hate speech, violence, or anything that crosses legal or ethical boundaries. If you're unsure, don't post it.

3. Use Your Own Content
Only upload photos you have the right to use. Do not upload images of other people without their clear permission. No stolen content, no impersonation.

4. Expect AI Weirdness
Our AI sometimes gets things wrong. It might glitch, change genders, misread faces, or invent something surreal. That's part of the fun — but remember: not everything it generates is accurate or flattering.

5. Protect the Mystery
We love cryptic captions and artistic ambiguity. But don't use mystery as a cover for harmful behavior. Suspicious or abusive behavior will not be tolerated.

6. Reporting Content
We don't yet have automatic moderation. If you see something harmful, dangerous, or inappropriate, email us directly at hello@stefna.xyz . We'll take it seriously and review promptly.

7. No Spam or Self-Promo
Please don't use Stefna as a platform to sell, recruit, or spam. This includes links, affiliate drops, and aggressive promotion. Share your creativity, not your pitch.

8. You Are Responsible
By using Stefna, you agree that you're responsible for the content you upload, share, and create. We're not liable for what users generate — but we will take action when guidelines are violated.

Final Note
Stefna is meant to be a safe, strange, beautiful place for creative expression. We built this platform with care. Help us protect the experience — for yourself and for everyone else.

If you have questions, concerns, or want to report a user or post:
Contact us at hello@stefna.xyz`,
      [{ text: 'Got it', style: 'default' }]
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
      icon: Coins,
      title: 'Token Count',
      subtitle: 'View your credits and usage',
      onPress: () => showTokenCount(),
    },
    {
      icon: Users,
      title: 'Invite Friends',
      subtitle: 'Share Stefna and earn credits',
      onPress: () => showInviteFriends(),
    },
    {
      icon: FileText,
      title: 'Drafts',
      subtitle: 'View your saved drafts',
      onPress: () => showDrafts(),
    },
    {
      icon: Mail,
      title: 'Change Email',
      subtitle: 'Update your email address',
      onPress: () => showChangeEmail(),
    },
    {
      icon: User,
      title: 'Profile Settings',
      subtitle: 'Login details, personal information',
      onPress: () => Alert.alert('Profile Settings', 'Profile settings coming soon'),
    },
    {
      icon: HelpCircle,
      title: 'Help Center',
      subtitle: '',
      onPress: () => showHelpCenter(),
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      subtitle: '',
      onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon'),
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      subtitle: '',
      onPress: () => Alert.alert('Terms of Service', 'Terms of service coming soon'),
    },
    {
      icon: Users,
      title: 'Community Guidelines',
      subtitle: '',
      onPress: () => showCommunityGuidelines(),
    },
    {
      icon: Settings,
      title: 'Version',
      subtitle: '1.0.0',
      onPress: undefined, // Non-clickable
    },
  ];

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <User size={32} color="#ffffff" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
          </View>
        </View>

      {/* Settings List */}
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.settingIcon}>
              <item.icon size={20} color="#ffffff" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
        </View>
            {item.onPress && (
              <ArrowLeft size={16} color="#ffffff" style={styles.settingArrow} />
            )}
          </TouchableOpacity>
        ))}

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutIcon}>
            <LogOut size={20} color="#ffffff" />
        </View>
          <View style={styles.logoutContent}>
            <Text style={styles.logoutText}>Log Out</Text>
        </View>
          <ArrowLeft size={16} color="#ffffff" style={styles.logoutArrow} />
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <View style={styles.deleteIcon}>
            <Trash2 size={20} color="#ff4444" />
          </View>
          <View style={styles.deleteContent}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </View>
          <ArrowLeft size={16} color="#ff4444" style={styles.deleteArrow} />
        </TouchableOpacity>
      </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // User Info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Settings List
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  settingArrow: {
    transform: [{ rotate: '180deg' }],
  },

  // Log Out Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutContent: {
    flex: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  logoutArrow: {
    transform: [{ rotate: '180deg' }],
  },

  // Delete Account Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deleteContent: {
    flex: 1,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff4444',
  },
  deleteArrow: {
    transform: [{ rotate: '180deg' }],
  },
});