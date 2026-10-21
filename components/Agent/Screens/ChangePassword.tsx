import Ionicons from '@expo/vector-icons/Ionicons';
import { BackArrow } from 'components/Svg';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { changePassword } from 'lib/api/auth';
import { getErrorMessage } from 'lib/api/errors';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToastStore } from 'stores/useToastStore';

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePassword = () => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const isInvalid =
    !formData.oldPassword ||
    !formData.newPassword ||
    !formData.confirmNewPassword ||
    formData.newPassword !== formData.confirmNewPassword ||
    !passwordPattern.test(formData.newPassword);

  const handleResetPassword = async () => {
    if (isInvalid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await changePassword({
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (!result.success) {
        showToast({
          type: 'error',
          message: result.message || 'Failed to change password.',
        });
        return;
      }

      setShowChangeModal(true);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to change password.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowChangeModal(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Old Password</Text>
          <TextInput
            placeholder="Enter Current Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]}
            secureTextEntry={!showOldPassword}
            value={formData.oldPassword}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, oldPassword: text }))}
            textContentType="password"
            autoComplete="current-password"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => setShowOldPassword(!showOldPassword)}
            style={styles.eyeIcon}>
            <Ionicons
              name={showOldPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>New Password</Text>
          <TextInput
            placeholder="Enter New Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]}
            secureTextEntry={!showNewPassword}
            value={formData.newPassword}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
            textContentType="newPassword"
            autoComplete="new-password"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}>
            <Ionicons
              name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]}
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmNewPassword}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, confirmNewPassword: text }))
            }
            textContentType="newPassword"
            autoComplete="new-password"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {formData.newPassword.length > 0 && !passwordPattern.test(formData.newPassword) ? (
          <Text style={styles.hintText}>
            Use at least 8 characters with uppercase, lowercase, number, and special character.
          </Text>
        ) : null}

        {formData.confirmNewPassword.length > 0 &&
        formData.newPassword !== formData.confirmNewPassword ? (
          <Text style={styles.hintText}>Passwords must match.</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, { opacity: isInvalid || isSubmitting ? 0.5 : 1 }]}
          onPress={handleResetPassword}
          disabled={isInvalid || isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showChangeModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.addModalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require('../../../assets/animations/Locked.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>
            <Text style={styles.addModalTitle}>Password changed successfully</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    position: 'absolute',
    left: '5%',
    top: -8,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 5,
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 40,
    fontFamily: 'Bahnschrift',
    letterSpacing: 1.5,
    fontSize: 14,
    color: '#000',
  },
  hintText: {
    color: '#FF3B30',
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  iconContainer: {},
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  addModalTitle: {
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Bahnschrift',
  },
});

export default ChangePassword;
