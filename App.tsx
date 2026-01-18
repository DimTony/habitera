import OnboardingCarousel from 'components/Onboarding/OnboardingCarousel';
import AnimatedSplash from 'components/Splash/AnimatedSplash';
import ErrorBoundary from 'components/ErrorBoundary';
import { StoreProvider } from 'providers/StoreProvider';
import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import AppNavigator from 'navigation/AppNavigator';

import useSplashScreen from './hooks/useSplashScreen';
import { useUnifiedStore } from './stores/useUnifiedStore';
import './global.css';
import ToastContainer from 'components/User/Shared/Toasts/ToastContainer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App: React.FC = () => {
  const { appIsReady, onLayoutRootView, showAnimatedSplash, setShowAnimatedSplash } =
    useSplashScreen();

  const { hasCompletedOnboarding, isAuthenticated, setUserType, setOnboardingComplete, resetState } = useUnifiedStore();

  // Debug logging
  console.log('App render state:', { 
    hasCompletedOnboarding, 
    isAuthenticated, 
    showAnimatedSplash 
  });

  const handleAnimatedSplashFinish = () => {
    setShowAnimatedSplash(false);
  };

  const handleOnboardingComplete = async (type: 'user' | 'agent') => {
    setUserType(type);
    setOnboardingComplete(true);
  };
  
  // useEffect(() => {
  //   if (__DEV__) {
  //     // Only reset in development mode
  //     resetState();
  //   }
  // }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StoreProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1" onLayout={onLayoutRootView}>
            <StatusBar barStyle="light-content" backgroundColor="#678B83" translucent />
            <ToastContainer />

            {showAnimatedSplash ? (
              <AnimatedSplash onFinish={handleAnimatedSplashFinish} />
            ) : !hasCompletedOnboarding ? (
              <OnboardingCarousel onComplete={handleOnboardingComplete} />
            ) : (
              <AppNavigator />
            )}
          </View>
        </GestureHandlerRootView>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
