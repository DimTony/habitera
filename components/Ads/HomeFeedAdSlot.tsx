import { ADS_CONFIG } from 'lib/ads/config';
import React, { createElement, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type HomeFeedAdSlotProps = {
  slotIndex: number;
};

/**
 * In-feed ad unit sized for Google in-feed / medium-rectangle placements.
 * - Web: mounts AdSense fluid in-feed markup when env IDs are configured
 * - Native: reserves identical geometry for AdMob (swap placeholder for Banner/NativeAd)
 */
const HomeFeedAdSlot: React.FC<HomeFeedAdSlotProps> = ({ slotIndex }) => {
  const clientId = ADS_CONFIG.adsense.clientId;
  const slotId = ADS_CONFIG.adsense.homeInFeedSlotId;
  const canRenderAdsense = Platform.OS === 'web' && Boolean(clientId && slotId);

  useEffect(() => {
    if (!canRenderAdsense || typeof window === 'undefined') return;

    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // Ignore duplicate pushes during fast refresh.
    }
  }, [canRenderAdsense, slotIndex]);

  return (
    <View
      style={[styles.wrap, { minHeight: ADS_CONFIG.inFeedAdHeight }]}
      accessibilityLabel="Advertisement">
      <Text style={styles.label}>Advertisement</Text>
      <View style={styles.unit}>
        {canRenderAdsense
          ? createElement('ins', {
              className: 'adsbygoogle',
              style: {
                display: 'block',
                width: '100%',
                minHeight: ADS_CONFIG.inFeedAdHeight - 28,
              },
              'data-ad-client': clientId,
              'data-ad-slot': slotId,
              'data-ad-format': 'fluid',
              'data-ad-layout-key': '-fb+5w+4e-db+86',
            })
          : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>Sponsored</Text>
              <Text style={styles.placeholderBody}>
                Reserved in-feed unit for Google{' '}
                {Platform.OS === 'web' ? 'AdSense' : 'AdMob'}
              </Text>
              <Text style={styles.placeholderMeta}>Slot {slotIndex + 1}</Text>
            </View>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F4F5F4',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E6E3',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#8A8F8C',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  unit: {
    width: '100%',
    minHeight: ADS_CONFIG.inFeedAdHeight - 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  placeholder: {
    width: '100%',
    minHeight: ADS_CONFIG.inFeedAdHeight - 40,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C9D0CB',
    backgroundColor: '#FAFBFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A524D',
    marginBottom: 4,
  },
  placeholderBody: {
    fontSize: 12,
    color: '#6B736E',
    textAlign: 'center',
  },
  placeholderMeta: {
    marginTop: 8,
    fontSize: 11,
    color: '#9AA39D',
  },
});

export default HomeFeedAdSlot;
