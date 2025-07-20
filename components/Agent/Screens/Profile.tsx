import { BackArrow, CaretDown } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';
import EditIcon from 'components/Icons/EditIcon';
import LottieView from 'lottie-react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Profile'>;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string[];
}

const Profile = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
      const [showSavedModal, setShowSavedModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: [],
  });

  const handleSaveChanges = () => setShowSavedModal(true);

  const handleCloseModal = () => {
    setShowSavedModal(false);
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
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 }}>
        <View
          style={{
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
            marginVertical: 24,
          }}>
          <Image
            source={require('../../../assets/images/avatar.png')}
            style={{
              width: 74,
              height: 74,
              borderRadius: '100%',
              borderWidth: 1,
              borderColor: '#e6e6e6',
            }}
          />
        </View>

        <View style={{ alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Bahnschrift', fontSize: 18, fontWeight: '600' }}>
            Ajirioghene Okpeva
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Image source={require('../../../assets/images/Prize.png')} />
            <Text style={{ fontFamily: 'Bahnschrift', fontWeight: '300', fontSize: 12 }}>
              Verified Agent
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>First Name</Text>
          <TextInput
            placeholder="Enter First Name"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.firstName}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
          />
          <EditIcon />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Last Name</Text>
          <TextInput
            placeholder="Enter Last Name"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.lastName}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
          />
          <EditIcon />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Email Address</Text>
          <TextInput
            placeholder="Enter Email Address"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.email}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
          />
          <EditIcon />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Phone Number</Text>
          <TextInput
            placeholder="Enter Phone Number"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
          />
          <EditIcon />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Location</Text>
          <TextInput
            placeholder="Enter Location"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
          />
          <EditIcon />
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSaveChanges}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

        <Modal
              visible={showSavedModal}
              transparent={true}
              animationType="fade"
              onRequestClose={handleCloseModal}>
              <View style={styles.addModalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.iconContainer}>
                    <LottieView
                      source={require('../../../assets/animations/Save.json')}
                      autoPlay
                      loop
                      style={styles.lottieAnimation}
                    />
                  </View>
                  <Text style={styles.addModalTitle}>Profile updated successfully</Text>
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
    paddingBottom: 10,
    paddingTop: 15,
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
    width: '90%',
    height: 40,
    fontFamily: 'Bahnschrift',
    letterSpacing: 1.5,
    fontSize: 14,
    color: '#000',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  saveButton: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  saveButtonText: {
    color: '#000',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
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

export default Profile;
