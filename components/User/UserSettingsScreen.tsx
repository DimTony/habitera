import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useUnifiedStore } from '@/stores/useUnifiedStore';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';

import TabsLayout from './TabsLayout';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';
import { useNavigation } from '@react-navigation/native';

const UserSettingsScreen = () => {
  type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const { resetState, showToast } = useUnifiedStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    resetState();
  };
  const handleCancelLogout = () => setShowLogoutModal(false);
    const settingsItems = [
    {
      id: 1,
      title: 'My Profile',
      icon: 'person-outline',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 2,
      title: 'Notification Settings',
      icon: 'notifications-outline',
      onPress: () => showToast({
          message: 'Coming soon!',
          type: 'success',
          duration: 3000,
        }),
      // onPress: () => console.log('Notification Settings pressed, were fixing this now'),
    },
    {
      id: 3,
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 4,
      title: 'About Us',
      icon: 'information-circle-outline',
      onPress: () => showToast({
          message: 'Coming soon!',
          type: 'success',
          duration: 3000,
        }),
    },
    {
      id: 5,
      title: 'Customer Support',
      icon: 'headset-outline',
      onPress: () => showToast({
          message: 'Coming soon!',
          type: 'success',
          duration: 3000,
        }),
    },
  ];

  const SettingsItem = ({ item, isLast = false }: any) => (
    <TouchableOpacity
      style={[styles.settingsItem, !isLast && styles.settingsItemBorder]}
      onPress={item.onPress}
      activeOpacity={0.7}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={20} color="#666" />
        </View>
        <Text style={styles.settingsItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );

  const LogOutItem = () => (
    <TouchableOpacity
      style={[styles.settingsItem, styles.logoutItem]}
      onPress={handleLogoutPress}
      activeOpacity={0.7}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name="log-out-outline" size={20} color="#ff4757" />
        </View>
        <Text style={[styles.settingsItemText, styles.logoutText]}>Log Out</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <TabsLayout tabName="Settings">
      <View style={styles.settingsContainer}>
        {settingsItems.map((item, index) => (
          <SettingsItem key={item.id} item={item} isLast={index === settingsItems.length - 1} />
        ))}
      </View>

      {/* Log Out Section */}
      <View style={[styles.settingsContainer, styles.logoutContainer]}>
        <LogOutItem />
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require('../../assets/animations/Log out.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>
            <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleConfirmLogout}>
                <Text style={styles.logoutButtonText}>Yes, Log Out</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelLogout}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 15,
    paddingTop: 60,
    backgroundColor: '#8A8A8A80',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  headerSpacer: {
    width: 34, // Same width as back button to center the title
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutContainer: {
    marginTop: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingsItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff4757',
  },
  // Modal styles
  modalOverlay: {
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
  lottieAnimation: {
    width: 80,
    height: 80,
  },
  modalTitle: {
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

export default UserSettingsScreen;
