import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const AgentChatScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
      <StatusBar style="auto" backgroundColor="#cec7c7" />
      <Text>AgentChatScreen</Text>
    </View>
  );
};

export default AgentChatScreen;
