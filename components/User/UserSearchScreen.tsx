import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { suggestLocations } from 'lib/api/locations';
import { getPublishedProperties } from 'lib/api/properties';
import { mapPropertyDto } from 'lib/properties/mapProperty';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';

/** Matches floating tab bar: bottom 30 + height 60 + raised search button. */
const FLOATING_TAB_OFFSET = 128;

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Property {
  id: string;
  title: string;
  price: string;
  type: PropertyType;
  coordinate: Coordinate;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
}

type PropertyType = 'Self-Contain' | 'Mini-Flat' | '2-Bedroom' | '3-Bedroom' | '4-Bedroom' | 'House';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
}

function bedroomsToType(bedrooms: number): PropertyType {
  if (bedrooms <= 0) return 'Self-Contain';
  if (bedrooms === 1) return 'Mini-Flat';
  if (bedrooms === 2) return '2-Bedroom';
  if (bedrooms === 3) return '3-Bedroom';
  if (bedrooms === 4) return '4-Bedroom';
  return 'House';
}

function hasValidCoordinate(coordinate: Coordinate): boolean {
  return (
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude) &&
    !(coordinate.latitude === 0 && coordinate.longitude === 0) &&
    Math.abs(coordinate.latitude) <= 90 &&
    Math.abs(coordinate.longitude) <= 180
  );
}

const propertyTypes: (PropertyType | 'All')[] = [
  'All',
  'Self-Contain',
  'Mini-Flat',
  '2-Bedroom',
  '3-Bedroom',
  '4-Bedroom',
  'House',
];

const DEFAULT_REGION: Region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

const LOCATION_CACHE_DURATION = 5 * 60 * 1000;
const LOCATION_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Location timeout')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

const UserSearchScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeColors } = useAppStore();
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFittedRef = useRef(false);
  const userLocationRef = useRef<Coordinate | null>(null);
  const lastLocationUpdateRef = useRef(0);
  const getFastLocationRef = useRef<(useCache?: boolean) => Promise<Coordinate | null>>(
    async () => null
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isRecentering, setIsRecentering] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLayout, setMapLayout] = useState<{ width: number; height: number } | null>(null);

  const accent = themeColors?.primaryColor || '#6B9B76';
  const bottomChrome = FLOATING_TAB_OFFSET;

  const filteredProperties = useMemo(
    () =>
      properties.filter(
        (property) =>
          hasValidCoordinate(property.coordinate) &&
          (selectedType === 'All' || property.type === selectedType)
      ),
    [properties, selectedType]
  );

  const loadProperties = useCallback(async () => {
    try {
      setIsLoadingProperties(true);
      const result = await getPublishedProperties(1, 50);
      if (!result.success || !result.data) return;

      setProperties(
        result.data.map((dto) => {
          const mapped = mapPropertyDto(dto);
          return {
            id: mapped.id,
            title: mapped.propertyName,
            price: `${mapped.currency}${mapped.price.toLocaleString()}/${mapped.priceUnit}`,
            type: bedroomsToType(mapped.bedrooms),
            coordinate: mapped.coordinates,
            address: mapped.location,
            bedrooms: mapped.bedrooms,
            bathrooms: mapped.bathrooms,
          };
        })
      );
      hasFittedRef.current = false;
    } catch {
      // Keep map usable even if listing fetch fails.
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties])
  );

  const persistUserLocation = useCallback((coords: Coordinate) => {
    userLocationRef.current = coords;
    lastLocationUpdateRef.current = Date.now();
    setUserLocation(coords);
  }, []);

  const getFastLocation = useCallback(
    async (useCache = true): Promise<Coordinate | null> => {
      const now = Date.now();
      const cached = userLocationRef.current;

      if (
        useCache &&
        cached &&
        now - lastLocationUpdateRef.current < LOCATION_CACHE_DURATION
      ) {
        return cached;
      }

      try {
        const lastKnown = await withTimeout(
          Location.getLastKnownPositionAsync({
            maxAge: 300000,
            requiredAccuracy: 1000,
          }),
          2_000
        );

        if (lastKnown) {
          const coords = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
          persistUserLocation(coords);
          return coords;
        }
      } catch {
        // Fall through to a fresh read.
      }

      try {
        const location = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          LOCATION_TIMEOUT_MS
        );

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        persistUserLocation(coords);
        return coords;
      } catch {
        return userLocationRef.current;
      }
    },
    [persistUserLocation]
  );

  getFastLocationRef.current = getFastLocation;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;

        if (status !== 'granted') {
          setLocationPermission(false);
          return;
        }

        setLocationPermission(true);
        const coords = await getFastLocationRef.current(false);
        if (!active || !coords) return;

        mapRef.current?.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          },
          500
        );

        // Don't block the UI on reverse geocode.
        void Location.reverseGeocodeAsync(coords)
          .then((result) => {
            if (!active || result.length === 0) return;
            const address = result[0];
            setSearchQuery(
              `${address.city || address.subregion || address.region || 'Nearby'}, ${
                address.country || 'Nigeria'
              }`
            );
          })
          .catch(() => {
            if (active) setSearchQuery('Current location');
          });
      } catch {
        // Map still works with the Lagos default region.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const fitToListings = useCallback(
    (items: Property[]) => {
      if (!mapRef.current || items.length === 0) return;

      if (items.length === 1) {
        mapRef.current.animateToRegion(
          {
            latitude: items[0].coordinate.latitude,
            longitude: items[0].coordinate.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          600
        );
        return;
      }

      mapRef.current.fitToCoordinates(
        items.map((item) => item.coordinate),
        {
          edgePadding: {
            top: 160,
            right: 48,
            bottom: FLOATING_TAB_OFFSET + 48,
            left: 48,
          },
          animated: true,
        }
      );
    },
    []
  );

  useEffect(() => {
    if (!mapReady || hasFittedRef.current || filteredProperties.length === 0) return;
    hasFittedRef.current = true;
    const timer = setTimeout(() => fitToListings(filteredProperties), 250);
    return () => clearTimeout(timer);
  }, [filteredProperties, fitToListings, mapReady]);

  const centerOnUserLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Enable location permission to center the map on you.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRecentering(true);
    try {
      const coords = await getFastLocation(true);
      if (coords && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          700
        );
      } else {
        Alert.alert('Error', 'Unable to get your current location.');
      }
    } catch {
      Alert.alert('Error', 'Unable to get your current location.');
    } finally {
      setIsRecentering(false);
    }
  };

  const handleMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setMapLayout((prev) => {
      if (prev && prev.width === width && prev.height === height) return prev;
      return { width, height };
    });
  };

  const getLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query.trim() || query.length < 2) return [];

    try {
      const result = await suggestLocations(query.trim(), 6);
      if (result.success && result.data && result.data.length > 0) {
        return result.data.map((item) => ({
          id: item.id,
          name: item.label,
          address: [item.city, item.state, item.country].filter(Boolean).join(', ') || item.label,
          coordinate: {
            latitude: item.latitude,
            longitude: item.longitude,
          },
        }));
      }
    } catch {
      // Fall through to device geocoding.
    }

    try {
      const results = await Location.geocodeAsync(`${query}, Nigeria`);
      return results.slice(0, 5).map((result, index) => ({
        id: `${result.latitude}-${result.longitude}-${index}`,
        name: query,
        address: `${query}, Nigeria`,
        coordinate: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      }));
    } catch {
      return [];
    }
  };

  const debouncedSearch = (query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      const suggestions = await getLocationSuggestions(query);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 350);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setSearchSuggestions([]);

    mapRef.current?.animateToRegion(
      {
        latitude: suggestion.coordinate.latitude,
        longitude: suggestion.coordinate.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800
    );
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const suggestions = await getLocationSuggestions(searchQuery);
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0]);
      } else {
        Alert.alert(
          'Location not found',
          'Could not find that place. Try a city or neighborhood name.'
        );
      }
    } catch {
      Alert.alert('Search error', 'Unable to search right now. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  };

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
    mapRef.current?.animateToRegion(
      {
        latitude: property.coordinate.latitude,
        longitude: property.coordinate.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      500
    );
  };

  const getMarkerColor = (type: PropertyType): string => {
    switch (type) {
      case 'Self-Contain':
        return '#FF6B6B';
      case 'Mini-Flat':
        return '#4ECDC4';
      case '2-Bedroom':
        return '#45B7D1';
      case '3-Bedroom':
        return '#96CEB4';
      case '4-Bedroom':
        return '#F4A261';
      default:
        return accent;
    }
  };

  const recenterMap = () => {
    if (userLocation) {
      void centerOnUserLocation();
      return;
    }
    if (filteredProperties.length > 0) {
      fitToListings(filteredProperties);
      return;
    }
    mapRef.current?.animateToRegion(DEFAULT_REGION, 700);
  };

  return (
    <View style={styles.container} onLayout={handleMapLayout}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {mapLayout ? (
        <MapView
          ref={mapRef}
          style={{ width: mapLayout.width, height: mapLayout.height }}
          // Default provider: Apple Maps on iOS. Do not force Google without an API key.
          initialRegion={
            userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }
              : DEFAULT_REGION
          }
          onMapReady={() => setMapReady(true)}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          mapType="standard">
          {filteredProperties.map((property) => (
            <Marker
              key={property.id}
              coordinate={property.coordinate}
              pinColor={getMarkerColor(property.type)}
              title={property.title}
              description={property.price}
              onPress={() => handleMarkerPress(property)}
              tracksViewChanges={false}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator color={accent} />
        </View>
      )}

      {isLoadingProperties && filteredProperties.length === 0 ? (
        <View style={styles.loadingBanner} pointerEvents="none">
          <ActivityIndicator size="small" color={accent} />
          <Text style={styles.loadingBannerText}>Loading homes on the map…</Text>
        </View>
      ) : null}

      <View style={[styles.floatingHeader, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location…"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholderTextColor="#999"
              returnKeyType="search"
            />
            {(searchQuery.length > 0 || isSearching) && (
              <TouchableOpacity onPress={handleClearSearch} hitSlop={8}>
                <Ionicons name={isSearching ? 'refresh' : 'close'} size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: accent }]}
            onPress={() => setShowFilters((prev) => !prev)}>
            <Ionicons name={showFilters ? 'close' : 'options'} size={20} color="white" />
          </TouchableOpacity>
        </View>

        {showSuggestions && searchSuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {searchSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionSelect(suggestion)}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#666"
                    style={styles.suggestionIcon}
                  />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {suggestion.name}
                    </Text>
                    <Text style={styles.suggestionAddress} numberOfLines={1}>
                      {suggestion.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {showFilters ? (
          <View style={styles.filtersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}>
              {propertyTypes.map((type) => {
                const active = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, active && { backgroundColor: accent }]}
                    onPress={() => setSelectedType(type)}>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {selectedProperty ? (
        <View style={[styles.propertyCard, { bottom: bottomChrome + 56 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedProperty(null)}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {selectedProperty.title}
            </Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.propertyAddress} numberOfLines={1}>
                {selectedProperty.address}
              </Text>
            </View>

            {(selectedProperty.bedrooms || selectedProperty.bathrooms) && (
              <View style={styles.propertyFeatures}>
                {selectedProperty.bedrooms ? (
                  <View style={styles.feature}>
                    <Ionicons name="bed-outline" size={16} color="#666" />
                    <Text style={styles.featureText}>{selectedProperty.bedrooms} bed</Text>
                  </View>
                ) : null}
                {selectedProperty.bathrooms ? (
                  <View style={styles.feature}>
                    <Ionicons name="water-outline" size={16} color="#666" />
                    <Text style={styles.featureText}>{selectedProperty.bathrooms} bath</Text>
                  </View>
                ) : null}
              </View>
            )}

            <Text style={[styles.propertyPrice, { color: accent }]}>{selectedProperty.price}</Text>
          </View>

          <TouchableOpacity
            style={[styles.viewButton, { backgroundColor: accent }]}
            onPress={() => router.push(`/(user)/property/${selectedProperty.id}`)}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.resultsCounter, { bottom: bottomChrome }]}>
        <Text style={styles.resultsText}>
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      <View style={[styles.mapControls, { bottom: bottomChrome }]}>
        {filteredProperties.length > 0 ? (
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => fitToListings(filteredProperties)}>
            <Ionicons name="expand-outline" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.mapControlButton, isRecentering && styles.mapControlButtonActive]}
          onPress={recenterMap}
          disabled={isRecentering}>
          <Ionicons
            name={isRecentering ? 'refresh' : userLocation ? 'locate' : 'compass'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EEF2',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCE3E8',
  },
  loadingBanner: {
    position: 'absolute',
    top: '48%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 5,
  },
  loadingBannerText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  suggestionAddress: {
    marginTop: 2,
    fontSize: 12,
    color: '#888',
  },
  filtersSection: {
    marginTop: 12,
  },
  filtersContent: {
    paddingRight: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  propertyCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 900,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  propertyInfo: {
    paddingRight: 28,
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  propertyAddress: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  propertyFeatures: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsCounter: {
    position: 'absolute',
    left: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 800,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    gap: 10,
    zIndex: 800,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlButtonActive: {
    opacity: 0.7,
  },
});
