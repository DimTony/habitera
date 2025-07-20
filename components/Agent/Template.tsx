import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const AgentHomeScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
      <StatusBar style="auto" backgroundColor="#cec7c7" />
      <Text>AgentHomeScreen</Text>
    </View>
  );
};

export default AgentHomeScreen;
