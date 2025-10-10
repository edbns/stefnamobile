import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../src/constants/colors';
import { ArrowLeft, Mail, HelpCircle } from 'lucide-react-native';

export default function HelpCenterScreen() {
  const router = useRouter();

  const sections = [
    {
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I create my first image?',
          a: 'Tap the + button at the bottom right. You can either upload a photo to edit or just type a prompt for text-to-image generation. Tap Generate when ready.',
        },
        {
          q: 'What are credits and how do they work?',
          a: 'Credits are used for each generation. You start with free credits when you sign up. Each generation costs 2 credits. You can see your balance in your Profile.',
        },
        {
          q: 'How long does generation take?',
          a: 'Most generations complete in 30-90 seconds. Complex images may take up to 2 minutes. You will see a progress screen while it is processing.',
        },
      ],
    },
    {
      title: 'Generation Modes',
      questions: [
        {
          q: 'What is Custom mode?',
          a: 'Custom mode creates images from text only. Describe what you want and the AI will generate it. No photo needed.',
        },
        {
          q: 'What is Studio (Edit) mode?',
          a: 'Studio mode lets you upload a photo and transform it with a custom prompt. Upload your photo, describe the edit, and generate.',
        },
        {
          q: 'What are Parallel Self™ and Unreal Reflection™?',
          a: 'These are advanced preset modes that create alternate versions of yourself. Upload your photo, tap "Get These Looks", select a preset, and generate.',
        },
        {
          q: 'What does the Enhance button do?',
          a: 'The Enhance button uses AI to improve your prompt, adding details and refinements for better results. It is free to use.',
        },
      ],
    },
    {
      title: 'Your Gallery',
      questions: [
        {
          q: 'Where do my generated images go?',
          a: 'All your generated images appear in the main gallery (home screen). The newest images appear first. Pull down to refresh.',
        },
        {
          q: 'How do I save images to my phone?',
          a: 'Tap an image to view it full-screen, then tap the Save button. The image will be saved to your Photos app.',
        },
        {
          q: 'Can I delete images?',
          a: 'Yes. Open an image and tap the Delete button. This will remove it from your gallery and cannot be undone.',
        },
      ],
    },
    {
      title: 'Account & Settings',
      questions: [
        {
          q: 'How do I log out?',
          a: 'Go to your Profile (tap the person icon at bottom left), scroll down, and tap Sign Out.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to Profile, scroll to the bottom, and tap Delete Account (red button). Warning: This permanently deletes all your data.',
        },
        {
          q: 'How do I invite friends?',
          a: 'Go to Profile and tap Invite Friends. You will get a referral link to share. When friends sign up with your link, you both get bonus credits.',
        },
      ],
    },
    {
      title: 'Troubleshooting',
      questions: [
        {
          q: 'Why is my generation taking so long?',
          a: 'Complex images take up to 2 minutes. Check your internet connection. If it fails, you will see an error message.',
        },
        {
          q: 'Why are my credits not showing?',
          a: 'Pull down on the main screen to refresh. Check your internet connection. Your credits are displayed in your Profile.',
        },
        {
          q: 'The camera shows a black screen',
          a: 'Close the app completely and restart. Make sure you granted camera permissions in your phone settings.',
        },
        {
          q: 'Images are not loading in gallery',
          a: 'Pull down to refresh. Check your internet connection. Make sure you are logged in.',
        },
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
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.questions.map((item, questionIndex) => (
              <View key={questionIndex} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <HelpCircle size={16} color={COLORS.accent} />
                  <Text style={styles.question}>{item.q}</Text>
                </View>
                <Text style={styles.answer}>{item.a}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still Need Help?</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:hello@stefna.xyz?subject=Mobile App Support')}
            activeOpacity={0.8}
          >
            <Mail size={16} color={COLORS.text} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <Text style={styles.contactEmail}>hello@stefna.xyz</Text>
        </View>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  question: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  answer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.md + 16,
  },
  contactSection: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
  contactEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
