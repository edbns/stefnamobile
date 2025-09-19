import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { navigateBack } from '../src/utils/navigation';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interpretation and Definitions</Text>
            <Text style={styles.text}>
              The words of which the initial letter is capitalized have meanings defined under the following conditions. 
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </Text>
            
            <Text style={styles.subsectionTitle}>Definitions</Text>
            <Text style={styles.text}>
              For the purposes of these Terms and Conditions:
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Affiliate</Text> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Platform</Text> (referred to as either "the Platform", "We", "Us" or "Our" in this Agreement) refers to Stefna, an AI-powered photo and video editing platform.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Device</Text> means any device that can access the Service such as a computer, a cellphone or a digital tablet.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Service</Text> refers to the Website, Stefna, which provides AI-powered photo and video editing tools through an easy-to-use web interface, with mobile applications launching soon.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Terms and Conditions</Text> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Platform regarding the use of the Service.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Third-party Social Media Service</Text> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Website</Text> refers to Stefna, accessible from stefna.xyz
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>You</Text> means the individual accessing or using the Service, or the Platform, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acknowledgment</Text>
            <Text style={styles.text}>
              These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Platform. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
            </Text>
            <Text style={styles.text}>
              Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
            </Text>
            <Text style={styles.text}>
              By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
            </Text>
            <Text style={styles.text}>
              You must be at least 13 years old to create an account and use Stefna. If you are under the age required by the laws of your country to consent to data processing (e.g., 16 in some jurisdictions), you may only use Stefna with parental consent.
            </Text>
            <Text style={styles.text}>
              Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Platform. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Content</Text>
            <Text style={styles.text}>
              By uploading, submitting, or generating content (including photos, videos, and AI-generated images/videos) on Stefna, you grant Stefna a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content solely for the purpose of providing, securing, and improving Stefna's services, including enabling features like editing and remixing. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to use and authorize Stefna to use all intellectual property rights in and to any User Content you upload or generate.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to These Terms and Conditions</Text>
            <Text style={styles.text}>
              We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
            </Text>
            <Text style={styles.text}>
              By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.text}>
              If you have any questions about these Terms and Conditions, You can contact us:
            </Text>
            <Text style={styles.bulletPoint}>
              • By email: hello@stefna.xyz
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Last updated: August 4, 2025</Text>
          </View>
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
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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