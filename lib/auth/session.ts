import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { AuthUser } from 'lib/api/types';
import { useAppStore, type UserType } from 'stores/useAppStore';

const ACCESS_TOKEN_KEY = 'habitera_access_token';
const REFRESH_TOKEN_KEY = 'habitera_refresh_token';
const SESSION_KEY = 'session';

/** Resolve app role from API `userType` and/or polymorphic `kind`. */
export function mapApiUserType(
  userType?: string | number | null,
  kind?: string | null
): UserType {
  const candidates = [userType, kind]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).trim().toLowerCase());

  for (const value of candidates) {
    if (value === 'agent' || value === '1') return 'agent';
    if (value === 'user' || value === 'regular' || value === '0') return 'user';
  }

  return null;
}

export function resolveAuthUserType(
  user?: AuthUser | null,
  fallbackUserType?: UserType | null
): UserType | null {
  return mapApiUserType(user?.userType, user?.kind) ?? fallbackUserType ?? null;
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearAuthSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(SESSION_KEY),
  ]);

  const { setUser, setUserType, setAuthenticated } = useAppStore.getState();
  setUser(null);
  setUserType('user');
  setAuthenticated(false);
}

export async function persistAuthSession(params: {
  token?: string | null;
  refreshToken?: string | null;
  user?: AuthUser | null;
  fallbackUserType?: UserType;
}) {
  const { token, refreshToken, user, fallbackUserType } = params;

  if (token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  const mappedType = resolveAuthUserType(user, fallbackUserType) ?? 'user';
  const session = {
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    phoneNumber: user?.phoneNumber,
    profilePhoto: user?.profilePhoto,
    userType: mappedType,
    profileCompleted: user?.profileCompleted ?? false,
    completionPercentage: user?.completionPercentage ?? 0,
    city: user?.city,
    state: user?.state,
    country: user?.country,
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const { setUser, setUserType, setAuthenticated } = useAppStore.getState();
  setUser(session);
  setUserType(mappedType);
  setAuthenticated(true);
}

export async function syncLocalUser(user: AuthUser) {
  await persistAuthSession({
    user,
    fallbackUserType: useAppStore.getState().userType,
  });
}
