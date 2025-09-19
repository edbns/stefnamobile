import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { navigateBack } from '../src/utils/navigation';

export default function HelpCenterScreen() {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL('mailto:hello@stefna.xyz?subject=Help Request');
  };

  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'How do I create an account?',
          answer: 'Simply enter your email address and we\'ll send you a verification code. No password required!'
        },
        {
          question: 'How many credits do I get?',
          answer: 'New users receive 30 free credits to start creating amazing AI art.'
        },
        {
          question: 'What can I create with Stefna?',
          answer: 'Transform your photos into stunning AI art with cinematic effects, anime reactions, glitch art, and more using our 7 different generation modes.'
        }
      ]
    },
    {
      title: 'Generation Modes',
      items: [
        {
          question: 'What are Presets?',
          answer: 'Presets are curated AI styles that rotate weekly. They provide professional-quality transformations with one-click generation.'
        },
        {
          question: 'How does Custom Mode work?',
          answer: 'Type any prompt and our AI will bring it to life. Use the magic wand to enhance your prompts automatically.'
        },
        {
          question: 'What is Studio Mode (Edit)?',
          answer: 'Studio Mode allows precision editing of specific elements in your images with professional-grade tools.'
        },
        {
          question: 'What is Emotion Mask™?',
          answer: 'Transform facial expressions with AI while preserving the person\'s identity. Perfect for changing emotions in photos.'
        },
        {
          question: 'What is Ghibli Reaction?',
          answer: 'Create Studio Ghibli-style anime transformations with emotional depth and magical reactions.'
        },
        {
          question: 'What is Neo Tokyo Glitch?',
          answer: 'Transform your images into cyberpunk art with futuristic, neon-soaked glitch effects.'
        },
        {
          question: 'What is Parallel Self?',
          answer: 'Create parallel universe versions of yourself with different styles, ages, or characteristics.'
        }
      ]
    },
    {
      title: 'Credits & Billing',
      items: [
        {
          question: 'How do credits work?',
          answer: 'Each generation costs credits. You earn credits through referrals and can purchase more when needed.'
        },
        {
          question: 'How do I get more credits?',
          answer: 'Invite friends to earn credits, or purchase additional credits through our system.'
        },
        {
          question: 'Do credits expire?',
          answer: 'Credits do not expire and remain in your account until used.'
        }
      ]
    },
    {
      title: 'Technical Support',
      items: [
        {
          question: 'Why is my generation taking so long?',
          answer: 'AI generation can take 30-60 seconds depending on complexity. Please be patient and don\'t close the app.'
        },
        {
          question: 'What if my generation fails?',
          answer: 'Failed generations don\'t cost credits. Try again with a different prompt or contact support if issues persist.'
        },
        {
          question: 'How do I download my images?',
          answer: 'Tap the download button on any generated image. On iOS, images save to your Photos app.'
        },
        {
          question: 'Can I use the app offline?',
          answer: 'You need an internet connection to generate new images, but you can view previously generated content offline.'
        }
      ]
    },
    {
      title: 'Account & Privacy',
      items: [
        {
          question: 'How do I change my email?',
          answer: 'Go to Profile > Change Email and follow the verification process.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'Go to Profile > Delete Account. This action is permanent and cannot be undone.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard security measures to protect your data and images.'
        },
        {
          question: 'Do you store my images?',
          answer: 'We store your generated images to provide the service, but you can delete them anytime.'
        }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>Find answers to common questions</Text>
          
          {helpSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.faqItem}>
                  <Text style={styles.question}>{item.question}</Text>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactText}>
              Can't find what you're looking for? Our support team is here to help.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
              <Feather name="mail" size={20} color="#000000" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <Text style={styles.contactEmail}>hello@stefna.xyz</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#4A9EFF',
    textDecorationLine: 'underline',
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