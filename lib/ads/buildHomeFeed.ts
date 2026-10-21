import type { AppProperty } from 'lib/properties/mapProperty';
import { formatDistanceKm } from 'lib/properties/mapProperty';

import { ADS_CONFIG } from './config';

export type HomeFeedPropertyItem = {
  kind: 'property';
  key: string;
  property: AppProperty;
  distanceLabel?: string;
};

export type HomeFeedAdItem = {
  kind: 'ad';
  key: string;
  slotIndex: number;
};

export type HomeFeedNearbyHeaderItem = {
  kind: 'nearbyHeader';
  key: 'nearby-header';
  message: string;
};

export type HomeFeedItem =
  | HomeFeedPropertyItem
  | HomeFeedAdItem
  | HomeFeedNearbyHeaderItem;

/**
 * Builds a location-aware home feed:
 * local listings first, then a nearby divider, then farther listings with km.
 * In-feed ads are inserted every 5–7 properties across the full feed.
 */
export function buildLocationHomeFeed(
  local: AppProperty[],
  nearby: AppProperty[],
  interval = ADS_CONFIG.homeFeedInterval
): HomeFeedItem[] {
  const safeInterval = Math.min(7, Math.max(5, interval));
  const feed: HomeFeedItem[] = [];
  let adSlotIndex = 0;
  let propertyCount = 0;
  const totalProperties = local.length + nearby.length;

  const maybeInsertAd = () => {
    if (propertyCount > 0 && propertyCount % safeInterval === 0 && propertyCount < totalProperties) {
      feed.push({
        kind: 'ad',
        key: `ad-${adSlotIndex}`,
        slotIndex: adSlotIndex,
      });
      adSlotIndex += 1;
    }
  };

  local.forEach((property) => {
    feed.push({
      kind: 'property',
      key: `property-${property.id}`,
      property,
    });
    propertyCount += 1;
    maybeInsertAd();
  });

  if (nearby.length > 0) {
    feed.push({
      kind: 'nearbyHeader',
      key: 'nearby-header',
      message:
        local.length > 0
          ? 'No more results for this location, here are some nearby listings'
          : 'No listings in this location yet — here are some nearby listings',
    });
    nearby.forEach((property) => {
      feed.push({
        kind: 'property',
        key: `property-${property.id}`,
        property,
        distanceLabel: formatDistanceKm(property.distanceKm),
      });
      propertyCount += 1;
      maybeInsertAd();
    });
  }

  if (totalProperties > 0 && totalProperties < safeInterval) {
    feed.push({
      kind: 'ad',
      key: `ad-${adSlotIndex}`,
      slotIndex: adSlotIndex,
    });
  }

  return feed;
}

/** @deprecated Prefer buildLocationHomeFeed for the home screen. */
export function buildHomeFeed(
  properties: AppProperty[],
  interval = ADS_CONFIG.homeFeedInterval
): HomeFeedItem[] {
  return buildLocationHomeFeed(properties, [], interval);
}
