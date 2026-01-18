import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Toast from 'react-native-toast-message';
import { createThemeColors } from '../theme';
import { AppState, UserType, User, Property, Chat, Alert, Toast as ToastType } from './types';

const initialState = {
  // Auth
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  },
  
  // App State
  hasCompletedOnboarding: false,
  userType: null,
  themeColors: createThemeColors(null),
  isAuthenticated: false,
  
  // Data
  properties: [],
  bookmarks: [],
  chats: [],
  alerts: [],
  
  // UI State
  loading: false,
  errors: {},
  toasts: [],
};

export const useUnifiedStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Auth Actions
      setUser: (user) => {
        set((state) => ({
          auth: { ...state.auth, user },
        }));
      },

      setToken: (token) => {
        set((state) => ({
          auth: { ...state.auth, token },
        }));
      },

      setAuthenticated: (isAuthenticated) => {
        set((state) => ({
          auth: { ...state.auth, isAuthenticated },
          isAuthenticated,
        }));
      },

      setLoading: (loading) => {
        set((state) => ({
          auth: { ...state.auth, isLoading: loading },
          loading,
        }));
      },

      login: async (email: string, password: string, userType: UserType = 'user') => {
        try {
          set((state) => ({
            auth: { ...state.auth, isLoading: true },
            loading: true,
          }));

          // TODO: Replace with actual API call
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1234567890',
            userType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken = 'mock-jwt-token';

          set((state) => ({
            auth: {
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            },
            userType,
            themeColors: createThemeColors(userType),
            isAuthenticated: true,
            loading: false,
          }));

          // Store credentials securely
          await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
          await AsyncStorage.setItem('auth_token', mockToken);

        } catch (error) {
          set((state) => ({
            auth: { ...state.auth, isLoading: false },
            loading: false,
          }));
          throw error;
        }
      },

      logout: () => {
        set(initialState);
        AsyncStorage.multiRemove(['user_session', 'auth_token']);
      },

      // App Actions
      setOnboardingComplete: (completed) => {
        set({ hasCompletedOnboarding: completed });
      },

      setUserType: (userType: UserType) => {
        set((state) => ({
          userType,
          themeColors: createThemeColors(userType),
        }));
      },

      // Data Actions
      setProperties: (properties) => {
        set({ properties });
      },

      addProperty: (property) => {
        set((state) => ({
          properties: [...state.properties, property],
        }));
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((property) =>
            property.id === id ? { ...property, ...updates } : property
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((property) => property.id !== id),
        }));
      },

      setBookmarks: (bookmarks) => {
        set({ bookmarks });
      },

      toggleBookmark: (propertyId) => {
        set((state) => {
          const isBookmarked = state.bookmarks.includes(propertyId);
          return {
            bookmarks: isBookmarked
              ? state.bookmarks.filter((id) => id !== propertyId)
              : [...state.bookmarks, propertyId],
          };
        });
      },

      setChats: (chats) => {
        set({ chats });
      },

      addChat: (chat) => {
        set((state) => ({
          chats: [...state.chats, chat],
        }));
      },

      updateChat: (id, updates) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, ...updates } : chat
          ),
        }));
      },

      setAlerts: (alerts) => {
        set({ alerts });
      },

      addAlert: (alert) => {
        set((state) => ({
          alerts: [...state.alerts, alert],
        }));
      },

      updateAlert: (id, updates) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, ...updates } : alert
          ),
        }));
      },

      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        }));
      },

      // Error Actions
      setError: (field, hasError, message = 'An error occurred') => {
        set((state) => ({
          errors: {
            ...state.errors,
            [field]: { hasError, message },
          },
        }));

        if (hasError) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: message,
          });
        }
      },

      clearError: (field) => {
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        });
      },

      clearAllErrors: () => {
        set({ errors: {} });
      },

      // Toast Actions
      showToast: (toast) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: ToastType = {
          id,
          duration: 4000,
          ...toast,
        };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-hide toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, newToast.duration);
        }
      },

      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearAllToasts: () => {
        set({ toasts: [] });
      },

      // Reset
      resetState: () => {
        set(initialState);
        AsyncStorage.multiRemove(['user_session', 'auth_token']);
      },
    }),
    {
      name: 'habitera-unified-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        auth: {
          user: state.auth.user,
          token: state.auth.token,
          isAuthenticated: state.auth.isAuthenticated,
        },
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userType: state.userType,
        themeColors: state.themeColors,
        isAuthenticated: state.isAuthenticated,
        bookmarks: state.bookmarks,
      }),
    }
  )
);

// Selectors for better performance
export const useAuth = () => useUnifiedStore((state) => state.auth);
export const useUser = () => useUnifiedStore((state) => state.auth.user);
export const useIsAuthenticated = () => useUnifiedStore((state) => state.auth.isAuthenticated);
export const useUserType = () => useUnifiedStore((state) => state.userType);
export const useThemeColors = () => useUnifiedStore((state) => state.themeColors);
export const useProperties = () => useUnifiedStore((state) => state.properties);
export const useBookmarks = () => useUnifiedStore((state) => state.bookmarks);
export const useToasts = () => useUnifiedStore((state) => state.toasts);
export const useLoading = () => useUnifiedStore((state) => state.loading);
export const useErrors = () => useUnifiedStore((state) => state.errors);
