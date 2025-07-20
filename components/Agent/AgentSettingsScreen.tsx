import {
  BackArrow,
  BellIcon,
  HeadphoneIcon,
  InfoIcon,
  LockIcon,
  LogoutIcon,
  UserIcon,
} from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { useAppStore } from 'stores/useAppStore';
import LottieView from 'lottie-react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'MainTabs'>;

interface SettingsItem {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  textColor?: string;
}

const AgentSettingsScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const { resetState } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    resetState();
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  const settingsItems: SettingsItem[] = [
    {
      icon: <UserIcon />,
      title: 'My Profile',
      onPress: () => navigation.navigate('Profile'),
      showChevron: true,
    },
    {
      icon: <BellIcon />,
      title: 'Alert Settings',
      onPress: () => navigation.navigate('AlertSettings'),
      showChevron: true,
    },
    {
      icon: <LockIcon />,
      title: 'Change Password',
      onPress: () => navigation.navigate('ChangePassword'),
      showChevron: true,
    },
    {
      icon: <InfoIcon />,
      title: 'About Us',
      onPress: () => navigation.navigate('AboutUs'),
      showChevron: true,
    },
    {
      icon: <HeadphoneIcon />,
      title: 'Customer Support',
      onPress: () => navigation.navigate('CustomerSupport'),
      showChevron: true,
    },
    {
      icon: <LogoutIcon />,
      title: 'Logout',
      onPress: handleLogoutPress,
      showChevron: false,
      textColor: 'red',
    },
  ];

  const renderSettingsItem = (item: SettingsItem, index: number) => (
    <TouchableOpacity key={index} onPress={item.onPress} style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        {item.icon}
        <Text style={[styles.settingsItemText, { color: item.textColor || '#000' }]}>
          {item.title}
        </Text>
      </View>
      {item.showChevron && <Entypo name="chevron-small-right" size={24} color="black" />}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <View style={styles.settingsContainer}>{settingsItems.map(renderSettingsItem)}</View>

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
    fontWeight: '400',
  },
  // Settings items
  settingsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsItemText: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
  },
  // Modal styles (smaller scale)
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
  iconContainer: {
    marginBottom: 20,
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

export default AgentSettingsScreen;
