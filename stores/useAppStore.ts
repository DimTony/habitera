import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createThemeColors } from '../theme';

export type UserType = 'user' | 'agent' | null;

interface AppState {
  userType: UserType;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  themeColors: ReturnType<typeof createThemeColors>;

  // Actions/Setters
  setUserType: (type: 'user' | 'agent') => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  resetState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      userType: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      themeColors: createThemeColors(null), // Initialize with default theme

      // Actions/Setters
      setUserType: (type) => {
        set({
          userType: type,
          themeColors: createThemeColors(type),
        });
      },

      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setOnboardingComplete: (value) => set({ hasCompletedOnboarding: value }),

      resetState: () =>
        set({
          userType: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          themeColors: createThemeColors(null),
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
