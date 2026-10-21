import * as Location from 'expo-location';

import type { LocationSuggestion } from 'lib/api/types';

export async function getDeviceLocationSuggestion(): Promise<LocationSuggestion | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  let coords: { latitude: number; longitude: number } | null = null;

  try {
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 1000 * 60 * 5,
      requiredAccuracy: 500,
    });
    if (lastKnown?.coords) {
      coords = {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
    }
  } catch {
    // Fall through to a fresh read.
  }

  if (!coords) {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    coords = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  }

  const { latitude, longitude } = coords;
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = 'Nigeria';
  let label = 'Current location';

  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = places[0];
    if (place) {
      city = place.city || place.district || place.subregion || place.name || null;
      state = place.region || null;
      country = place.country || 'Nigeria';
      label =
        [city, state].filter(Boolean).join(', ') ||
        place.name ||
        'Current location';
    }
  } catch {
    // Keep coords with a generic label.
  }

  return {
    id: `device-${latitude.toFixed(5)},${longitude.toFixed(5)}`,
    label,
    city,
    state,
    country,
    latitude,
    longitude,
  };
}
