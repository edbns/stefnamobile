import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Updated: December 2024</Text>
          <Text style={styles.sectionText}>
            This Privacy Policy describes how Stefna ("we", "our", or "us") collects, uses, and protects your information when you use our AI-powered image generation service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Account Information</Text>{'\n'}
            • Email address for account creation and communication{'\n'}
            • Profile information you choose to provide{'\n\n'}
            
            <Text style={styles.bold}>Usage Data</Text>{'\n'}
            • Images you upload for AI processing{'\n'}
            • Generated images and your interactions with them{'\n'}
            • App usage patterns and preferences{'\n\n'}
            
            <Text style={styles.bold}>Technical Data</Text>{'\n'}
            • Device information and app version{'\n'}
            • IP address and general location{'\n'}
            • Crash reports and performance data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            • Process your images through our AI models{'\n'}
            • Provide and improve our services{'\n'}
            • Send important updates and notifications{'\n'}
            • Analyze usage patterns to enhance user experience{'\n'}
            • Prevent abuse and ensure platform safety{'\n'}
            • Comply with legal obligations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.sectionText}>
            • Your images are stored securely using industry-standard encryption{'\n'}
            • We use cloud storage providers with robust security measures{'\n'}
            • Access to your data is limited to authorized personnel only{'\n'}
            • We regularly audit our security practices and update them as needed
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy Controls</Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Private by Default:</Text> Your uploads are private unless you choose to share them{'\n'}
            • <Text style={styles.bold}>Delete Anytime:</Text> You can delete your images and account at any time{'\n'}
            • <Text style={styles.bold}>Data Export:</Text> Contact us to request a copy of your data{'\n'}
            • <Text style={styles.bold}>Opt-out:</Text> You can unsubscribe from non-essential communications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.sectionText}>
            We use trusted third-party services for:{'\n'}
            • AI model processing (Stability.ai, Fal.ai){'\n'}
            • Image storage (Cloudinary){'\n'}
            • Analytics and crash reporting{'\n'}
            • Email communications{'\n\n'}
            These services have their own privacy policies and security measures.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.sectionText}>
            • Account data: Retained until you delete your account{'\n'}
            • Generated images: Retained until you delete them{'\n'}
            • Usage analytics: Anonymized data may be retained for service improvement{'\n'}
            • Legal requirements: Some data may be retained longer if required by law
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through the app. Your continued use of our service after changes become effective constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have questions about this Privacy Policy or our data practices, please contact us at:{'\n\n'}
            Email: hello@stefna.xyz{'\n'}
            We respond to all privacy inquiries within 30 days.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
