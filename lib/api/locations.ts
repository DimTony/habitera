import { apiClient } from './client';
import type { LocationListings, LocationSuggestion, OperationResult } from './types';

const PROPERTY = '/api/Property';

export async function suggestLocations(query: string, limit = 8) {
  const { data } = await apiClient.get<OperationResult<LocationSuggestion[]>>(
    `${PROPERTY}/Locations/Suggest`,
    {
      params: { query, limit },
    }
  );
  return data;
}

export async function getListingsForLocation(params: {
  latitude: number;
  longitude: number;
  label?: string;
  city?: string;
  state?: string;
  country?: string;
  localRadiusKm?: number;
  nearbyLimit?: number;
}) {
  const { data } = await apiClient.get<OperationResult<LocationListings>>(
    `${PROPERTY}/ForLocation`,
    { params }
  );
  return data;
}
