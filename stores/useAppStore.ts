import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createThemeColors } from '../theme';

export type UserType = 'user' | 'agent' | null;

interface AppState {
  user: any;
  userType: UserType;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  themeColors: ReturnType<typeof createThemeColors>;

  // Actions/Setters
  setUser: (user: any) => void;
  setUserType: (type: 'user' | 'agent') => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  resetState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userType: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      themeColors: createThemeColors(null), // Initialize with default theme

      // Actions/Setters
      setUser: (user) => {
        set({
          user: user,
        });
      },

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
          user: null,
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
