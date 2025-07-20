import { BackArrow, EmailIcon, HeadsetIcon, UserIcon } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { StyleSheet } from 'react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Profile'>;

const CustomerSupport = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const handleEmailPress = async () => {
    const email = 'support@yourcompany.com'; // Replace with your actual support email
    const subject = 'Customer Support Request';
    const body = 'Hello, I need assistance with...';

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          'No email app is configured on this device. Please contact us at: ' + email,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email app. Please try again later.', [{ text: 'OK' }]);
    }
  };

  const handleCallPress = async () => {
    const phoneNumber = '+1234567890'; // Replace with your actual support phone number
    const telUrl = `tel:${phoneNumber}`;

    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        await Linking.openURL(telUrl);
      } else {
        Alert.alert(
          'Phone Not Available',
          'Unable to make calls from this device. Please call us at: ' + phoneNumber,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make a call. Please try again later.', [{ text: 'OK' }]);
    }
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
          <Text style={styles.headerTitle}>Customer Support</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'column', gap: 4 }}>
        <TouchableOpacity
          onPress={handleEmailPress}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <EmailIcon />
            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Email Us</Text>
          </View>
          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCallPress}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <HeadsetIcon />
            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Give Us a Call</Text>
          </View>
          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
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
});

export default CustomerSupport;
