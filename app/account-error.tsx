import { useAppStore } from 'stores/useAppStore';
import { Text, TouchableOpacity, View } from 'react-native';

export default function AccountError() {
  const resetState = useAppStore((state) => state.resetState);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-500">Error: User type not specified</Text>
      <TouchableOpacity className="mt-4 rounded-lg bg-red-600 px-4 py-2" onPress={resetState}>
        <Text className="font-medium text-white">Return to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
