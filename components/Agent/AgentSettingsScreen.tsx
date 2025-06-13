import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const AgentSettingsScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
      <StatusBar style="auto" backgroundColor="#cec7c7" />
      <Text>AgentSettingsScreen</Text>
    </View>
  );
};

export default AgentSettingsScreen;
