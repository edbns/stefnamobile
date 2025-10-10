import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { AuthService } from '../src/services/authService';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../src/constants/colors';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuthStore();
  
  const email = (params.email as string) || '';
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !isVerifying) {
      handleVerifyOTP(otp);
    }
  }, [otp]);

  const handleVerifyOTP = async (code: string) => {
    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const result = await AuthService.verifyOTP(email, code);
      
      if (result.success) {
        setSuccess('Login successful!');
        // Store auth and navigate
        await login(result.token!, result.user!);
        router.replace('/main');
      } else {
        setError(result.error || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await AuthService.requestOTP(email);
      setSuccess('New login code sent!');
      setOtp(''); // Clear OTP input
      setResendTimer(60); // Restart timer
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter Login Code</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>
          <Text style={styles.hint}>No code? Check your spam folder</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* OTP Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login Code</Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '').slice(0, 6);
                setOtp(cleaned);
                if (cleaned.length > 0) {
                  setError('');
                  setSuccess('');
                }
              }}
              placeholder="Enter 6-digit code"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isVerifying}
              autoFocus={true}
            />
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendOTP}
            disabled={isResending || resendTimer > 0}
          >
            <Text style={[
              styles.resendText,
              (isResending || resendTimer > 0) && styles.resendTextDisabled
            ]}>
              {isResending ? 'Sending...' : 
               resendTimer > 0 ? `Resend code (${formatCountdown(resendTimer)})` : 
               'Resend code'}
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (otp.length !== 6 || isVerifying) && styles.buttonDisabled
              ]}
              onPress={() => handleVerifyOTP(otp)}
              disabled={otp.length !== 6 || isVerifying}
              activeOpacity={0.8}
            >
              {isVerifying ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <ArrowRight size={16} color={COLORS.buttonPrimaryText} />
                </View>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isVerifying}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <ArrowLeft size={16} color={COLORS.text} />
                <Text style={styles.backButtonText}>Back to Email</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Success/Error Messages */}
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  otpInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  resendTextDisabled: {
    color: COLORS.textTertiary,
  },
  actionButtons: {
    gap: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    color: COLORS.buttonPrimaryText,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.buttonSecondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  backButtonText: {
    color: COLORS.buttonSecondaryText,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  successContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#D1FAE5',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FEE2E2',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
