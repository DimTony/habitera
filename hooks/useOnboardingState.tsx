import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// Key used in AsyncStorage
const HAS_SEEN_ONBOARDING_KEY = 'HABITERA_HAS_SEEN_ONBOARDING';

interface UseOnboardingStateResult {
  isFirstTimeUser: boolean;
  isLoading: boolean;
  markOnboardingComplete: () => Promise<void>;
  resetOnboardingState: () => Promise<void>; // For testing/debugging
}

const useOnboardingState = (): UseOnboardingStateResult => {
  // Start with null, which means "loading"
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check AsyncStorage on component mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);

        // If hasSeenOnboarding is null or not 'true', then it's a first-time user
        setIsFirstTimeUser(hasSeenOnboarding !== 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if there's an error
        setIsFirstTimeUser(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Function to mark onboarding as complete
  const markOnboardingComplete = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
      setIsFirstTimeUser(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // Function to reset onboarding state (for testing/debugging)
  const resetOnboardingState = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(HAS_SEEN_ONBOARDING_KEY);
      setIsFirstTimeUser(true);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  };

  return {
    isFirstTimeUser,
    isLoading,
    markOnboardingComplete,
    resetOnboardingState,
  };
};

export default useOnboardingState;
