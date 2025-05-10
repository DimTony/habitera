import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect, useCallback } from 'react';

interface UseSplashScreenReturn {
  appIsReady: boolean;
  onLayoutRootView: () => Promise<void>;
  showAnimatedSplash: boolean;
  setShowAnimatedSplash: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define font types for type safety
interface FontMap {
  [key: string]: number | string;
}

export const useSplashScreen = (
  customFonts?: FontMap,
  loadingTime: number = 1000
): UseSplashScreenReturn => {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState<boolean>(true);

  // Handle font loading with provided fonts or empty object
  const [fontsLoaded] = useFonts(customFonts || {});

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we prepare resources
        await SplashScreen.preventAutoHideAsync();
        SplashScreen.setOptions({
          duration: 1000,
          fade: true,
        });

        // Add any data fetching logic here
        // Example: await fetchDataFromAPI();

        // Artificial delay for demo purposes
        await new Promise((resolve) => setTimeout(resolve, loadingTime));
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [loadingTime]);

  const onLayoutRootView = useCallback(async (): Promise<void> => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  return {
    appIsReady,
    onLayoutRootView,
    showAnimatedSplash,
    setShowAnimatedSplash,
  };
};

export default useSplashScreen;
