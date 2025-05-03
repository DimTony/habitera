import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const UserChatScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d5d3f6',
      }}>
      <StatusBar style="auto" backgroundColor="#d5d3f6" />
      <Text>UserChatScreen</Text>
    </View>
  );
};

export default UserChatScreen;
