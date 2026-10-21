import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center">
        <Text>This screen does not exist.</Text>
        <Link href="/">
          <Text>Go home</Text>
        </Link>
      </View>
    </>
  );
}
