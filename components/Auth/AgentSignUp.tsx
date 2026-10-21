import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { register } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('First name is required'),
  surname: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Surname is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be at least 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const AgentSignUp = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserType, themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (values: {
    firstName: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const result = await register({
        email: values.email.trim(),
        password: values.password,
        userType: 'Agent',
        firstName: values.firstName.trim(),
        lastName: values.surname.trim(),
        phoneNumber: values.phoneNumber.trim(),
      });

      if (!result.success) {
        showToast({ type: 'error', message: result.message || 'Unable to create account.' });
        return;
      }

      // Only continue to OTP after a real pending registration.
      const registered =
        result.statusCode === 201 ||
        result.message?.toLowerCase().includes('verification code');
      if (!registered) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to create account. Please sign in instead.',
        });
        return;
      }

      // Set role only after registration succeeds (used as OTP fallback).
      setUserType('agent');
      showToast({
        type: 'success',
        message: result.message || 'Check your email for a verification code.',
      });
      router.push({
        pathname: '/(auth)/email-otp',
        params: { email: values.email.trim(), purpose: 'verify', role: 'agent' },
      });
    } catch (error) {
      showToast({ type: 'error', message: getErrorMessage(error, 'Unable to create account.') });
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
    secureTextEntry = false,
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
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
      />
      {touched[field] && errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
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
      {touched[field] && errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}>
        <SafeAreaView
          edges={['top']}
          className="min-h-72 w-full"
          style={{ backgroundColor: themeColors.primaryColor }}>
          <View className="px-8 py-5">
            <Text className="text-4xl text-white">Create your</Text>
            <Text className="text-4xl text-white">Habitera Account</Text>
          </View>
          <Text className="px-8 pb-10 text-sm text-white">
            Provide details to create your account
          </Text>
        </SafeAreaView>

        <View
          style={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            flexGrow: 1,
            backgroundColor: '#fff',
            paddingBottom: Math.max(insets.bottom, 16) + 32,
          }}
          className="-mt-12 bg-white p-6 pt-6">
          <Formik
            initialValues={{
              firstName: '',
              middleName: '',
              surname: '',
              email: '',
              phoneNumber: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSignup}>
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
                  field="firstName"
                  label="First Name"
                  placeholder="First name"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />

                <FormField
                  field="middleName"
                  label="Middle Name"
                  placeholder="Middle name"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />

                <FormField
                  field="surname"
                  label="Surname"
                  placeholder="Surname"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />

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

                <FormField
                  field="phoneNumber"
                  label="Phone Number"
                  placeholder="Phone number"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  keyboardType="number-pad"
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

                <PasswordField
                  field="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showPassword={showConfirmPassword}
                  togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <TouchableOpacity
                  className="my-8 items-center rounded-xl py-4"
                  style={{
                    backgroundColor:
                      isValid && dirty
                        ? themeColors.primaryColor
                        : themeColors.bgColor?.(0.5) ?? '#E2E2E2',
                  }}
                  disabled={!(isValid && dirty) || isSubmitting}
                  onPress={() => handleSubmit()}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View className="flex w-full items-center justify-center gap-8 bg-white px-8 py-6">
            <View className="flex-row items-center justify-center gap-2">
              <Text>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                <Text style={{ color: themeColors.primaryColor }}>Log in</Text>
              </TouchableOpacity>
            </View>
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
    color: '#FF3B30',
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
});

export default AgentSignUp;
