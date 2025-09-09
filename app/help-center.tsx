import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBackButton}>
          <Feather name="arrow-left" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to Stefna</Text>
          <Text style={styles.sectionText}>
            Your AI-powered creative studio. Whether you're here to glitch your face into neon chaos, cry anime tears, or turn a simple photo into art, you're in the right place.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How do I use Stefna?</Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Upload a photo</Text>{'\n'}
            Use a clear, well-lit image with a visible face.{'\n'}
            You must be logged in to generate.{'\n\n'}
            
            <Text style={styles.bold}>Pick a mode</Text>{'\n'}
            Each mode transforms your image differently — from subtle edits to full glitch chaos.{'\n'}
            New modes drop regularly. No spoilers.{'\n\n'}
            
            <Text style={styles.bold}>Tap generate</Text>{'\n'}
            Your creation will appear in your gallery shortly.{'\n'}
            You can save, share, or delete any result.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How do credits work?</Text>
          <Text style={styles.sectionText}>
            You get 30 free credits daily (reset every 24h).{'\n'}
            Most generations cost 2 credits.{'\n'}
            No payment needed — it's free.{'\n'}
            If you run out, come back tomorrow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How does referral work?</Text>
          <Text style={styles.sectionText}>
            Invite a friend using your referral link.{'\n'}
            They get +25 credits, you get +50 credits once they generate.{'\n'}
            Win-win.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why does the AI sometimes get it wrong?</Text>
          <Text style={styles.sectionText}>
            AI can be powerful, weird, and unpredictable.{'\n'}
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
            Your uploads are private by default.{'\n'}
            You can choose to share to the public feed.{'\n'}
            You control what stays or goes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need help or want to report something?</Text>
          <Text style={styles.sectionText}>
            Email us at hello@stefna.xyz and we'll handle it.{'\n'}
            We don't use bots — real humans reply.
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
  headerRow: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 8, paddingLeft: 8, zIndex: 1000 },
  iconBackButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
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
