import OnboardingCarousel from 'components/Onboarding/OnboardingCarousel';
import AnimatedSplash from 'components/Splash/AnimatedSplash';
import { StoreProvider } from 'providers/StoreProvider';
import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import MainApp from 'screens/MainApp';

import useSplashScreen from './hooks/useSplashScreen';
import { useAppStore } from './stores/useAppStore';
import './global.css';

const App: React.FC = () => {
  const { appIsReady, onLayoutRootView, showAnimatedSplash, setShowAnimatedSplash } =
    useSplashScreen();

  const { hasCompletedOnboarding, setUserType, setOnboardingComplete } = useAppStore();

  const handleAnimatedSplashFinish = () => {
    setShowAnimatedSplash(false);
  };

  const handleOnboardingComplete = async (type: 'user' | 'agent') => {
    setUserType(type);
    setOnboardingComplete(true);
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <StoreProvider>
      <View className="flex-1" onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor="#678B83" translucent />

        {showAnimatedSplash ? (
          <AnimatedSplash onFinish={handleAnimatedSplashFinish} />
        ) : !hasCompletedOnboarding ? (
          <OnboardingCarousel onComplete={handleOnboardingComplete} />
        ) : (
          <MainApp />
        )}
      </View>
    </StoreProvider>
  );
};

export default App;
