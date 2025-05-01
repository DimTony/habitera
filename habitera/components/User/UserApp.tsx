import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const UserApp = () => {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="mb-6 text-2xl font-bold text-gray-800">Welcome to User Dashboard</Text>

        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Your Recent Activity</Text>
          <Text className="text-gray-600">No recent activity to show.</Text>
        </View>

        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Quick Actions</Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity className="mb-4 mr-4 rounded-lg bg-emerald-100 p-4">
              <Text className="font-medium text-emerald-700">Search</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mb-4 mr-4 rounded-lg bg-emerald-100 p-4">
              <Text className="font-medium text-emerald-700">Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mb-4 mr-4 rounded-lg bg-emerald-100 p-4">
              <Text className="font-medium text-emerald-700">Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Your Profile</Text>
          <Text className="mb-1 text-gray-600">
            Complete your profile to get personalized recommendations.
          </Text>
          <TouchableOpacity className="mt-2 self-start rounded-lg bg-emerald-600 px-4 py-2">
            <Text className="font-medium text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserApp;
