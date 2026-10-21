import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AnimatedSplash from 'components/Splash/AnimatedSplash';
import ToastContainer from 'components/User/Shared/Toasts/ToastContainer';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import useSplashScreen from 'hooks/useSplashScreen';
import { StoreProvider } from 'providers/StoreProvider';
import { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}

function Root() {
  const colorScheme = useColorScheme();
  const { appIsReady, onLayoutRootView, showAnimatedSplash, setShowAnimatedSplash } =
    useSplashScreen();
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userType = useAppStore((state) => state.userType);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Bahnschrift: require('../assets/fonts/BAHNSCHRIFT.ttf'),
    CrimsonPro: require('../assets/fonts/CrimsonPro-Regular.ttf'),
    Cabin: require('../assets/fonts/Cabin-Regular.ttf'),
    Din: require('../assets/fonts/DIN Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!appIsReady || !loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View className="flex-1" onLayout={onLayoutRootView}>
            <StatusBar barStyle="light-content" backgroundColor="#678B83" translucent />
            <ToastContainer />
            {showAnimatedSplash ? (
              <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
            ) : (
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Protected guard={!hasCompletedOnboarding}>
                  <Stack.Screen name="onboarding" />
                </Stack.Protected>
                <Stack.Protected guard={hasCompletedOnboarding && !isAuthenticated}>
                  <Stack.Screen name="(auth)" />
                </Stack.Protected>
                <Stack.Protected
                  guard={hasCompletedOnboarding && isAuthenticated && userType === 'user'}>
                  <Stack.Screen name="(user)" />
                </Stack.Protected>
                <Stack.Protected
                  guard={hasCompletedOnboarding && isAuthenticated && userType === 'agent'}>
                  <Stack.Screen name="(agent)" />
                </Stack.Protected>
                <Stack.Protected
                  guard={hasCompletedOnboarding && isAuthenticated && userType == null}>
                  <Stack.Screen name="account-error" />
                </Stack.Protected>
              </Stack>
            )}
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
