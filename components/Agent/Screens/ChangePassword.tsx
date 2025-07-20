import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Profile'>;

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePassword = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
    const [showChangeModal, setShowChangeModal] = useState(false);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const isValid = () => {
    return (
      !formData.newPassword ||
      !formData.oldPassword ||
      !formData.confirmNewPassword ||
      formData.newPassword.trim() !== formData.confirmNewPassword.trim()
    );
  };

  const handleResetPassword = () => setShowChangeModal(true);

  const handleCloseModal = () => {
    setShowChangeModal(false);
    navigation.popTo('AgentSettings');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
      </View>

      <ScrollView
        style={{
          paddingHorizontal: 24,
          paddingVertical: 24,
          flex: 1,
          backgroundColor: '#fff',
        }}>
        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Old Password</Text>
          <TextInput
            placeholder="Enter Current Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]} // Make room for eye icon
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
            {/* Add your eye/eye-off icon here */}
            <Text>
              {showOldPassword ? (
                <Ionicons name="eye-outline" size={24} color="black" />
              ) : (
                <Ionicons name="eye-off-outline" size={24} color="black" />
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>New Password</Text>
          <TextInput
            placeholder="Enter New Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]} // Make room for eye icon
            secureTextEntry={!showNewPassword}
            value={formData.newPassword}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
            textContentType="newPassword" // iOS will suggest strong password
            autoComplete="new-password" // Help password managers
            autoCorrect={false} // Disable autocorrect
            autoCapitalize="none" // Disable auto-capitalization
            returnKeyType="next" // Show "next" on keyboard
            blurOnSubmit={false} // Don't dismiss keyboard on submit
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}>
            {/* Add your eye/eye-off icon here */}
            <Text>
              {showNewPassword ? (
                <Ionicons name="eye-outline" size={24} color="black" />
              ) : (
                <Ionicons name="eye-off-outline" size={24} color="black" />
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#9F9F9F"
            style={[styles.textInput, { paddingRight: 40 }]} // Make room for eye icon
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmNewPassword}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmNewPassword: text }))}
            textContentType="newPassword" // Match new password type
            autoComplete="new-password" // Help password managers
            autoCorrect={false} // Disable autocorrect
            autoCapitalize="none" // Disable auto-capitalization
            returnKeyType="done" // Show "done" on last field
            blurOnSubmit={true} // Dismiss keyboard on submit
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            {/* Add your eye/eye-off icon here */}
            <Text>
              {showConfirmPassword ? (
                <Ionicons name="eye-outline" size={24} color="black" />
              ) : (
                <Ionicons name="eye-off-outline" size={24} color="black" />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          // disabled={isValid()}
          style={[styles.submitButton, { opacity: isValid() ? 0.5 : 1 }]}
          onPress={handleResetPassword}
          >
          <Text style={styles.submitButtonText}>Reset Password</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showChangeModal}
        transparent={true}
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
    // paddingBottom: 10,
    // paddingTop: 15,
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
    // top: '50%',
    // transform: [{ translateY: -10 }],
    // backgroundColor: 'red',
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
  iconContainer: {
    // marginBottom: 20,
  },
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
  logoutButton: {
    backgroundColor: '#F93030',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
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
