import { Ionicons } from '@expo/vector-icons';
import HomeFeedAdSlot from 'components/Ads/HomeFeedAdSlot';
import LocationIcon from 'components/Icons/LocationIcon';
import LocationPickerModal from 'components/User/Modals/LocationPickerModal';
import { useFocusEffect, useRouter } from 'expo-router';
import { buildLocationHomeFeed, type HomeFeedItem } from 'lib/ads/buildHomeFeed';
import { getListingsForLocation } from 'lib/api/locations';
import { getErrorMessage } from 'lib/api/errors';
import { getMyProfile } from 'lib/api/profile';
import type { LocationSuggestion } from 'lib/api/types';
import { syncLocalUser } from 'lib/auth/session';
import { resolveAvatarSource } from 'lib/avatars';
import { loadHomeLocation, saveHomeLocation } from 'lib/location/preference';
import { mapPropertyDto, type AppProperty } from 'lib/properties/mapProperty';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { toBookmarkSnapshot, useBookmarkStore } from 'stores/useBookmarkStore';
import { matchesPropertyFilters, useFilterStore } from 'stores/useFilterStore';
import { useToastStore } from 'stores/useToastStore';

import PropertyCard from './Shared/PropertyCard';

const SCROLL_DIRECTION_DELTA = 6;
const COLLAPSE_MIN_OFFSET = 40;

const UserHomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeColors, user } = useAppStore();
  const { showToast } = useToastStore();
  const bookmarkIds = useBookmarkStore((state) => state.ids);
  const toggleBookmark = useBookmarkStore((state) => state.toggle);
  const pullBookmarks = useBookmarkStore((state) => state.pullIfClean);
  const listingType = useFilterStore((state) => state.listingType);
  const propertyType = useFilterStore((state) => state.propertyType);
  const bedrooms = useFilterStore((state) => state.bedrooms);
  const bathrooms = useFilterStore((state) => state.bathrooms);
  const minPrice = useFilterStore((state) => state.minPrice);
  const maxPrice = useFilterStore((state) => state.maxPrice);
  const activeFilterCount = useFilterStore((state) => state.activeCount());
  const filters = useMemo(
    () => ({ listingType, propertyType, bedrooms, bathrooms, minPrice, maxPrice }),
    [listingType, propertyType, bedrooms, bathrooms, minPrice, maxPrice]
  );
  const profileCompleted = Boolean(user?.profileCompleted);
  const completionPercentage = Number(user?.completionPercentage ?? 0);

  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [localProperties, setLocalProperties] = useState<AppProperty[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<AppProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const collapseAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [expandableHeight, setExpandableHeight] = useState(0);

  const filteredLocal = useMemo(
    () => localProperties.filter((property) => matchesPropertyFilters(property, filters)),
    [filters, localProperties]
  );
  const filteredNearby = useMemo(
    () => nearbyProperties.filter((property) => matchesPropertyFilters(property, filters)),
    [filters, nearbyProperties]
  );

  const feedItems = useMemo(
    () => buildLocationHomeFeed(filteredLocal, filteredNearby),
    [filteredLocal, filteredNearby]
  );

  useEffect(() => {
    Animated.timing(collapseAnim, {
      toValue: isHeaderCollapsed ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [collapseAnim, isHeaderCollapsed]);

  const loadListings = useCallback(
    async (location: LocationSuggestion) => {
      try {
        const result = await getListingsForLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          label: location.label,
          city: location.city ?? undefined,
          state: location.state ?? undefined,
          country: location.country ?? undefined,
        });

        if (!result.success || !result.data) {
          showToast({
            type: 'error',
            message: result.message || 'Unable to load properties.',
          });
          return;
        }

        setLocalProperties((result.data.local ?? []).map(mapPropertyDto));
        setNearbyProperties((result.data.nearby ?? []).map(mapPropertyDto));
      } catch (error) {
        showToast({
          type: 'error',
          message: getErrorMessage(error, 'Unable to load properties.'),
        });
      }
    },
    [showToast]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setIsLoading(true);
          const location = await loadHomeLocation();
          if (!active) return;
          setSelectedLocation(location);

          const [profileResult] = await Promise.all([
            getMyProfile(),
            loadListings(location),
            pullBookmarks(),
          ]);
          if (!active) return;
          if (profileResult.success && profileResult.data) {
            await syncLocalUser(profileResult.data);
          }
        } catch {
          // Keep cached session if refresh fails.
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [loadListings, pullBookmarks])
  );

  const handleRefresh = async () => {
    if (!selectedLocation) return;
    setIsRefreshing(true);
    await loadListings(selectedLocation);
    setIsRefreshing(false);
  };

  const handleSelectLocation = async (location: LocationSuggestion) => {
    setLocationPickerVisible(false);
    setSelectedLocation(location);
    await saveHomeLocation(location);
    setIsLoading(true);
    await loadListings(location);
    setIsLoading(false);
  };

  const locationLabel = selectedLocation?.label ?? 'Locating…';

  const handleFilterPress = (): void => {
    router.push('/(user)/filter');
  };

  const handlePropertyPress = (property: AppProperty): void => {
    router.push(`/(user)/property/${property.id}`);
  };

  const handleBookmarkPress = (property: AppProperty): void => {
    toggleBookmark(
      toBookmarkSnapshot({
        ...property,
        imageSource: property.imageUrl ? { uri: property.imageUrl } : property.imageSource,
      })
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = Math.max(0, event.nativeEvent.contentOffset.y);
    const delta = y - lastScrollY.current;

    if (y <= 8) {
      if (isHeaderCollapsed) setIsHeaderCollapsed(false);
    } else if (delta > SCROLL_DIRECTION_DELTA && y > COLLAPSE_MIN_OFFSET) {
      if (!isHeaderCollapsed) setIsHeaderCollapsed(true);
    } else if (delta < -SCROLL_DIRECTION_DELTA) {
      if (isHeaderCollapsed) setIsHeaderCollapsed(false);
    }

    lastScrollY.current = y;
  };

  const renderFeedItem = ({ item }: { item: HomeFeedItem }) => {
    if (item.kind === 'ad') {
      return <HomeFeedAdSlot slotIndex={item.slotIndex} />;
    }

    if (item.kind === 'nearbyHeader') {
      return (
        <View style={styles.nearbyHeader}>
          <Text style={styles.nearbyHeaderText}>{item.message}</Text>
        </View>
      );
    }

    const property = item.property;
    return (
      <PropertyCard
        propertyName={property.propertyName}
        location={property.location}
        bedrooms={property.bedrooms}
        bathrooms={property.bathrooms}
        price={property.price}
        priceUnit={property.priceUnit}
        currency={property.currency}
        imageSource={property.imageSource}
        distanceLabel={item.distanceLabel}
        isBookmarked={bookmarkIds.includes(property.id)}
        onBookmarkPress={() => handleBookmarkPress(property)}
        onCardPress={() => handlePropertyPress(property)}
        customStyles={{
          container: { marginVertical: 8 },
        }}
      />
    );
  };

  const hasListings = filteredLocal.length > 0 || filteredNearby.length > 0;
  const hasRawListings = localProperties.length > 0 || nearbyProperties.length > 0;

  const expandableMaxHeight =
    expandableHeight > 0
      ? collapseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [expandableHeight, 0],
        })
      : undefined;
  const expandableOpacity = collapseAnim.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [1, 0.35, 0],
  });
  const headerPaddingTop = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(insets.top, 20) + 16, Math.max(insets.top, 20) + 6],
  });
  const headerPaddingBottom = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 10],
  });
  const locationLabelOpacity = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const locationLabelHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const avatarSize = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 32],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Animated.View
        style={[
          styles.topChrome,
          {
            paddingTop: headerPaddingTop,
            paddingBottom: headerPaddingBottom,
          },
        ]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push('/(user)/profile')}
            style={styles.avatarContainer}>
            <Animated.Image
              source={resolveAvatarSource(user?.profilePhoto)}
              style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: 20 }]}
            />
          </TouchableOpacity>

          <View style={styles.locationWrapper}>
            <Animated.Text
              style={[
                styles.locationLabel,
                { opacity: locationLabelOpacity, height: locationLabelHeight },
              ]}>
              Location
            </Animated.Text>
            <TouchableOpacity
              style={styles.locationSelect}
              onPress={() => setLocationPickerVisible(true)}
              activeOpacity={0.75}>
              <LocationIcon color={themeColors.primaryColor} />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationLabel}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.notificationContainer}>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={20} color="#333" />
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.expandable,
            expandableMaxHeight != null ? { maxHeight: expandableMaxHeight } : null,
            { opacity: expandableOpacity },
          ]}
          pointerEvents={isHeaderCollapsed ? 'none' : 'auto'}>
          <View
            onLayout={(event) => {
              if (isHeaderCollapsed) return;
              const next = Math.ceil(event.nativeEvent.layout.height);
              if (next > 0 && Math.abs(next - expandableHeight) > 1) {
                setExpandableHeight(next);
              }
            }}>
            <View style={styles.searchSection}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color="#999" />
                <TextInput
                  placeholder="Search"
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: themeColors.primaryColor }]}
                onPress={handleFilterPress}>
                <Ionicons name="options" size={18} color="white" />
                {activeFilterCount > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            {!profileCompleted ? (
              <TouchableOpacity
                style={[styles.completeProfileCta, { borderColor: themeColors.primaryColor }]}
                onPress={() => router.push('/(user)/profile')}
                activeOpacity={0.85}>
                <View style={styles.completeProfileCopy}>
                  <Text style={styles.completeProfileTitle}>Complete your profile</Text>
                  <Text style={styles.completeProfileSubtitle}>
                    {completionPercentage > 0
                      ? `${completionPercentage}% done — add city, state, country, and location to finish.`
                      : 'Add your name, city, and location so we can personalize your home search.'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.completeProfileButton,
                    { backgroundColor: themeColors.primaryColor },
                  ]}>
                  <Text style={styles.completeProfileButtonText}>Continue</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Homes for you</Text>
              <Text style={styles.feedSubtitle}>Fresh listings near {locationLabel}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {isLoading && !hasRawListings ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={themeColors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContainer}
          renderItem={renderFeedItem}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          extraData={bookmarkIds}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {hasRawListings
                ? 'No homes match your filters. Try adjusting them.'
                : 'No homes available yet. Check back soon.'}
            </Text>
          }
        />
      )}

      <LocationPickerModal
        visible={locationPickerVisible}
        selected={selectedLocation}
        onClose={() => setLocationPickerVisible(false)}
        onSelect={handleSelectLocation}
      />
    </View>
  );
};

export default UserHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topChrome: {
    backgroundColor: '#8A8A8A80',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandable: {
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 50,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  locationWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#222',
    marginBottom: 2,
    overflow: 'hidden',
  },
  locationSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    maxWidth: 160,
  },
  notificationContainer: {
    width: 50,
    alignItems: 'flex-end',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#6B9B76',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E85D4C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  feedHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  feedTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    fontWeight: '700',
  },
  feedSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B6B6B',
  },
  nearbyHeader: {
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
  },
  nearbyHeaderText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4A5C50',
    fontWeight: '600',
    textAlign: 'center',
  },
  completeProfileCta: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F7FAF8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completeProfileCopy: {
    flex: 1,
  },
  completeProfileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  completeProfileSubtitle: {
    fontSize: 12,
    color: '#5C5C5C',
    lineHeight: 16,
  },
  completeProfileButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  completeProfileButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 14,
  },
});
