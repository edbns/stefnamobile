import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigateBack.toProfile()} style={styles.iconBackButton}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Updated: December 2024</Text>
          <Text style={styles.sectionText}>
            These Terms of Service ("Terms") govern your use of Stefna's AI-powered image generation service ("Service"). By using our Service, you agree to these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing or using Stefna, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of these terms, you may not access the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionText}>
            Stefna is an AI-powered platform that allows users to transform images using various AI models and styles. The Service includes:{'\n'}
            • Image upload and processing{'\n'}
            • AI-powered image generation{'\n'}
            • Credit-based usage system{'\n'}
            • Social sharing features{'\n'}
            • User account management
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            • You must provide accurate information when creating an account{'\n'}
            • You are responsible for maintaining account security{'\n'}
            • You must be at least 13 years old to use the Service{'\n'}
            • One account per person - no sharing or transferring{'\n'}
            • We reserve the right to suspend or terminate accounts that violate these Terms
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.sectionText}>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:{'\n'}
            • Upload inappropriate, illegal, or harmful content{'\n'}
            • Violate any laws or regulations{'\n'}
            • Infringe on others' intellectual property rights{'\n'}
            • Attempt to hack, disrupt, or damage the Service{'\n'}
            • Use the Service for commercial purposes without permission{'\n'}
            • Spam, harass, or abuse other users
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Content and Intellectual Property</Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Your Content:</Text>{'\n'}
            • You retain ownership of images you upload{'\n'}
            • You grant us a license to process and store your content{'\n'}
            • You are responsible for ensuring you have rights to upload content{'\n\n'}
            
            <Text style={styles.bold}>Generated Content:</Text>{'\n'}
            • AI-generated images are created using your input and our AI models{'\n'}
            • You may use generated images for personal purposes{'\n'}
            • Commercial use may require additional permissions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Credits and Usage</Text>
          <Text style={styles.sectionText}>
            • Credits are provided daily and reset every 24 hours{'\n'}
            • Credits cannot be transferred or sold{'\n'}
            • We reserve the right to modify credit amounts and costs{'\n'}
            • Credits may expire if unused for extended periods{'\n'}
            • No refunds for unused credits
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Privacy and Data</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using the Service, you consent to our data practices as described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Service Availability</Text>
          <Text style={styles.sectionText}>
            • We strive to maintain high service availability but cannot guarantee 100% uptime{'\n'}
            • We may perform maintenance that temporarily affects service{'\n'}
            • We reserve the right to modify or discontinue features{'\n'}
            • We are not liable for service interruptions or data loss
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            To the maximum extent permitted by law:{'\n'}
            • Stefna is provided "as is" without warranties{'\n'}
            • We are not liable for any indirect, incidental, or consequential damages{'\n'}
            • Our total liability is limited to the amount you paid for the Service{'\n'}
            • We are not responsible for AI-generated content accuracy or appropriateness
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.sectionText}>
            • You may terminate your account at any time{'\n'}
            • We may terminate accounts that violate these Terms{'\n'}
            • Upon termination, your data may be deleted{'\n'}
            • Some provisions of these Terms survive termination
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We may update these Terms from time to time. We will notify you of material changes by email or through the Service. Your continued use after changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have questions about these Terms, please contact us at:{'\n\n'}
            Email: hello@stefna.xyz{'\n\n'}
            We will respond to all inquiries within 30 days.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerRow: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 40, paddingLeft: 8, zIndex: 1000 },
  iconBackButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
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
  sectionText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#ffffff',
  },
});
