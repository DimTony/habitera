import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import {
  DEFAULT_FILTERS,
  formatPriceShort,
  type ListingCategory,
  type PropertyFilters,
  type PropertyTypeFilter,
  useFilterStore,
} from 'stores/useFilterStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const PROPERTY_TYPES: { type: PropertyTypeFilter; icon: IoniconName }[] = [
  { type: 'House', icon: 'home-outline' },
  { type: 'Apartment', icon: 'business-outline' },
  { type: 'Condo', icon: 'layers-outline' },
  { type: 'Townhouse', icon: 'trail-sign-outline' },
  { type: 'Land', icon: 'map-outline' },
  { type: 'Commercial', icon: 'storefront-outline' },
];

const LISTING_OPTIONS: { key: NonNullable<ListingCategory>; label: string; icon: IoniconName }[] =
  [
    { key: 'rent', label: 'For Rent', icon: 'key-outline' },
    { key: 'sale', label: 'For Sale', icon: 'pricetag-outline' },
  ];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6];
const BATHROOM_OPTIONS = [1, 2, 3, 4, 5, 6];

const PRICE_MIN = 250_000;
const PRICE_MAX = 20_000_000;
const PRICE_STEP = 250_000;

const CHART_BARS = [
  { height: 20 },
  { height: 35 },
  { height: 45 },
  { height: 60 },
  { height: 75 },
  { height: 85 },
  { height: 70 },
  { height: 55 },
  { height: 40 },
  { height: 65 },
  { height: 80 },
  { height: 45 },
  { height: 30 },
  { height: 25 },
  { height: 15 },
];

function clampPrice(value: number): number {
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, Math.round(value / PRICE_STEP) * PRICE_STEP));
}

