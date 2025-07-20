import { BackArrow, BellIcon, HeadphoneIcon, InfoIcon, LockIcon, LogoutIcon, UserIcon } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { View, Text } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { useAppStore } from 'stores/useAppStore';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'MainTabs'>;

const AgentSettingsScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
    const { user, resetState } = useAppStore();
  

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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'column', gap: 4 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <UserIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>My Profile</Text>
          </View>

          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AlertSettings')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BellIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Alert Settings</Text>
          </View>

          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('ChangePassword')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LockIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Change Password</Text>
          </View>

          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AboutUs')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <InfoIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>About Us</Text>
          </View>

          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CustomerSupport')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <HeadphoneIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Customer Support</Text>
          </View>

          <Entypo name="chevron-small-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => resetState()}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LogoutIcon />

            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16, color: 'red' }}>Logout</Text>
          </View>
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
    fontWeight: '400',
  },
});

export default AgentSettingsScreen;
