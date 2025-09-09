import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function VerifyScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const email = (emailParam as string) || '';
  const { login } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>
        <Text style={styles.infoPill}>Login code sent to your email</Text>

        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity style={[styles.button, (isVerifying || otp.length !== 6) && styles.buttonDisabled]} onPress={handleVerify} disabled={isVerifying || otp.length !== 6}>
          {isVerifying ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Verify</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace({ pathname: '/auth', params: { email } })} style={styles.backToEmail}>
          <Text style={styles.backToEmailText}>Back to Email</Text>
        </TouchableOpacity>

        <Text style={styles.resendHint}>{countdown > 0 ? `Resend in ${countdown}s` : 'You can resend from the previous screen'}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#ccc', textAlign: 'center', marginBottom: 24 },
  infoPill: { alignSelf: 'center', color: '#bbb', backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 16, fontSize: 12 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, color: '#fff', textAlign: 'center', letterSpacing: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  backToEmail: { marginTop: 12, alignItems: 'center' },
  backToEmailText: { color: '#888', fontSize: 14 },
  resendHint: { marginTop: 12, color: '#888', textAlign: 'center' },
});


