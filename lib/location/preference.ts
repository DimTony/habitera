import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LocationSuggestion } from 'lib/api/types';

import { getDeviceLocationSuggestion } from './device';

const STORAGE_KEY = 'habitera.home.location';
const RECENT_STORAGE_KEY = 'habitera.home.location.recent';
export const MAX_RECENT_LOCATIONS = 10;

/** Used only when GPS/permission is unavailable. */
export const FALLBACK_HOME_LOCATION: LocationSuggestion = {
  id: 'fallback-surulere',
  label: 'Surulere, Lagos',
  city: 'Surulere',
  state: 'Lagos',
  country: 'Nigeria',
  latitude: 6.4969,
  longitude: 3.3569,
};

function isValidLocation(value: unknown): value is LocationSuggestion {
  if (!value || typeof value !== 'object') return false;
  const parsed = value as LocationSuggestion;
  return (
    typeof parsed.latitude === 'number' &&
    typeof parsed.longitude === 'number' &&
    typeof parsed.label === 'string' &&
    parsed.label.length > 0
  );
}

function locationDedupeKey(location: LocationSuggestion): string {
  return `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
}

export async function loadSavedHomeLocation(): Promise<LocationSuggestion | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValidLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isLegacyAutoDefault(location: LocationSuggestion): boolean {
  return (
    location.id === 'default-surulere' ||
    location.id === 'fallback-surulere'
  );
}

/**
 * Prefer a saved choice; otherwise resolve from the device GPS.
 * Falls back to Surulere only if location cannot be determined.
 */
export async function loadHomeLocation(): Promise<LocationSuggestion> {
  const saved = await loadSavedHomeLocation();
  if (saved && !isLegacyAutoDefault(saved)) return saved;

  try {
    const device = await getDeviceLocationSuggestion();
    if (device) {
      await saveHomeLocation(device);
      return device;
    }
  } catch {
    // Use fallback below.
  }

  return FALLBACK_HOME_LOCATION;
}

export async function loadRecentLocations(): Promise<LocationSuggestion[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidLocation)
      .filter((location) => !isLegacyAutoDefault(location))
      .slice(0, MAX_RECENT_LOCATIONS);
  } catch {
    return [];
  }
}

export async function pushRecentLocation(
  location: LocationSuggestion
): Promise<LocationSuggestion[]> {
  if (isLegacyAutoDefault(location)) {
    return loadRecentLocations();
  }

  const existing = await loadRecentLocations();
  const key = locationDedupeKey(location);
  const next = [
    location,
    ...existing.filter((item) => locationDedupeKey(item) !== key),
  ].slice(0, MAX_RECENT_LOCATIONS);

  await AsyncStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function saveHomeLocation(location: LocationSuggestion): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  await pushRecentLocation(location);
}
