import { View, Text, StatusBar } from 'react-native';

const AgentHomeScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
      <StatusBar barStyle="default" backgroundColor="#cec7c7" />
      <Text>AgentHomeScreen</Text>
    </View>
  );
};

export default AgentHomeScreen;
