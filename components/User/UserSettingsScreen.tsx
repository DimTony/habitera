import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

const UserSettingsScreen = () => {
  const { resetState, themeColors } = useAppStore();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#c8fedd',
      }}>
      <StatusBar style="auto" backgroundColor="#c8fedd" />
      <View className="flex-1 items-center justify-center">
      <Text>UserSettingsScreen</Text>
        <TouchableOpacity
          style={{ backgroundColor: themeColors.primaryColor }}
          className="mt-4 rounded-lg px-4 py-2"
          onPress={() => resetState()}>
          <Text className="font-medium text-white">Reset App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserSettingsScreen;
