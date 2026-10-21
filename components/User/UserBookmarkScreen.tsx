import { useFocusEffect, useRouter } from 'expo-router';
import { getFavoriteProperties } from 'lib/api/favorites';
import { mapPropertyDto } from 'lib/properties/mapProperty';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageSourcePropType,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { toBookmarkSnapshot, useBookmarkStore } from 'stores/useBookmarkStore';

import PropertyCard from './Shared/PropertyCard';
import TabsLayout from './TabsLayout';

const FALLBACK_IMAGE = require('../../assets/images/onboarding-1.png');

type BookmarkRow = {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  imageSource: ImageSourcePropType;
  imageUrl?: string | null;
};

const UserBookmarkScreen = () => {
  const router = useRouter();
  const { themeColors } = useAppStore();
  const ids = useBookmarkStore((state) => state.ids);
  const snapshots = useBookmarkStore((state) => state.snapshots);
  const toggleBookmark = useBookmarkStore((state) => state.toggle);
  const pullIfClean = useBookmarkStore((state) => state.pullIfClean);
  const sync = useBookmarkStore((state) => state.sync);

  const [remoteRows, setRemoteRows] = useState<BookmarkRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRemote = useCallback(async () => {
    try {
      const result = await getFavoriteProperties(1, 50);
      if (!result.success) return;
      setRemoteRows(
        (result.data ?? []).map((dto) => {
          const mapped = mapPropertyDto(dto);
          return {
            id: mapped.id,
            propertyName: mapped.propertyName,
            location: mapped.location,
            bedrooms: mapped.bedrooms,
            bathrooms: mapped.bathrooms,
            price: mapped.price,
            currency: mapped.currency,
            priceUnit: mapped.priceUnit,
            imageSource: mapped.imageSource,
            imageUrl: mapped.imageUrl,
          };
        })
      );
    } catch {
      // Offline: fall back to local snapshots.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setIsLoading(true);
        await pullIfClean();
        if (!active) return;
        await loadRemote();
        if (active) setIsLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [loadRemote, pullIfClean])
  );

  const rows = useMemo(() => {
    const byId = new Map<string, BookmarkRow>();

    remoteRows.forEach((row) => byId.set(row.id, row));

    ids.forEach((id) => {
      if (byId.has(id)) return;
      const snap = snapshots[id];
      if (!snap) return;
      byId.set(id, {
        ...snap,
        imageSource: snap.imageUrl ? { uri: snap.imageUrl } : FALLBACK_IMAGE,
      });
    });

    return ids
      .map((id) => byId.get(id))
      .filter((row): row is BookmarkRow => Boolean(row));
  }, [ids, remoteRows, snapshots]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await sync();
    await loadRemote();
    setIsRefreshing(false);
  };

  return (
    <TabsLayout tabName="Bookmarks">
      {isLoading && rows.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={themeColors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 112, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text className="mt-16 text-center text-sm text-[#666]">
              No bookmarks yet. Tap the bookmark icon on a home to save it.
            </Text>
          }
          renderItem={({ item }) => (
            <PropertyCard
              propertyName={item.propertyName}
              location={item.location}
              bedrooms={item.bedrooms}
              bathrooms={item.bathrooms}
              price={item.price}
              priceUnit={item.priceUnit}
              currency={item.currency}
              imageSource={item.imageSource}
              isBookmarked
              onBookmarkPress={() => toggleBookmark(toBookmarkSnapshot(item))}
              onCardPress={() => router.push(`/(user)/property/${item.id}`)}
              customStyles={{
                container: { marginVertical: 8 },
              }}
            />
          )}
        />
      )}
    </TabsLayout>
  );
};

export default UserBookmarkScreen;
