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

export default function TermsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updateText}>Last updated: August 4, 2025</Text>
        
        <Text style={styles.sectionTitle}>Acknowledgment</Text>
        <Text style={styles.content}>
These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Platform. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.{'\n\n'}

Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.{'\n\n'}

By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.{'\n\n'}

You must be at least 18 years old to create an account and use Stefna. This service is not intended for minors.
        </Text>

        <Text style={styles.sectionTitle}>User Content</Text>
        <Text style={styles.content}>
By uploading, submitting, or generating content (including photos, videos, and AI-generated images/videos) on Stefna, you grant Stefna a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content solely for the purpose of providing, securing, and improving Stefna's services.{'\n\n'}

You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to use and authorize Stefna to use all intellectual property rights in and to any User Content you upload or generate.
        </Text>

        <Text style={styles.sectionTitle}>Age Requirements</Text>
        <Text style={styles.content}>
You must be at least 18 years old to create an account and use Stefna. This service is not intended for minors. If We become aware that We have collected Personal Data from anyone under 18 years old, We will immediately take steps to remove that information from Our servers.
        </Text>

        <Text style={styles.sectionTitle}>Termination</Text>
        <Text style={styles.content}>
We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions. Upon termination, Your right to use the Service will cease immediately.
        </Text>

        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.content}>
To the maximum extent permitted by applicable law, in no event shall the Platform or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service).
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.content}>
If you have any questions about these Terms and Conditions, You can contact us:{'\n\n'}

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
