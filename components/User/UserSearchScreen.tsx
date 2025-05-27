import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const UserSearchScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7b6b6',
      }}>
      <StatusBar style="auto" backgroundColor="#f7b6b6" />
      <Text>UserSearchScreen</Text>
    </View>
  );
};

export default UserSearchScreen;
