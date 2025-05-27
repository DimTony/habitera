import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const UserHomeScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cec7c7',
      }}>
      <StatusBar style="auto" backgroundColor="#cec7c7" />
      <Text>UserHomeScreen</Text>
    </View>
  );
};

export default UserHomeScreen;
