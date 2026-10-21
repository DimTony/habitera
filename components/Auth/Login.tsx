import { Ionicons } from '@expo/vector-icons';
import SwitchIcon from 'components/Icons/SwitchIcon';
import { ThemedText } from 'components/ThemedText';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { login } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import { persistAuthSession, resolveAuthUserType } from 'lib/auth/session';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const router = useRouter();
  const { userType, setUserType, themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);

  const goToEmailVerification = (email: string, message?: string) => {
    showToast({
      type: 'warning',
      message: message || "We've sent a verification code to your email.",
    });
    router.push({
      pathname: '/(auth)/email-otp',
      params: {
        email,
        purpose: 'verify',
        role: userType === 'agent' ? 'agent' : 'user',
      },
    });
  };

  const isUnverifiedLoginMessage = (message?: string | null) => {
    const normalized = message?.toLowerCase() ?? '';
    return (
      normalized.includes('not verified') ||
      normalized.includes('verify your email') ||
      normalized.includes('verification code')
    );
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const result = await login(values);

      if (!result.success || !result.data?.token) {
        if (isUnverifiedLoginMessage(result.message)) {
          goToEmailVerification(values.email, result.message);
          return;
        }

        showToast({ type: 'error', message: result.message || 'Invalid email or password.' });
        return;
      }

      const accountType = resolveAuthUserType(result.data.user, null);
      // Always route from the account type returned by the API, not the login toggle.
      if (accountType && accountType !== userType) {
        showToast({
          type: 'warning',
          message:
            accountType === 'agent'
              ? 'This email is an agent account. Signing you into the agent app.'
              : 'This email is a user account. Signing you into the user app.',
        });
      }

      await persistAuthSession({
        token: result.data.token,
        refreshToken: result.data.refreshToken,
        user: result.data.user,
        // Only used if API omits type/kind entirely.
        fallbackUserType: userType === 'agent' ? 'agent' : 'user',
      });
      showToast({ type: 'success', message: result.message || 'Welcome back.' });
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid email or password.');

      if (isUnverifiedLoginMessage(message)) {
        goToEmailVerification(values.email, message);
        return;
      }

      showToast({ type: 'error', message });
    }
  };

  const FormField = ({
    field,
    label,
    placeholder,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    keyboardType = 'default',
  }: any) => (
    <View style={[styles.fieldSet, touched[field] && errors[field] ? styles.fieldSetError : {}]}>
      <Text style={[styles.legend, touched[field] && errors[field] ? styles.legendError : {}]}>
        {label}
      </Text>
      <TextInput
        className="w-full rounded-lg px-4 pb-3 pt-5"
        placeholder={placeholder}
        value={values[field]}
        onChangeText={handleChange(field)}
        onBlur={handleBlur(field)}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        autoCorrect={false}
      />
      {touched[field] && errors[field] && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{errors[field]}</Text>
      )}
    </View>
  );

  const PasswordField = ({
    field,
    label,
    placeholder,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    showPassword: visible,
    togglePasswordVisibility,
  }: any) => (
    <View style={[styles.fieldSet, touched[field] && errors[field] ? styles.fieldSetError : {}]}>
      <Text style={[styles.legend, touched[field] && errors[field] ? styles.legendError : {}]}>
        {label}
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          className="flex-1 rounded-lg pb-3 pt-5"
          placeholder={placeholder}
          value={values[field]}
          onChangeText={handleChange(field)}
          onBlur={handleBlur(field)}
          secureTextEntry={!visible}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Ionicons name={visible ? 'eye-off' : 'eye'} size={24} color="#636363" />
        </TouchableOpacity>
      </View>
      {touched[field] && errors[field] && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <View style={{ backgroundColor: themeColors.primaryColor, flex: 1 }}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} className="h-full">
        <SafeAreaView
          className="min-h-72 w-full"
          style={{ backgroundColor: themeColors.primaryColor }}>
          <View className="px-8 py-5">
            <Text className="text-4xl text-white">Sign in to your</Text>
            <Text className="text-4xl text-white">Account</Text>
          </View>
          <Text className="px-8 text-sm text-white">
            Provide Login credentials to proceed to homescreen
          </Text>
        </SafeAreaView>
        <View
          style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40, flex: 1, minHeight: 500 }}
          className="-mt-12 bg-white p-6 pt-6">
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
              isSubmitting,
            }) => (
              <View className="mt-10">
                <FormField
                  field="email"
                  label="Email Address"
                  placeholder="Email address"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  keyboardType="email-address"
                />

                <PasswordField
                  field="password"
                  label="Password"
                  placeholder="Enter your password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showPassword={showPassword}
                  togglePasswordVisibility={() => setShowPassword(!showPassword)}
                />

                <View className="mb-8 flex w-full items-end justify-start px-3">
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text style={{ color: themeColors.primaryColor }} className="text-xs">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="items-center rounded-xl py-4"
                  style={{
                    backgroundColor:
                      isValid && dirty
                        ? themeColors.primaryColor
                        : themeColors.bgColor
                          ? themeColors.bgColor(0.5)
                          : '#E2E2E2',
                  }}
                  disabled={!(isValid && dirty) || isSubmitting}
                  onPress={() => handleSubmit()}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Log in</Text>
                  )}
                </TouchableOpacity>

                {__DEV__ && (
                  <TouchableOpacity
                    style={styles.autoLoginButton}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting || !(isValid && dirty)}>
                    <ThemedText style={styles.autoLoginButtonText}>
                      🚀 LOGIN WITH FORM (DEV)
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Formik>

          <View className="flex w-full flex-row items-center justify-center gap-2 bg-white px-8 py-4">
            <View
              className="h-[1px] flex-1"
              style={{
                backgroundColor: themeColors.bgColor ? themeColors.bgColor(0.5) : '#E2E2E2',
              }}
            />
            <Text className="text-sm">or login with</Text>
            <View
              className="h-[1px] flex-1"
              style={{
                backgroundColor: themeColors.bgColor ? themeColors.bgColor(0.5) : '#E2E2E2',
              }}
            />
          </View>

          <View className="w-full flex-row items-center justify-center gap-4 bg-white">
            <TouchableOpacity className="flex flex-row items-center justify-center gap-2 rounded-xl border border-[#E2E2E2] px-10 py-7">
              <Image source={require('../../assets/images/google.png')} />
              <Text>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex flex-row items-center justify-center gap-2 rounded-xl border border-[#E2E2E2] px-10 py-7">
              <Image source={require('../../assets/images/facebook.png')} />
              <Text>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View className="flex w-full flex-1 items-center justify-center gap-8 bg-white px-8 pt-10">
            <TouchableOpacity
              onPress={() => setUserType(userType === 'agent' ? 'user' : 'agent')}>
              <View className="flex-row items-center justify-center gap-4">
                <SwitchIcon />
                <Text style={{ color: themeColors.primaryColor }}>
                  Switch to {userType === 'agent' ? 'user' : 'agent'}
                </Text>
              </View>
            </TouchableOpacity>
            <View className="flex-row items-center justify-center gap-2">
              <Text>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() =>
                  userType === 'agent'
                    ? router.push('/(auth)/agent-signup')
                    : router.push('/(auth)/signup')
                }>
                <Text style={{ color: themeColors.primaryColor }}>Register now</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginLeft: 5,
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
  autoLoginButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#20c997',
  },
  autoLoginButtonText: {
    color: 'white',
    fontSize: RFValue(13),
    fontWeight: '600',
    fontFamily: 'Matter',
  },
});

export default Login;
