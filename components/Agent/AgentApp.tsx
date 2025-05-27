import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

const AgentApp = () => {
  const { resetState, themeColors } = useAppStore();

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="mb-6 text-2xl font-bold text-gray-800">Agent Dashboard</Text>

        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Client Requests</Text>
          <View className="mb-3 rounded-lg bg-yellow-50 p-4">
            <Text className="font-medium text-gray-800">New property inquiry</Text>
            <Text className="text-sm text-gray-600">From: John Doe • 2 hours ago</Text>
            <TouchableOpacity className="mt-2 self-start rounded-lg bg-emerald-600 px-4 py-2">
              <Text className="font-medium text-white">Respond</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">No more pending requests.</Text>
        </View>

        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Your Listings</Text>
          <Text className="mb-3 text-gray-600">You currently have 0 active listings.</Text>
          <TouchableOpacity className="self-start rounded-lg bg-emerald-600 px-4 py-2">
            <Text className="font-medium text-white">Add New Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: themeColors.primaryColor }}
            className="mt-4 rounded-lg px-4 py-2"
            onPress={() => resetState()}>
            <Text className="font-medium text-white">Reset App</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-lg font-bold text-gray-800">Performance</Text>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Response Rate</Text>
            <Text className="font-medium text-gray-800">100%</Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Average Response Time</Text>
            <Text className="font-medium text-gray-800">N/A</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Client Satisfaction</Text>
            <Text className="font-medium text-gray-800">N/A</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AgentApp;
