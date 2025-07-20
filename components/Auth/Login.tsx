import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import SwitchIcon from 'components/Icons/SwitchIcon';
import { AuthStackParamList } from 'components/Navigation/AuthNavigator';
import { BaseUrl, SubscriptionKey } from 'constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { RFValue } from 'react-native-responsive-fontsize';
// import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { ThemedText } from 'components/ThemedText';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// Define validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const DEV_EMAIL = 'bolaji.agbede@theaccesscorporation.com';
const DEV_PASSWORD = 'retreat2025';

const Login = () => {
  const router = useRouter();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setAuthenticated, userType, setUserType, themeColors, setUser } = useAppStore();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    // Here you would normally call an API to authenticate the user
    // console.log('Form values:', values);

    // Mock login success
    // In a real app, you'd call your authentication API here
    setAuthenticated(true);
  };

  const handleAutoLogin = async () => {
    // Here you would normally call an API to authenticate the user
    // console.log('Form values:', values);
    const values = { email: DEV_EMAIL, password: DEV_PASSWORD };

    // Mock login success
    // In a real app, you'd call your authentication API here

    if (userType === 'agent') {
      try {
        setIsLoading(true);

        // const response = await axios.post(
        //   `${BaseUrl}/user/login`,
        //   // { email: DEV_EMAIL, password: DEV_PASSWORD },
        //   values,
        //   {
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Ocp-Apim-Subscription-Key': SubscriptionKey,
        //     },
        //   }
        // );

        // // const data = response
        const session = {
          email: DEV_EMAIL,
          password: DEV_PASSWORD,
          firstName: 'Bolaji',
          lastName: 'Agbede',
          phoneNumber: '+2348031234567',
          userType: 'agent',
        }

        // const session = response.data.data;
        // // console.log('rrrrr', session);
        await AsyncStorage.setItem('session', JSON.stringify(session));
        setUser(session)
        await SecureStore.setItemAsync('user_email', values.email);
        await SecureStore.setItemAsync('user_password', values.password);
        // setHasStoredCredentials(true);

        // navigation.navigate('Modal' as any);
        setAuthenticated(true);
      } catch (error: any) {
        console.error('Login error:', error?.message);
        Alert.alert('Failed', 'Invalid email or password.');
      } finally {
        setIsLoading(false);
      }
    }
    // setAuthenticated(true);
  };

  // Regular input field component
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
      />
      {touched[field] && errors[field] && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{errors[field]}</Text>
      )}
    </View>
  );

  // Password field component with toggle visibility
  const PasswordField = ({
    field,
    label,
    placeholder,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    showPassword,
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
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#636363" />
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
            onSubmit={userType === 'agent' ? handleAutoLogin : handleLogin}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
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
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
                  disabled={!(isValid && dirty)}
                  onPress={() => handleSubmit()}>
                  <Text className="text-lg font-bold text-white">Log in</Text>
                </TouchableOpacity>

                {__DEV__ && (
                  <TouchableOpacity
                    style={styles.autoLoginButton}
                    onPress={() => handleAutoLogin()}
                    disabled={isLoading}>
                    <ThemedText style={styles.autoLoginButtonText}>🚀 AUTOLOGIN (DEV)</ThemedText>
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
            <TouchableOpacity onPress={() => setUserType(userType === 'user' ? 'agent' : 'user')}>
              <View className="flex-row items-center justify-center gap-4">
                <SwitchIcon />
                <Text style={{ color: themeColors.primaryColor }}>
                  Switch to {userType === 'user' ? 'agent' : 'user'}
                </Text>
              </View>
            </TouchableOpacity>
            <View className="flex-row items-center justify-center gap-2">
              <Text>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() =>
                  userType === 'user'
                    ? navigation.navigate('Signup')
                    : navigation.navigate('AgentSignup')
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
