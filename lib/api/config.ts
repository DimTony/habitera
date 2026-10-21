import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getExpoDevHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    // Expo Go / legacy manifests
    (Constants as { manifest?: { debuggerHost?: string; hostUri?: string } }).manifest
      ?.debuggerHost,
    (Constants as { manifest?: { debuggerHost?: string; hostUri?: string } }).manifest?.hostUri,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const host = candidate.split(':')[0]?.trim();
    if (host) return host;
  }

  return null;
}

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');

  // Explicit override wins, unless it is localhost while Expo is serving from a LAN host.
  // That combination is the usual "Network Error" on a physical device.
  if (configured) {
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/i.test(configured);
    const expoHost = getExpoDevHost();
    const expoIsLan = !!expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1';

    if (!(isLocalhost && expoIsLan)) {
      return configured;
    }
  }

  const expoHost = getExpoDevHost();
  if (expoHost) {
    return `http://${expoHost}:5141`;
  }

  const fallbackHost = Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
  });

  return `http://${fallbackHost}:5141`;
}

export const API_BASE_URL = resolveApiBaseUrl();
