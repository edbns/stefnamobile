import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { navigateBack } from '../src/utils/navigation';

export default function CookiesPolicyScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Cookies Policy</Text>
          
          <View style={styles.section}>
            <Text style={styles.text}>
              Last updated: August 4, 2025
            </Text>
            <Text style={styles.text}>
              This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used.
            </Text>
            <Text style={styles.text}>
              Cookies do not typically contain any information that personally identifies a user, but personal information that we store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy.
            </Text>
            <Text style={styles.text}>
              We do not store sensitive personal information, such as mailing addresses, account passwords, etc. in the Cookies We use.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interpretation and Definitions</Text>
            
            <Text style={styles.subsectionTitle}>Interpretation</Text>
            <Text style={styles.text}>
              The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </Text>
            
            <Text style={styles.subsectionTitle}>Definitions</Text>
            <Text style={styles.text}>
              For the purposes of this Cookies Policy:
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Cookies Policy) refers to Stefna.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Cookies</Text> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Website</Text> refers to Stefna, accessible from stefna.xyz
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>You</Text> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The use of the Cookies</Text>
            
            <Text style={styles.subsectionTitle}>Type of Cookies We Use</Text>
            <Text style={styles.text}>
              Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.
            </Text>
            <Text style={styles.text}>
              We use both session and persistent Cookies for the purposes set out below:
            </Text>
            
            <Text style={styles.text}>
              <Text style={styles.bold}>Necessary / Essential Cookies</Text>
            </Text>
            <Text style={styles.text}>
              Type: Session Cookies
            </Text>
            <Text style={styles.text}>
              Administered by: Us
            </Text>
            <Text style={styles.text}>
              Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.
            </Text>
            
            <Text style={styles.text}>
              <Text style={styles.bold}>Functionality Cookies</Text>
            </Text>
            <Text style={styles.text}>
              Type: Persistent Cookies
            </Text>
            <Text style={styles.text}>
              Administered by: Us
            </Text>
            <Text style={styles.text}>
              Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Choices Regarding Cookies</Text>
            <Text style={styles.text}>
              If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.
            </Text>
            <Text style={styles.text}>
              If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.
            </Text>
            <Text style={styles.text}>
              If You'd like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser:
            </Text>
            <TouchableOpacity onPress={() => openLink('https://support.google.com/accounts/answer/32050')}>
              <Text style={styles.linkText}>
                • For the Chrome web browser, please visit this page from Google: https://support.google.com/accounts/answer/32050
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('http://support.microsoft.com/kb/278835')}>
              <Text style={styles.linkText}>
                • For the Internet Explorer web browser, please visit this page from Microsoft: http://support.microsoft.com/kb/278835
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored')}>
              <Text style={styles.linkText}>
                • For the Firefox web browser, please visit this page from Mozilla: https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac')}>
              <Text style={styles.linkText}>
                • For the Safari web browser, please visit this page from Apple: https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.text}>
              If you have any questions about this Cookies Policy, You can contact us:
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
  linkText: {
    fontSize: 14,
    color: '#4A9EFF',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
    textDecorationLine: 'underline',
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
