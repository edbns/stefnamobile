import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function VerifyScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const email = (emailParam as string) || '';
  const { login } = useAuthStore();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Simple focus effect without complex state management
  useFocusEffect(
    React.useCallback(() => {
      // Simple refocus when screen comes into focus
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [])
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    const ok = await login(email, otp);
    setIsVerifying(false);
    if (ok) router.replace('/main');
  };

  useEffect(() => {
    if (otp.length === 6 && !isVerifying) handleVerify();
  }, [otp]);

  return (
    <View style={styles.container}>
      {/* Back to Email Button */}
      <TouchableOpacity 
        style={styles.backToEmailButton} 
        onPress={() => router.push({ pathname: '/auth', params: { email } })}
      >
        <Text style={styles.backToEmailButtonText}>← Back to Email</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={true}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.title}>Enter Login Code</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>
            <Text style={styles.infoPill}>Please check your <Text style={styles.spamText}>Spam</Text> in case</Text>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666"
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity style={[styles.button, (isVerifying || otp.length !== 6) && styles.buttonDisabled]} onPress={handleVerify} disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>

            <Text style={styles.resendHint}>{countdown > 0 ? `Resend in ${countdown}s` : 'You can resend from the previous screen'}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  keyboardContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 0, // No extra padding
  },
  content: { 
    paddingHorizontal: 24, 
    paddingTop: 20,
    paddingBottom: 20, // Reduced padding
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 45,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#ccc', textAlign: 'center', marginBottom: 24 },
  infoPill: { alignSelf: 'center', color: '#bbb', backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 16, fontSize: 12 },
  input: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    fontSize: 20, 
    color: '#fff', 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 20, // Added space between input and button
    borderWidth: 1, 
    borderColor: '#333', 
    minHeight: 56 
  },
  button: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  backToEmailButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backToEmailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  resendHint: { marginTop: 12, color: '#888', textAlign: 'center' },
  spamText: { color: '#ff4444', fontWeight: '600' },
});


