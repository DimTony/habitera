/**
 * Google ad placement config.
 * - Native (iOS/Android): use AdMob unit IDs via react-native-google-mobile-ads
 * - Web: use AdSense client/slot IDs with in-feed units
 */
export const ADS_CONFIG = {
  /** Insert an in-feed ad after this many listings (5–7 is AdSense-friendly). */
  homeFeedInterval: 6,
  /** Fixed height reserves space and avoids layout shift (important for ad quality). */
  inFeedAdHeight: 250,
  adsense: {
    clientId: process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID ?? '',
    homeInFeedSlotId: process.env.EXPO_PUBLIC_ADSENSE_HOME_FEED_SLOT ?? '',
  },
  admob: {
    // Google sample banner unit for local wiring; replace before release.
    homeInFeedUnitId: process.env.EXPO_PUBLIC_ADMOB_HOME_FEED_UNIT_ID ?? '',
  },
} as const;
