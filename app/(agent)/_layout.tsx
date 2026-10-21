import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AgentLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-property" options={{ gestureEnabled: false }} />
        <Stack.Screen name="edit-property" options={{ gestureEnabled: false }} />
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="alert-settings" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="about" />
        <Stack.Screen name="support" />
        <Stack.Screen name="add-alert" />
        <Stack.Screen name="edit-alert" />
      </Stack>
    </View>
  );
}
