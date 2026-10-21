import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { changePassword } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';
import * as Yup from 'yup';

import TabsLayout from '../TabsLayout';

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
});

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (values: PasswordFormValues): Promise<void> => {
    try {
      const result = await changePassword({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (!result.success) {
        showToast({
          type: 'error',
          message: result.message || 'Failed to change password.',
        });
        return;
      }

      showToast({
        type: 'success',
        message: result.message || 'Password changed successfully.',
      });
      router.back();
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to change password.'),
      });
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
    <TabsLayout tabName="Change Password" onBack={() => router.back()}>
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
            isSubmitting,
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

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { backgroundColor: themeColors?.primaryColor || '#6B9B76' },
                  (!isValid || !dirty || isSubmitting) && styles.resetButtonDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={!isValid || !dirty || isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </TabsLayout>
  );
};

const styles = StyleSheet.create({
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
