import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import * as Yup from 'yup';

import { RootStackParamList } from '../types/navigation';
import TabsLayout from '../TabsLayout';

type ChangePasswordNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Old password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
});

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordNavigationProp>();
  const { themeColors } = useAppStore();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleResetPassword = async (values: PasswordFormValues): Promise<void> => {
    try {
      // Simulate API call
      console.log('Changing password with values:', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      // Show success message
      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

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
  }: {
    field: keyof PasswordFormValues;
    label: string;
    placeholder: string;
    values: PasswordFormValues;
    errors: any;
    touched: any;
    handleChange: any;
    handleBlur: any;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
  }) => (
    <View style={[styles.fieldSet, touched[field] && errors[field] ? styles.fieldSetError : {}]}>
      <Text style={[styles.legend, touched[field] && errors[field] ? styles.legendError : {}]}>
        {label}
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={values[field]}
          onChangeText={handleChange(field)}
          onBlur={handleBlur(field)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#636363" />
        </TouchableOpacity>
      </View>
      {touched[field] && errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <TabsLayout tabName="Change Password" onBack={() => navigation.goBack()}>
      {/* Form */}
      <View style={styles.content}>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleResetPassword}>
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isValid,
            dirty,
          }) => (
            <>
              <View style={styles.form}>
                <PasswordField
                  field="oldPassword"
                  label="Old Password"
                  placeholder="Enter old password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showPassword={showOldPassword}
                  togglePasswordVisibility={() => setShowOldPassword(!showOldPassword)}
                />

                <PasswordField
                  field="newPassword"
                  label="New Password"
                  placeholder="Enter new password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showPassword={showNewPassword}
                  togglePasswordVisibility={() => setShowNewPassword(!showNewPassword)}
                />

                <PasswordField
                  field="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showPassword={showConfirmPassword}
                  togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { backgroundColor: themeColors?.primaryColor || '#6B9B76' },
                  (!isValid || !dirty) && styles.resetButtonDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={!isValid || !dirty}>
                <Text style={styles.resetButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </TabsLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  form: {
    flex: 1,
  },
  fieldSet: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#fff',
    position: 'relative',
  },
  fieldSetError: {
    borderColor: '#FF3B30',
  },
  legend: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 6,
    fontWeight: '500',
  },
  legendError: {
    color: '#FF3B30',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    top: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  resetButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
