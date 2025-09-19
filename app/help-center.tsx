import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { navigateBack } from '../src/utils/navigation';
import { Feather } from '@expo/vector-icons';

export default function HelpCenterScreen() {
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
          <Text style={styles.sectionTitle}>Stefna Help Center</Text>
          <Text style={styles.sectionText}>
            Welcome to Stefna — your AI-powered creative studio. Whether you're here to glitch your face into neon chaos, cry anime tears, or turn a simple photo into art, you're in the right place.
            {'\n\n'}Below are answers to your most common questions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How do I use Stefna?</Text>
          <Text style={styles.sectionText}>
            1. Upload a photo{'\n'}
            • Use a clear, well-lit image with a visible face.{'\n'}
            • You must be logged in to generate.{'\n\n'}
            2. Pick a mode{'\n'}
            • Each mode transforms your image differently — from subtle edits to full glitch chaos.{'\n'}
            • New modes drop regularly. No spoilers.{'\n\n'}
            3. Tap generate{'\n'}
            • Your creation will appear in your gallery shortly.{'\n'}
            • You can save, share, or delete any result.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How do credits work?</Text>
          <Text style={styles.sectionText}>
            • You get 14 free credits daily (reset every 24h).{'\n'}
            • Most generations cost 2 credits.{'\n'}
            • No payment needed — it's free.{'\n'}
            • If you run out, come back tomorrow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How does referral work?</Text>
          <Text style={styles.sectionText}>
            • Invite a friend using your referral link.{'\n'}
            • They get +10 credits, you get +10 credits once they generate.{'\n'}
            • Win-win.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why does the AI sometimes get it wrong?</Text>
          <Text style={styles.sectionText}>
            AI can be powerful, weird, and unpredictable.{'\n\n'}
            It may:{'\n'}
            • Bend reality{'\n'}
            • Change expressions{'\n'}
            • Confuse genders, ages, or backgrounds{'\n\n'}
            That's part of the fun — and the art. If anything feels wrong, just regenerate or try another mode.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Can I delete my photos?</Text>
          <Text style={styles.sectionText}>
            Yes. Tap the trash icon on any photo in your gallery to remove it from Stefna and the cloud.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Is my data private?</Text>
          <Text style={styles.sectionText}>
            • Your uploads are private by default.{'\n'}
            • You can choose to share to the public feed.{'\n'}
            • You control what stays or goes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need help or want to report something?</Text>
          <Text style={styles.sectionText}>
            Email us at{' '}
            <Text 
              style={styles.emailLink}
              onPress={() => Linking.openURL('mailto:hello@stefna.xyz?subject=Help Request')}
            >
              hello@stefna.xyz
            </Text>
            {' '}and we'll handle it. We don't use bots — real humans reply.
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
  emailLink: {
    color: '#4A9EFF',
    textDecorationLine: 'underline',
  },
});