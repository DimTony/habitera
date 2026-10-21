import type { ImageSourcePropType } from 'react-native';

import { API_BASE_URL } from 'lib/api/config';
import type { PropertyDto } from 'lib/api/types';

const FALLBACK_IMAGE = require('../../assets/images/onboarding-1.png');

export type AppProperty = {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  description: string;
  propertyType?: string | null;
  listingType?: string | null;
  distanceKm?: number | null;
  imageUrl?: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: ImageSourcePropType[];
  imageSource: ImageSourcePropType;
};

function tenorToPriceUnit(tenor?: string | null): string {
  switch (tenor) {
    case 'Daily':
      return 'Day';
    case 'Weekly':
      return 'Week';
    case 'Monthly':
      return 'Month';
    case 'BiAnnually':
      return '6 Months';
    case 'Outright':
      return 'Sale';
    case 'Annually':
    default:
      return 'Year';
  }
}

function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  return null;
}

function toImageSource(url?: string | null): ImageSourcePropType {
  const resolved = resolveImageUrl(url);
  if (resolved) return { uri: resolved };
  return FALLBACK_IMAGE;
}

export function mapPropertyDto(dto: PropertyDto): AppProperty {
  const sortedImages = [...(dto.images ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
  const imageUrls = sortedImages.map((img) => img.imageUrl).filter(Boolean) as string[];
  if (dto.primaryImageUrl && !imageUrls.includes(dto.primaryImageUrl)) {
    imageUrls.unshift(dto.primaryImageUrl);
  }

  const images =
    imageUrls.length > 0 ? imageUrls.map((url) => toImageSource(url)) : [FALLBACK_IMAGE];

  const location =
    dto.fullAddress ||
    [dto.street, dto.city, dto.state].filter(Boolean).join(', ') ||
    'Location unavailable';

  return {
    id: dto.id,
    propertyName: dto.title,
    location,
    bedrooms: dto.bedrooms ?? 0,
    bathrooms: Number(dto.bathrooms ?? 0),
    price: Number(dto.price ?? 0),
    currency: dto.currency === 'NGN' || !dto.currency ? '₦' : dto.currency,
    priceUnit: tenorToPriceUnit(dto.tenor),
    description: dto.description ?? '',
    propertyType: dto.propertyType ?? null,
    listingType: dto.listingType ?? null,
    distanceKm: dto.distanceKm ?? null,
    imageUrl: imageUrls[0] ?? dto.primaryImageUrl ?? null,
    coordinates: {
      latitude: Number(dto.latitude ?? 0),
      longitude: Number(dto.longitude ?? 0),
    },
    images,
    imageSource: images[0],
  };
}

export function formatDistanceKm(distanceKm?: number | null): string | undefined {
  if (distanceKm == null || Number.isNaN(distanceKm)) return undefined;
  if (distanceKm < 1) return `${Math.max(0.1, distanceKm).toFixed(1)} km`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}
