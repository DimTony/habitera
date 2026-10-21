import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function UserLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
