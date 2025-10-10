import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants/colors';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updateText}>Last updated: August 4, 2025</Text>
        
        <Text style={styles.content}>
This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.{'\n\n'}

We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>Personal Data Collected</Text>
        <Text style={styles.content}>
While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You:{'\n\n'}

• Email address{'\n'}
• First name and last name{'\n'}
• Uploaded Content: Photos and videos uploaded by users, as well as all AI-generated images/videos{'\n'}
• Usage Data
        </Text>

        <Text style={styles.sectionTitle}>Usage Data</Text>
        <Text style={styles.content}>
Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address (IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
        </Text>

        <Text style={styles.sectionTitle}>Use of Your Personal Data</Text>
        <Text style={styles.content}>
The Platform may use Personal Data for the following purposes:{'\n\n'}

• To provide and maintain our Service, including to monitor the usage of our Service{'\n'}
• To manage Your Account{'\n'}
• To contact You via email or push notifications{'\n'}
• To provide You with news and special offers{'\n'}
• To manage Your requests{'\n\n'}

All data is used solely for providing, securing, and improving Stefna's services. We do not sell user data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>Age Requirements</Text>
        <Text style={styles.content}>
You must be at least 18 years old to create an account and use Stefna. This service is not intended for minors. If We become aware that We have collected Personal Data from anyone under 18 years old, We will immediately take steps to remove that information from Our servers.
        </Text>

        <Text style={styles.sectionTitle}>Delete Your Personal Data</Text>
        <Text style={styles.content}>
You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. You may delete Your account at any time from the Profile screen. Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
        </Text>

        <Text style={styles.sectionTitle}>Security of Your Personal Data</Text>
        <Text style={styles.content}>
The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security. All user content and personal information are stored securely using Neon's managed infrastructure.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.content}>
If you have any questions about this Privacy Policy, You can contact us:{'\n\n'}

By email: hello@stefna.xyz
        </Text>
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
  updateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
