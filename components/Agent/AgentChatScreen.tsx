import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import LottieView from 'lottie-react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'AgentChat'>;

const AgentChatScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const chats: any[] = [
    {},{}
  ];

  const renderTabContent = () => {
    if (chats.length === 0) {
      return (
        <View style={styles.contentContainer}>
          <LottieView
            source={require('../../assets/animations/Chat.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.contentText}>No Conversations Found</Text>
          <Text style={styles.contentSubtext}>
            Chat history will be available when a conversation has been started by a user
          </Text>
        </View>
      );
    } else if (chats.length > 0) {
      return (
        <View style={styles.chatContentContainer}>
          
          <Text style={styles.contentText}>Chats List</Text>
          {/* Add your chat list rendering logic here */}
        </View>
      );
    } else {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>Loading Screen</Text>
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <BackArrow />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chat</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.scrollContent}>{renderTabContent()}</View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  contentText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    marginBottom: 8,
  },
  contentSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
  },
  chatContentContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 14,
  },
});

export default AgentChatScreen;
