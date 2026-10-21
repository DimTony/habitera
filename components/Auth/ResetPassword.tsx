import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { resetPassword } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import React, { useRef, useState } from 'react';
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
import * as Yup from 'yup';

const ResetSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^\d{6}$/, 'Enter the 6-digit code')
    .required('Code is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (
    text: string,
    index: number,
    setFieldValue: (field: string, value: string) => void
  ) => {
    const digits = text.replace(/\D/g, '');
    const next = [...otp];

    if (digits.length > 1) {
      digits
        .slice(0, 6 - index)
        .split('')
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      setOtp(next);
      setFieldValue('code', next.join(''));
      const focusIndex = Math.min(index + digits.length, 5);
      otpInputs.current[focusIndex]?.focus();
      return;
    }

    next[index] = digits;
    setOtp(next);
    setFieldValue('code', next.join(''));

    if (digits && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleSubmitForm = async (values: {
    code: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (!email) {
      showToast({ type: 'error', message: 'Missing email. Start again from Forgot Password.' });
      router.replace('/(auth)/forgot-password');
      return;
    }

    try {
      const result = await resetPassword({
        email,
        code: values.code,
        newPassword: values.password,
      });

      if (!result.success) {
        showToast({ type: 'error', message: result.message || 'Unable to reset password.' });
        return;
      }

      showToast({
        type: 'success',
        message: result.message || 'Password reset successful. You can log in now.',
      });
      router.replace('/(auth)');
    } catch (error) {
      showToast({ type: 'error', message: getErrorMessage(error, 'Unable to reset password.') });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: themeColors.primaryColor }}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView
            className="min-h-72 w-full"
            style={{ backgroundColor: themeColors.primaryColor }}>
            <View className="px-8 py-5">
              <Text className="text-4xl text-white">Reset</Text>
              <Text className="text-4xl text-white">Password</Text>
            </View>
            <Text className="px-8 text-sm text-white">
              Enter the 6-digit code sent to {email || 'your email'} and choose a new password
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
            <Formik
              initialValues={{ code: '', password: '', confirmPassword: '' }}
              validationSchema={ResetSchema}
              onSubmit={handleSubmitForm}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
                isValid,
                dirty,
                isSubmitting,
              }) => (
                <View className="mt-8">
                  <Text style={styles.otpLabel}>Reset code</Text>
                  <View style={styles.otpInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          otpInputs.current[index] = ref;
                        }}
                        style={[
                          styles.otpInput,
                          touched.code && errors.code ? styles.otpInputError : null,
                        ]}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index, setFieldValue)}
                        onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
                        keyboardType="number-pad"
                        maxLength={6}
                        textAlign="center"
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                  {touched.code && errors.code ? (
                    <Text style={styles.errorText}>{errors.code}</Text>
                  ) : null}

                  <View
                    style={[
                      styles.fieldSet,
                      touched.password && errors.password ? styles.fieldSetError : null,
                    ]}>
                    <Text
                      style={[
                        styles.legend,
                        touched.password && errors.password ? styles.legendError : null,
                      ]}>
                      New Password
                    </Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        className="flex-1 rounded-lg pb-3 pt-5"
                        placeholder="Enter new password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword((current) => !current)}>
                        <Ionicons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={24}
                          color="#636363"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password ? (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.fieldSet,
                      touched.confirmPassword && errors.confirmPassword
                        ? styles.fieldSetError
                        : null,
                    ]}>
                    <Text
                      style={[
                        styles.legend,
                        touched.confirmPassword && errors.confirmPassword
                          ? styles.legendError
                          : null,
                      ]}>
                      Confirm Password
                    </Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        className="flex-1 rounded-lg pb-3 pt-5"
                        placeholder="Re-enter new password"
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword((current) => !current)}>
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={24}
                          color="#636363"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    className="mt-8 items-center rounded-xl py-4"
                    style={{
                      backgroundColor:
                        isValid && dirty ? themeColors.primaryColor : '#E2E2E2',
                    }}
                    disabled={!(isValid && dirty) || isSubmitting}
                    onPress={() => handleSubmit()}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-lg font-bold text-white">Update Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <View className="mb-6 mt-10 flex w-full items-center justify-center">
              <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                <Text style={{ color: themeColors.primaryColor }}>Back to login</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  otpLabel: {
    fontSize: 14,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginHorizontal: 10,
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
  otpInputError: {
    borderColor: '#FF3B30',
  },
  fieldSet: {
    margin: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#E2E2E2',
  },
  fieldSetError: {
    borderColor: '#FF3B30',
  },
  legend: {
    position: 'absolute',
    top: -5,
    left: 15,
    backgroundColor: '#FFFFFF',
    color: '#636363',
    fontSize: 8,
    paddingHorizontal: 6,
  },
  legendError: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginLeft: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
});

export default ResetPassword;
