import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { resendVerification, verifyEmail } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import { persistAuthSession } from 'lib/auth/session';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';

const CODE_LENGTH = 6;

const EmailOTP = () => {
  const router = useRouter();
  const { email: emailParam, purpose, role } = useLocalSearchParams<{
    email?: string;
    purpose?: string;
    role?: string;
  }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const roleHint =
    role === 'agent' || role === 'user' ? role : undefined;
  const { themeColors, userType } = useAppStore();
  const { showToast } = useToastStore();
  const [otp, setOtp] = useState(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!email) {
      showToast({ type: 'error', message: 'Missing email. Please sign up again.' });
      router.replace('/(auth)');
    }
  }, [email, router, showToast]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '');
    const next = [...otp];

    if (digits.length > 1) {
      digits
        .slice(0, CODE_LENGTH - index)
        .split('')
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      setOtp(next);
      otpInputs.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    next[index] = digits;
    setOtp(next);

    if (digits && index < CODE_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (!email || code.length !== CODE_LENGTH) return;

    if (purpose === 'reset') {
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, code },
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verifyEmail({ email, code });

      if (!result.success || !result.data?.token) {
        showToast({ type: 'error', message: result.message || 'Invalid verification code.' });
        return;
      }

      await persistAuthSession({
        token: result.data.token,
        refreshToken: result.data.refreshToken,
        user: result.data.user,
        fallbackUserType: roleHint ?? userType,
      });
      showToast({
        type: 'success',
        message: result.message || 'Email verified. You are signed in.',
      });
      // Root Stack.Protected routes by userType after auth flips.
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Invalid verification code.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || timer > 0 || isResending) return;

    try {
      setIsResending(true);
      const result = await resendVerification({ email });
      if (!result.success) {
        showToast({ type: 'error', message: result.message || 'Unable to resend code.' });
        return;
      }

      setOtp(Array(CODE_LENGTH).fill(''));
      setTimer(60);
      otpInputs.current[0]?.focus();
      showToast({
        type: 'success',
        message: result.message || 'A new code has been sent.',
      });
    } catch (error) {
      showToast({ type: 'error', message: getErrorMessage(error, 'Unable to resend code.') });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: themeColors.primaryColor }}>
        <StatusBar style="light" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <SafeAreaView
            style={{
              minHeight: 250,
              width: '100%',
              backgroundColor: themeColors.primaryColor,
            }}>
            <View className="px-8 py-5">
              <Text className="text-4xl text-white">Email OTP</Text>
              <Text className="text-4xl text-white">Verification</Text>
            </View>
            <Text className="px-8 text-sm text-white">
              Enter the 6-digit code sent to {email || 'your email'}
            </Text>
          </SafeAreaView>

          <View
            style={{
              flex: 1,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: 'white',
              minHeight: 500,
            }}
            className="-mt-12 p-6 pt-6">
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>OTP Code</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpInputs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={CODE_LENGTH}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              <Text style={styles.timerText}>Code expires in {formatTime(timer)}</Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0 || isResending}>
                <Text
                  style={[
                    styles.resendText,
                    {
                      color: timer > 0 ? '#9CA3AF' : themeColors.primaryColor,
                    },
                  ]}>
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                {
                  backgroundColor: isComplete ? themeColors.primaryColor : '#E2E2E2',
                },
              ]}
              disabled={!isComplete || isSubmitting}
              onPress={handleVerify}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    marginTop: 20,
    width: '100%',
  },
  otpLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  resendText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmailOTP;
