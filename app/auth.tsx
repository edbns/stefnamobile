import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { AuthService } from '../src/services/authService';

export default function AuthScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsRequestingOTP(true);
    try {
      const response = await AuthService.requestOTP(email);

      if (response.success) {
        setShowOTPInput(true);
        setCountdown(60); // 60 second countdown
        Alert.alert('Success', 'Login code sent to your email. Please check your inbox.');
      } else {
        Alert.alert('Error', response.error || 'Failed to send login code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the login code');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Login code must be 6 digits');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const success = await login(email, otp);

      if (success) {
        // Navigate to main screen
        router.replace('/main');
      } else {
        Alert.alert('Error', 'Invalid login code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Auto-verify when OTP is complete (6 digits)
  useEffect(() => {
    if (otp.length === 6 && !isVerifyingOTP) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleRequestOTP();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        
        <Text style={styles.title}>Sign in to Stefna</Text>
        <Text style={styles.subtitle}>
          {!showOTPInput 
            ? 'Enter your email to receive a login code'
            : 'Enter the 6-digit code sent to your email'
          }
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!showOTPInput}
          />

          {!showOTPInput ? (
            <TouchableOpacity
              style={[styles.button, isRequestingOTP && styles.buttonDisabled]}
              onPress={handleRequestOTP}
              disabled={isRequestingOTP}
            >
              {isRequestingOTP ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Get Login Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
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

              <TouchableOpacity
                style={[styles.button, isVerifyingOTP && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
              >
                {isVerifyingOTP ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={[styles.buttonText, otp.length !== 6 && styles.buttonTextDisabled]}>
                    {otp.length === 6 ? 'Verifying...' : 'Enter 6-digit code'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
                onPress={handleResendOTP}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#666666',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#666',
  },
});
