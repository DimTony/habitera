import { apiClient } from './client';
import type { OperationResult, PaginatedResult, PropertyDto } from './types';

const FAVORITE = '/api/Favorite';

export async function getFavoriteIds() {
  const { data } = await apiClient.get<OperationResult<{ propertyIds: string[] }>>(
    `${FAVORITE}/Ids`
  );
  return data;
}

export async function getFavoriteProperties(pageNumber = 1, pageSize = 20) {
  const { data } = await apiClient.get<PaginatedResult<PropertyDto>>(FAVORITE, {
    params: { pageNumber, pageSize },
  });
  return data;
}

export async function toggleFavorite(propertyId: string) {
  const { data } = await apiClient.post<OperationResult<boolean>>(
    `${FAVORITE}/${propertyId}/Toggle`
  );
  return data;
}

/** Offline-first: push desired lightweight property IDs to the server. */
export async function syncFavoriteIds(propertyIds: string[]) {
  const { data } = await apiClient.put<OperationResult<{ propertyIds: string[] }>>(
    `${FAVORITE}/Sync`,
    { propertyIds }
  );
  return data;
}