const SectionTitle = ({
  icon,
  title,
  color,
}: {
  icon: IoniconName;
  title: string;
  color: string;
}) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionIconWrap, { backgroundColor: `${color}22` }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FilterScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeColors } = useAppStore();
  const stored = useFilterStore();

  const [draft, setDraft] = useState<PropertyFilters>({
    listingType: stored.listingType,
    propertyType: stored.propertyType,
    bedrooms: stored.bedrooms,
    bathrooms: stored.bathrooms,
    minPrice: stored.minPrice,
    maxPrice: stored.maxPrice,
  });

  const accent = themeColors?.primaryColor || '#6B9B76';
  const sliderMin = draft.minPrice ?? PRICE_MIN;
  const sliderMax = draft.maxPrice ?? PRICE_MAX;

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (draft.listingType === 'rent') parts.push('For rent');
    if (draft.listingType === 'sale') parts.push('For sale');
    if (draft.propertyType) parts.push(draft.propertyType);
    if (draft.bedrooms != null) parts.push(`${draft.bedrooms}+ beds`);
    if (draft.bathrooms != null) parts.push(`${draft.bathrooms}+ baths`);
    if (draft.minPrice != null || draft.maxPrice != null) {
      if (draft.minPrice != null && draft.maxPrice != null) {
        parts.push(`${formatPriceShort(draft.minPrice)} – ${formatPriceShort(draft.maxPrice)}`);
      } else if (draft.maxPrice != null) {
        parts.push(`Up to ${formatPriceShort(draft.maxPrice)}`);
      } else if (draft.minPrice != null) {
        parts.push(`From ${formatPriceShort(draft.minPrice)}`);
      }
    }
    return parts.length > 0 ? parts.join(' · ') : 'No filters applied';
  }, [draft]);

  const update = (patch: Partial<PropertyFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const setListingType = (value: ListingCategory) => {
    update({ listingType: draft.listingType === value ? null : value });
  };

  const handleApply = () => {
    stored.replaceFilters(draft);
    router.back();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_FILTERS });
  };

  const setMinPrice = (value: number) => {
    const nextMin = clampPrice(value);
    const nextMax = Math.max(nextMin + PRICE_STEP, sliderMax);
    update({
      minPrice: nextMin <= PRICE_MIN ? null : nextMin,
      maxPrice: nextMax >= PRICE_MAX ? null : nextMax,
    });
  };

  const setMaxPrice = (value: number) => {
    const nextMax = clampPrice(value);
    const nextMin = Math.min(nextMax - PRICE_STEP, sliderMin);
    update({
      minPrice: nextMin <= PRICE_MIN ? null : nextMin,
      maxPrice: nextMax >= PRICE_MAX ? null : nextMax,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Ionicons name="options-outline" size={18} color="#1F1F1F" />
          <Text style={styles.headerTitle}>Filters</Text>
        </View>
        <TouchableOpacity onPress={handleReset} hitSlop={12}>
          <Text style={[styles.resetText, { color: accent }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionTitle icon="home-outline" title="Listing" color={accent} />
          <View style={styles.categoryContainer}>
            {LISTING_OPTIONS.map((item) => {
              const active = draft.listingType === item.key;
              const color = active ? '#fff' : '#666';
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.categoryButton, active && { backgroundColor: accent }]}
                  onPress={() => setListingType(item.key)}>
                  <Ionicons name={item.icon} size={16} color={color} />
                  <Text style={[styles.categoryButtonText, active && styles.textActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle icon="cash-outline" title="Price range" color={accent} />

          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {CHART_BARS.map((bar, index) => {
                const barStart = PRICE_MIN + (index / CHART_BARS.length) * (PRICE_MAX - PRICE_MIN);
                const barEnd =
                  PRICE_MIN + ((index + 1) / CHART_BARS.length) * (PRICE_MAX - PRICE_MIN);
                const active = barEnd >= sliderMin && barStart <= sliderMax;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: bar.height,
                          backgroundColor: active ? accent : '#E0E0E0',
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.priceLabels}>
            <View style={styles.priceLabelRow}>
              <Ionicons name="arrow-down-circle-outline" size={14} color="#666" />
              <Text style={styles.priceLabel}>{formatPriceShort(sliderMin)}</Text>
            </View>
            <View style={styles.priceLabelRow}>
              <Ionicons name="arrow-up-circle-outline" size={14} color="#666" />
              <Text style={styles.priceLabel}>{formatPriceShort(sliderMax)}</Text>
            </View>
          </View>

          <View style={styles.sliderHintRow}>
            <Ionicons name="remove-circle-outline" size={14} color="#888" />
            <Text style={styles.sliderHint}>Min price</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={PRICE_MIN}
            maximumValue={PRICE_MAX - PRICE_STEP}
            step={PRICE_STEP}
            value={Math.min(sliderMin, sliderMax - PRICE_STEP)}
            onValueChange={setMinPrice}
            minimumTrackTintColor={accent}
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor={accent}
          />

          <View style={styles.sliderHintRow}>
            <Ionicons name="add-circle-outline" size={14} color="#888" />
            <Text style={styles.sliderHint}>Max price</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={PRICE_MIN + PRICE_STEP}
            maximumValue={PRICE_MAX}
            step={PRICE_STEP}
            value={Math.max(sliderMax, sliderMin + PRICE_STEP)}
            onValueChange={setMaxPrice}
            minimumTrackTintColor={accent}
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor={accent}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon="grid-outline" title="Property type" color={accent} />
          <View style={styles.chipWrap}>
            <TouchableOpacity
              style={[styles.chip, draft.propertyType == null && { backgroundColor: accent }]}
              onPress={() => update({ propertyType: null })}>
              <Ionicons
                name="apps-outline"
                size={14}
                color={draft.propertyType == null ? '#fff' : '#555'}
              />
              <Text style={[styles.chipText, draft.propertyType == null && styles.textActive]}>
                Any
              </Text>
            </TouchableOpacity>
            {PROPERTY_TYPES.map(({ type, icon }) => {
              const active = draft.propertyType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, active && { backgroundColor: accent }]}
                  onPress={() => update({ propertyType: active ? null : type })}>
                  <Ionicons name={icon} size={14} color={active ? '#fff' : '#555'} />
                  <Text style={[styles.chipText, active && styles.textActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle icon="bed-outline" title="Bedrooms" color={accent} />
          <View style={styles.numbersGrid}>
            <TouchableOpacity
              style={[styles.numberButton, draft.bedrooms == null && { backgroundColor: accent }]}
              onPress={() => update({ bedrooms: null })}>
              <Ionicons
                name="infinite-outline"
                size={14}
                color={draft.bedrooms == null ? '#fff' : '#666'}
              />
              <Text style={[styles.numberButtonText, draft.bedrooms == null && styles.textActive]}>
                Any
              </Text>
            </TouchableOpacity>
            {BEDROOM_OPTIONS.map((number) => {
              const active = draft.bedrooms === number;
              return (
                <TouchableOpacity
                  key={number}
                  style={[styles.numberButton, active && { backgroundColor: accent }]}
                  onPress={() => update({ bedrooms: active ? null : number })}>
                  <Ionicons name="bed-outline" size={14} color={active ? '#fff' : '#666'} />
                  <Text style={[styles.numberButtonText, active && styles.textActive]}>
                    {number}+
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle icon="water-outline" title="Bathrooms" color={accent} />
          <View style={styles.numbersGrid}>
            <TouchableOpacity
              style={[styles.numberButton, draft.bathrooms == null && { backgroundColor: accent }]}
              onPress={() => update({ bathrooms: null })}>
              <Ionicons
                name="infinite-outline"
                size={14}
                color={draft.bathrooms == null ? '#fff' : '#666'}
              />
              <Text style={[styles.numberButtonText, draft.bathrooms == null && styles.textActive]}>
                Any
              </Text>
            </TouchableOpacity>
            {BATHROOM_OPTIONS.map((number) => {
              const active = draft.bathrooms === number;
              return (
                <TouchableOpacity
                  key={number}
                  style={[styles.numberButton, active && { backgroundColor: accent }]}
                  onPress={() => update({ bathrooms: active ? null : number })}>
                  <Ionicons name="water-outline" size={14} color={active ? '#fff' : '#666'} />
                  <Text style={[styles.numberButtonText, active && styles.textActive]}>
                    {number}+
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: accent }]} onPress={handleApply}>
          <Ionicons name="search-outline" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>Show homes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 13,
    color: '#6B6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  textActive: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 1,
    width: '70%',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  sliderHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sliderHint: {
    fontSize: 12,
    color: '#888',
  },
  slider: {
    width: '100%',
    height: 36,
    marginBottom: 8,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  numberButton: {
    minWidth: (SCREEN_WIDTH - 80) / 4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 4,
  },
  numberButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  bottomSpacing: {
    height: 12,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});
