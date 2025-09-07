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

export default function CommunityGuidelinesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <View style={styles.floatingBackButton}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            Welcome to Stefna. We're building a creative space powered by AI, imagination, and a touch of chaos. Here's how we keep it safe and inspiring for everyone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Be Respectful</Text>
          <Text style={styles.sectionText}>
            This is a shared space. Respect others' creativity, privacy, and presence. Don't use Stefna to mock, harass, impersonate, or target anyone — directly or indirectly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Keep It Appropriate</Text>
          <Text style={styles.sectionText}>
            Stefna isn't for adult content, hate speech, violence, or anything that crosses legal or ethical boundaries. If you're unsure, don't post it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use Your Own Content</Text>
          <Text style={styles.sectionText}>
            Only upload photos you have the right to use. Do not upload images of other people without their clear permission. No stolen content, no impersonation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Expect AI Weirdness</Text>
          <Text style={styles.sectionText}>
            Our AI sometimes gets things wrong. It might glitch, change genders, misread faces, or invent something surreal. That's part of the fun — but remember: not everything it generates is accurate or flattering.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Protect the Mystery</Text>
          <Text style={styles.sectionText}>
            We love cryptic captions and artistic ambiguity. But don't use mystery as a cover for harmful behavior. Suspicious or abusive behavior will not be tolerated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Reporting Content</Text>
          <Text style={styles.sectionText}>
            We don't yet have automatic moderation. If you see something harmful, dangerous, or inappropriate, email us directly at hello@stefna.xyz. We'll take it seriously and review promptly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. No Spam or Self-Promo</Text>
          <Text style={styles.sectionText}>
            Please don't use Stefna as a platform to sell, recruit, or spam. This includes links, affiliate drops, and aggressive promotion. Share your creativity, not your pitch.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. You Are Responsible</Text>
          <Text style={styles.sectionText}>
            By using Stefna, you agree that you're responsible for the content you upload, share, and create. We're not liable for what users generate — but we will take action when guidelines are violated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Note</Text>
          <Text style={styles.sectionText}>
            Stefna is meant to be a safe, strange, beautiful place for creative expression. We built this platform with care. Help us protect the experience — for yourself and for everyone else.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have questions, concerns, or want to report a user or post:{'\n\n'}
            Contact us at hello@stefna.xyz
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
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
});
