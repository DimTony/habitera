import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavoriteIds, syncFavoriteIds } from 'lib/api/favorites';
import type { BookmarkSnapshot } from 'lib/bookmarks/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type BookmarkState = {
  /** Lightweight bookmarked property IDs (source of truth offline). */
  ids: string[];
  /** Tiny display cache for the Bookmarks tab when offline. */
  snapshots: Record<string, BookmarkSnapshot>;
  dirty: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;

  isBookmarked: (propertyId: string) => boolean;
  toggle: (snapshot: BookmarkSnapshot) => void;
  remove: (propertyId: string) => void;
  sync: () => Promise<void>;
  pullIfClean: () => Promise<void>;
};

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ids: [],
      snapshots: {},
      dirty: false,
      isSyncing: false,
      lastSyncedAt: null,

      isBookmarked: (propertyId) => get().ids.includes(propertyId),

      toggle: (snapshot) => {
        const id = snapshot.id;
        if (!id) return;

        const { ids, snapshots } = get();
        const exists = ids.includes(id);

        if (exists) {
          const nextSnapshots = { ...snapshots };
          delete nextSnapshots[id];
          set({
            ids: ids.filter((item) => item !== id),
            snapshots: nextSnapshots,
            dirty: true,
          });
        } else {
          set({
            ids: [id, ...ids.filter((item) => item !== id)],
            snapshots: { ...snapshots, [id]: snapshot },
            dirty: true,
          });
        }

        void get().sync();
      },

      remove: (propertyId) => {
        const { ids, snapshots } = get();
        if (!ids.includes(propertyId)) return;
        const nextSnapshots = { ...snapshots };
        delete nextSnapshots[propertyId];
        set({
          ids: ids.filter((item) => item !== propertyId),
          snapshots: nextSnapshots,
          dirty: true,
        });
        void get().sync();
      },

      sync: async () => {
        if (get().isSyncing) return;
        set({ isSyncing: true });
        try {
          const localIds = uniqueIds(get().ids);
          const result = await syncFavoriteIds(localIds);
          if (!result.success || !result.data) return;

          const serverIds = uniqueIds(result.data.propertyIds ?? []);
          const snapshots = { ...get().snapshots };
          Object.keys(snapshots).forEach((id) => {
            if (!serverIds.includes(id)) delete snapshots[id];
          });

          set({
            ids: serverIds,
            snapshots,
            dirty: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch {
          // Stay offline with local IDs; retry later.
        } finally {
          set({ isSyncing: false });
        }
      },

      pullIfClean: async () => {
        if (get().dirty || get().isSyncing) {
          await get().sync();
          return;
        }

        set({ isSyncing: true });
        try {
          const result = await getFavoriteIds();
          if (!result.success || !result.data) return;

          const serverIds = uniqueIds(result.data.propertyIds ?? []);
          const snapshots = { ...get().snapshots };
          Object.keys(snapshots).forEach((id) => {
            if (!serverIds.includes(id)) delete snapshots[id];
          });

          set({
            ids: serverIds,
            snapshots,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch {
          // Keep local cache.
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'habitera.bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ids: state.ids,
        snapshots: state.snapshots,
        dirty: state.dirty,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

export function toBookmarkSnapshot(property: {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  imageSource?: { uri?: string } | number;
}): BookmarkSnapshot {
  const imageUrl =
    property.imageSource &&
    typeof property.imageSource === 'object' &&
    'uri' in property.imageSource
      ? property.imageSource.uri ?? null
      : null;

  return {
    id: property.id,
    propertyName: property.propertyName,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    price: property.price,
    currency: property.currency,
    priceUnit: property.priceUnit,
    imageUrl,
  };
}
