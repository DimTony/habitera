import { apiClient } from './client';
import type { OperationResult, PaginatedResult, PropertyDto, PropertyImageDto } from './types';

const PROPERTY = '/api/Property';

export type CreatePropertyRequest = {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  tenor?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number | null;
  price: number;
  currency?: string;
};

export async function getPublishedProperties(pageNumber = 1, pageSize = 20) {
  const { data } = await apiClient.get<PaginatedResult<PropertyDto>>(`${PROPERTY}/Published`, {
    params: { pageNumber, pageSize },
  });
  return data;
}

export async function getPropertyById(propertyId: string) {
  const { data } = await apiClient.get<OperationResult<PropertyDto>>(
    `${PROPERTY}/${propertyId}`
  );
  return data;
}

export async function getAgentProperties(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}) {
  const { data } = await apiClient.get<PaginatedResult<PropertyDto>>(
    `${PROPERTY}/Agent/Properties`,
    {
      params: {
        pageNumber: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 50,
        status: params?.status,
      },
    }
  );
  return data;
}

export type UpdatePropertyRequest = {
  title?: string;
  description?: string;
  propertyType?: string;
  listingType?: string;
  tenor?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
};

export async function createProperty(payload: CreatePropertyRequest) {
  const { data } = await apiClient.post<OperationResult<PropertyDto>>(PROPERTY, payload);
  return data;
}

export async function updateProperty(propertyId: string, payload: UpdatePropertyRequest) {
  const { data } = await apiClient.put<OperationResult<PropertyDto>>(
    `${PROPERTY}/${propertyId}`,
    payload
  );
  return data;
}

export async function updatePropertyStatus(propertyId: string, status: string) {
  const { data } = await apiClient.patch<OperationResult<string>>(
    `${PROPERTY}/${propertyId}/Status`,
    status,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return data;
}

export async function deactivateProperty(propertyId: string) {
  return updatePropertyStatus(propertyId, 'Inactive');
}

/** Submit listing for admin review (not live until approved / auto-approved). */
export async function submitForReview(propertyId: string) {
  const { data } = await apiClient.post<OperationResult<string>>(
    `${PROPERTY}/${propertyId}/SubmitForReview`
  );
  return data;
}

/** @deprecated Use submitForReview — agent publish no longer goes live immediately. */
export async function publishProperty(propertyId: string) {
  return submitForReview(propertyId);
}

export async function deleteProperty(propertyId: string) {
  const { data } = await apiClient.delete<OperationResult<string>>(`${PROPERTY}/${propertyId}`);
  return data;
}

export async function uploadPropertyImages(propertyId: string, localUris: string[]) {
  const form = new FormData();

  localUris.forEach((uri, index) => {
    const fileName = uri.split('/').pop() || `property-${index + 1}.jpg`;
    const lower = fileName.toLowerCase();
    const type = lower.endsWith('.png')
      ? 'image/png'
      : lower.endsWith('.webp')
        ? 'image/webp'
        : lower.endsWith('.gif')
          ? 'image/gif'
          : 'image/jpeg';

    form.append('images', {
      uri,
      name: fileName,
      type,
    } as unknown as Blob);
  });

  const { data } = await apiClient.post<OperationResult<PropertyImageDto[]>>(
    `${PROPERTY}/${propertyId}/Images/Multiple`,
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    }
  );
  return data;
}
