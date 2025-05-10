import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface ErrorState {
  [key: string]: { hasError: boolean; message: string };
}

interface AppState {
  auth: AuthState;
  loading: boolean;
  errors: ErrorState;

  setErrors: (field: string, hasError: boolean, message?: string) => void;
  setLoading: (loading: boolean) => void;

  clearErrors: () => void;
  resetStore: () => void;
}

const initialState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
  },
  loading: false,
  errors: {},
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setErrors: (field, hasError, message = 'An error occurred') => {
        set((state) => ({
          errors: {
            ...state.errors,
            [field]: { hasError, message },
          },
        }));

        Toast.show({
          type: 'error',
          text1: 'Error', // Title of the toast
          text2: message, // Display the error message
          // visibilityTime: 4000, // Keeps it visible for 4 seconds
          // autoHide: true,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      clearErrors: () => set({ errors: {} }),

      resetStore: () => set(initialState),
    }),
    {
      name: 'habitera',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        auth: { token: state.auth.token },
      }),
    }
  )
);
