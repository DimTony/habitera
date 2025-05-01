import { createStackNavigator } from '@react-navigation/stack';
import AgentApp from 'components/Agent/AgentApp';
import AuthNavigator from 'components/Navigation/AuthNavigator';
import UserApp from 'components/User/UserApp';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '../stores/useAppStore';

const Stack = createStackNavigator();

const MainApp = () => {
  const { isAuthenticated, userType, resetState } = useAppStore();

  const handleLogout = () => {
    resetState();
  };

  const renderAuthenticatedContent = () => {
    if (userType === 'user') {
      return <UserApp />;
    } else if (userType === 'agent') {
      return <AgentApp />;
    } else {
      // Fallback if userType is null or undefined
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Error: User type not specified</Text>
          <TouchableOpacity className="mt-4 rounded-lg bg-red-600 px-4 py-2" onPress={handleLogout}>
            <Text className="font-medium text-white">Return to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View className="flex-1">
      {!isAuthenticated ? (
        // Show authentication flow when not logged in
        <AuthNavigator />
      ) : (
        // Show the appropriate dashboard based on user type
        <SafeAreaView className="flex-">
          <View className="flex-row items-center justify-between bg-emerald-600 p-4">
            <Text className="text-xl font-bold text-white">
              {userType === 'user' ? 'User Dashboard' : 'Agent Dashboard'}
            </Text>
            <TouchableOpacity className="rounded-lg bg-white px-4 py-24" onPress={handleLogout}>
              <Text className="font-medium text-emerald-600">Logout</Text>
            </TouchableOpacity>
          </View>

          {renderAuthenticatedContent()}
        </SafeAreaView>
      )}
    </View>
  );
};

export default MainApp;
