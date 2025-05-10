import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from 'components/Navigation/AuthNavigator';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'EmailOTP'>;

const EmailOTP = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { themeColors } = useAppStore();

  // State for OTP inputs
  const [otp, setOtp] = useState(['', '', '', '']);
  // Timer for OTP expiration
  const [timer, setTimer] = useState(60); // 60 seconds

  // References for OTP input fields to enable auto-focus
  const otpInputs = useRef<Array<TextInput | null>>([]);

  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // If pasting the whole code
      const otpArray = text.split('').slice(0, 4);
      const newOtp = [...otp];

      otpArray.forEach((digit, idx) => {
        if (idx < 4) {
          newOtp[index + idx] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on the last input or move to next empty input
      const nextIndex = Math.min(index + otpArray.length, 4);
      otpInputs.current[nextIndex]?.focus();
    } else {
      // For single digit input
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto focus to next input if current input is filled
      if (text !== '' && index < 3) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Move focus to previous input if current is empty and backspace is pressed
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle verify button press
  const handleVerify = () => {
    const otpCode = otp.join('');
    console.log('Verifying OTP:', otpCode);
    // Here you would normally validate the OTP with your API
    // If successful, navigate to the next screen
    // For now, we'll just navigate to the next screen for demonstration
    navigation.navigate('Login'); // Replace with your next screen
  };

  // Handle resend code
  const handleResend = () => {
    // Reset the OTP inputs
    setOtp(['', '', '', '', '']);
    // Reset the timer
    setTimer(60);
    // Focus on the first input
    otpInputs.current[0]?.focus();
    // Here you would call your API to resend the OTP
    console.log('Resending OTP code');
  };

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
            <Text className="px-8 text-sm text-white">Check your email for verification code</Text>
          </SafeAreaView>

          {/* White content area with rounded top corners */}
          <View
            style={{
              flex: 1,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: 'white',
              minHeight: 500,
            }}
            className="-mt-12 p-6 pt-6">
            {/* OTP Input Section */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>OTP Code</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={5}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              <Text style={styles.timerText}>Code expires in {formatTime(timer)}</Text>
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendText, { color: themeColors.primaryColor }]}>
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                {
                  backgroundColor: otp.every((digit) => digit !== '')
                    ? themeColors.primaryColor
                    : '#E2E2E2',
                },
              ]}
              disabled={!otp.every((digit) => digit !== '')}
              onPress={handleVerify}>
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            </TouchableOpacity>

            {/* This empty view ensures the white background extends to fill the screen */}
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
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 10,
    fontSize: 24,
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
