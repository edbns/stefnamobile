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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/colors';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function CommunityGuidelinesScreen() {
  const router = useRouter();

  const guidelines = [
    {
      title: 'Be Respectful',
      items: [
        'Respect others\' creativity and work',
        'No harassment, hate speech, or bullying',
        'Keep feedback constructive and kind',
      ],
    },
    {
      title: 'Create Responsibly',
      items: [
        'Do not impersonate real people without permission',
        'Respect copyrights and trademarks',
        'No illegal, harmful, or dangerous content',
        'Do not generate explicit content involving minors',
      ],
    },
    {
      title: 'Share Wisely',
      items: [
        'Only share content you have rights to',
        'Give credit to original creators when inspired by their work',
        'Report inappropriate content if you see it',
        'Be mindful of others when sharing publicly',
      ],
    },
    {
      title: 'Use AI Ethically',
      items: [
        'Be transparent when sharing AI-generated content',
        'Do not use AI to spread misinformation',
        'Respect people\'s privacy and consent',
        'Use the platform for creative and lawful purposes',
      ],
    },
    {
      title: 'Account Security',
      items: [
        'Keep your login credentials secure',
        'Do not share your account with others',
        'Report any security concerns immediately',
      ],
    },
  ];

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
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Help us maintain a creative, respectful, and safe community. By using Stefna, you agree to follow these guidelines.
        </Text>

        {guidelines.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.guidelineItem}>
                <CheckCircle size={16} color={COLORS.accent} style={styles.checkIcon} />
                <Text style={styles.guidelineText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.violationsCard}>
          <Text style={styles.violationsTitle}>Violations & Enforcement</Text>
          <Text style={styles.violationsText}>
            Violations of these guidelines may result in content removal, account suspension, or permanent ban, depending on severity. We review all reports and take appropriate action.{'\n\n'}
            
            If you see content that violates these guidelines, please contact us at hello@stefna.xyz with details.
          </Text>
        </View>

        <Text style={styles.updateText}>Last updated: January 2025</Text>
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
  intro: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  checkIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  guidelineText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  violationsCard: {
    backgroundColor: '#FEF3C7',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: SPACING.lg,
  },
  violationsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: SPACING.sm,
  },
  violationsText: {
    fontSize: FONT_SIZES.sm,
    color: '#78350F',
    lineHeight: 20,
  },
  updateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
