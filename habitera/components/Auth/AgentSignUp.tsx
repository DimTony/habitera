import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from 'components/Navigation/AuthNavigator';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
// import { themeColors } from 'theme';
import * as Yup from 'yup';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AgentSignup'>;

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
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setAuthenticated, userType, setUserType, themeColors } = useAppStore();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (values: {
    firstName: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Here you would normally call an API to register the user
    console.log('Form values:', values);

    // Mock signup success
    // In a real app, you'd call your authentication API here
    navigation.navigate('EmailOTP');
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
      />
      {touched[field] && errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
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
      {touched[field] && errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.bgColor(1) }}>
      <StatusBar style="auto" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} className="h-full">
        <SafeAreaView
          className="min-h-72 w-full"
          style={{ backgroundColor: themeColors.bgColor(1) }}>
          <View className="px-8 py-5">
            <Text className="text-4xl text-white">Create your</Text>
            <Text className="text-4xl text-white">Habitera Account</Text>
          </View>
          <Text className="px-8 text-sm text-white">Provide details to create your account</Text>
        </SafeAreaView>

        <View
          style={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            flex: 1,
            minHeight: 500,
            backgroundColor: 'white',
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
                      isValid && dirty ? themeColors.bgColor(1) : themeColors.bgColor(0.5),
                  }}
                  disabled={!(isValid && dirty)}
                  onPress={() => handleSubmit}>
                  <Text className="text-lg font-bold text-white">Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View className="flex w-full flex-1 items-center justify-center gap-8 bg-white px-8 py-10">
            <TouchableOpacity onPress={() => setUserType(userType === 'user' ? 'agent' : 'user')}>
              {/* <View className="flex-row items-center justify-center gap-4">
              <SwitchIcon />
              <Text style={{ color: themeColors.primaryUser }}>
                Switch to {userType === 'user' ? 'agent' : 'user'}
              </Text>
            </View> */}
            </TouchableOpacity>
            <View className="flex-row items-center justify-center gap-2">
              <Text>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
