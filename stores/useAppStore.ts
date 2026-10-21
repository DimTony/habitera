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
      // Default to seeker so auth entry points don't fall through to agent signup.
      userType: 'user',
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
          userType: 'user',
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          themeColors: createThemeColors('user'),
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Functions like bgColor cannot survive JSON persistence.
      partialize: (state) => ({
        user: state.user,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.userType !== 'user' && state.userType !== 'agent') {
          state.userType = 'user';
        }
        state.themeColors = createThemeColors(state.userType);
      },
    }
  )
);
