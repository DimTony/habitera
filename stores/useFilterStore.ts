import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ListingCategory = 'rent' | 'sale' | null;
export type PropertyTypeFilter =
  | 'House'
  | 'Apartment'
  | 'Condo'
  | 'Townhouse'
  | 'Land'
  | 'Commercial'
  | null;

export type PropertyFilters = {
  listingType: ListingCategory;
  propertyType: PropertyTypeFilter;
  bedrooms: number | null;
  bathrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
};

export const DEFAULT_FILTERS: PropertyFilters = {
  listingType: null,
  propertyType: null,
  bedrooms: null,
  bathrooms: null,
  minPrice: null,
  maxPrice: null,
};

type FilterState = PropertyFilters & {
  setFilters: (filters: Partial<PropertyFilters>) => void;
  replaceFilters: (filters: PropertyFilters) => void;
  resetFilters: () => void;
  activeCount: () => number;
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_FILTERS,

      setFilters: (filters) => set((state) => ({ ...state, ...filters })),
      replaceFilters: (filters) => set({ ...filters }),
      resetFilters: () => set({ ...DEFAULT_FILTERS }),
      activeCount: () => {
        const state = get();
        let count = 0;
        if (state.listingType) count += 1;
        if (state.propertyType) count += 1;
        if (state.bedrooms != null) count += 1;
        if (state.bathrooms != null) count += 1;
        if (state.minPrice != null || state.maxPrice != null) count += 1;
        return count;
      },
    }),
    {
      name: 'habitera.filters',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        listingType: state.listingType,
        propertyType: state.propertyType,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
      }),
    }
  )
);

export function matchesPropertyFilters<
  T extends {
    listingType?: string | null;
    propertyType?: string | null;
    bedrooms: number;
    bathrooms: number;
    price: number;
  },
>(property: T, filters: PropertyFilters): boolean {
  if (filters.listingType === 'rent' && property.listingType !== 'ForRent') {
    return false;
  }
  if (filters.listingType === 'sale' && property.listingType !== 'ForSale') {
    return false;
  }
  if (filters.propertyType && property.propertyType !== filters.propertyType) {
    return false;
  }
  if (filters.bedrooms != null && property.bedrooms < filters.bedrooms) {
    return false;
  }
  if (filters.bathrooms != null && property.bathrooms < filters.bathrooms) {
    return false;
  }
  if (filters.minPrice != null && property.price < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice != null && property.price > filters.maxPrice) {
    return false;
  }
  return true;
}

export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }
  return `₦${value}`;
}
