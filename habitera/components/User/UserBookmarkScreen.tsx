import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

const UserBookmarkScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9d4b1',
      }}>
      <StatusBar style="auto" backgroundColor="#f9d4b1" />
      <Text>UserBookmarkScreen</Text>
    </View>
  );
};

export default UserBookmarkScreen;
