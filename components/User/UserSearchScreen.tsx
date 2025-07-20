import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppStore } from 'stores/useAppStore';

const { width, height } = Dimensions.get('window');

// Type definitions
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Property {
  id: number;
  title: string;
  price: string;
  type: PropertyType;
  coordinate: Coordinate;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
}

type PropertyType = 'Self-Contain' | 'Mini-Flat' | '2-Bedroom' | '3-Bedroom';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
}

interface CustomMarkerProps {
  property: Property;
}

// Mock property data with Lagos coordinates
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Modern 2-Bedroom Apartment',
    price: '₦2,000,000/Yr',
    type: '2-Bedroom',
    coordinate: { latitude: 6.4281, longitude: 3.4219 },
    address: 'Victoria Island, Lagos',
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 2,
    title: 'Luxury 3-Bedroom House',
    price: '₦4,500,000/Yr',
    type: '3-Bedroom',
    coordinate: { latitude: 6.4474, longitude: 3.3903 },
    address: 'Ikoyi, Lagos',
    bedrooms: 3,
    bathrooms: 3,
  },
  {
    id: 3,
    title: 'Cozy Self-Contain',
    price: '₦850,000/Yr',
    type: 'Self-Contain',
    coordinate: { latitude: 6.5964, longitude: 3.3425 },
    address: 'Ikeja, Lagos',
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 4,
    title: 'Mini-Flat Apartment',
    price: '₦1,500,000/Yr',
    type: 'Mini-Flat',
    coordinate: { latitude: 6.4585, longitude: 3.5273 },
    address: 'Ajah, Lagos',
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 5,
    title: 'Executive 3-Bedroom',
    price: '₦3,200,000/Yr',
    type: '3-Bedroom',
    coordinate: { latitude: 6.6018, longitude: 3.3515 },
    address: 'Surulere, Lagos',
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 6,
    title: 'Lekki Luxury Apartment',
    price: '₦5,500,000/Yr',
    type: '3-Bedroom',
    coordinate: { latitude: 6.4698, longitude: 3.5852 },
    address: 'Lekki Phase 1, Lagos',
    bedrooms: 3,
    bathrooms: 3,
  },
];

const propertyTypes: (PropertyType | 'All')[] = ['All', 'Self-Contain', 'Mini-Flat', '2-Bedroom', '3-Bedroom'];

const UserSearchScreen: React.FC = () => {
  const { themeColors } = useAppStore();
  const mapRef = useRef<MapView>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>('All');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [properties] = useState<Property[]>(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);
  const [isRecentering, setIsRecentering] = useState<boolean>(false);
  const [searchSuggestions, setSearchSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Cache duration: 5 minutes
  const LOCATION_CACHE_DURATION = 5 * 60 * 1000;

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default Lagos center coordinates (fallback)
  const defaultRegion: Region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  // Fast center on user location with visual feedback
  const centerOnUserLocation = async (): void => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permission to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRecentering(true);

    try {
      const coords = await getFastLocation(true);
      
      if (coords && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.02, // Closer zoom level
          longitudeDelta: 0.02,
        }, 800); // Faster animation
      } else {
        Alert.alert('Error', 'Unable to get your current location.');
      }
    } catch (error) {
      console.error('Error recentering:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    } finally {
      setIsRecentering(false);
    }
  };

  // Dynamic initial region based on user location or default
  const initialRegion: Region = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : defaultRegion;

  // Request location permission and get user's current location
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        setIsLoadingLocation(true);
        
        // Request foreground permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocationPermission(false);
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show properties near you. You can still browse all properties.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }

        setLocationPermission(true);

        // Get initial location using fast method
        const coords = await getFastLocation(false);
        
        if (coords) {
          // Update search query with reverse geocoding (async, non-blocking)
          Location.reverseGeocodeAsync(coords)
            .then((result) => {
              if (result.length > 0) {
                const address = result[0];
                const locationString = `${address.city || address.subregion || address.region}, ${address.country}`;
                setSearchQuery(locationString);
              }
            })
            .catch(() => {
              setSearchQuery('Current Location');
            });
        }

      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Showing default area.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getLocationPermission();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get location suggestions using Expo Location
  const getLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query.trim() || query.length < 3) return [];

    try {
      // Use forward geocoding to get suggestions
      const results = await Location.geocodeAsync(query + ', Lagos, Nigeria');
      
      return results.slice(0, 5).map((result, index) => ({
        id: `${result.latitude}-${result.longitude}-${index}`,
        name: query,
        address: `${query}, Lagos, Nigeria`,
        coordinate: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  };

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length >= 3) {
        setIsSearching(true);
        const suggestions = await getLocationSuggestions(query);
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
        setIsSearching(false);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // 500ms delay
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.address);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    
    // Animate to selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: suggestion.coordinate.latitude,
        longitude: suggestion.coordinate.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  // Handle search submission (Enter key)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const results = await Location.geocodeAsync(searchQuery + ', Lagos, Nigeria');
      
      if (results.length > 0) {
        const location = results[0];
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      } else {
        Alert.alert('Location Not Found', 'Could not find the specified location. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to search for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and hide suggestions
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Hide suggestions when touching outside
  const hideSuggestions = () => {
    setShowSuggestions(false);
  };
  const getFastLocation = async (useCache: boolean = true): Promise<Coordinate | null> => {
    const now = Date.now();
    
    // Use cached location if available and not expired
    if (useCache && userLocation && lastLocationUpdate && (now - lastLocationUpdate) < LOCATION_CACHE_DURATION) {
      console.log('Using cached location');
      return userLocation;
    }

    try {
      // Try last known position first (fastest)
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 300000, // 5 minutes
        requiredAccuracy: 1000, // 1km accuracy is fine for recentering
      });

      if (lastKnown) {
        const coords: Coordinate = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        setUserLocation(coords);
        setLastLocationUpdate(now);
        console.log('Using last known location');
        return coords;
      }

      // Fallback to current position with balanced accuracy
      console.log('Getting fresh location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster than High
      });

      const coords: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      setLastLocationUpdate(now);
      return coords;

    } catch (error) {
      console.error('Error getting location:', error);
      return userLocation; // Return cached location if available
    }
  };

  const filteredProperties: Property[] = properties.filter(property => 
    selectedType === 'All' || property.type === selectedType
  );

  const handleSearch = (): void => {
    handleSearchSubmit();
  };

  const handleMarkerPress = (property: Property): void => {
    setSelectedProperty(property);
    // Center map on selected property
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: property.coordinate.latitude,
        longitude: property.coordinate.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
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
      default:
        return themeColors?.primaryColor || '#6B9B76';
    }
  };

  const CustomMarker: React.FC<CustomMarkerProps> = ({ property }) => (
    <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(property.type) }]}>
      <Ionicons name="home" size={16} color="white" />
      <Text style={styles.markerPrice}>
        {property.price.replace('₦', '₦').split('/')[0]}
      </Text>
    </View>
  );

  const handleFilterSelect = (type: PropertyType | 'All'): void => {
    setSelectedType(type);
  };

  const handleClosePropertyCard = (): void => {
    setSelectedProperty(null);
  };

  const recenterMap = (): void => {
    if (userLocation) {
      // If we have user location, center on that
      centerOnUserLocation();
    } else {
      // Otherwise, center on default region
      if (mapRef.current) {
        mapRef.current.animateToRegion(defaultRegion, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        followsUserLocation={false}
        loadingEnabled={isLoadingLocation}
      >
        {filteredProperties.map((property) => (
          <Marker
            key={property.id}
            coordinate={property.coordinate}
            onPress={() => handleMarkerPress(property)}
          >
            <CustomMarker property={property} />
          </Marker>
        ))}
      </MapView>

      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={isLoadingLocation ? "Getting your location..." : "Search location..."}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
              placeholderTextColor="#999"
              editable={!isLoadingLocation}
              returnKeyType="search"
            />
            {(searchQuery.length > 0 || isSearching) && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons 
                  name={isSearching ? "refresh" : "close"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: themeColors?.primaryColor || '#6B9B76' }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name={showFilters ? "close" : "options"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView 
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {searchSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionSelect(suggestion)}
                >
                  <Ionicons name="location-outline" size={16} color="#666" style={styles.suggestionIcon} />
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
        )}

        {/* Property Type Filters */}
        {showFilters && (
          <View style={styles.filtersSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && { 
                      backgroundColor: themeColors?.primaryColor || '#6B9B76' 
                    }
                  ]}
                  onPress={() => handleFilterSelect(type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedType === type && styles.filterChipTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Property Details Card */}
      {selectedProperty && (
        <View style={styles.propertyCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePropertyCard}
          >
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
                {selectedProperty.bedrooms && (
                  <View style={styles.feature}>
                    <Ionicons name="bed-outline" size={16} color="#666" />
                    <Text style={styles.featureText}>{selectedProperty.bedrooms} bed</Text>
                  </View>
                )}
                {selectedProperty.bathrooms && (
                  <View style={styles.feature}>
                    <Ionicons name="water-outline" size={16} color="#666" />
                    <Text style={styles.featureText}>{selectedProperty.bathrooms} bath</Text>
                  </View>
                )}
              </View>
            )}
            
            <Text style={[styles.propertyPrice, { color: themeColors?.primaryColor || '#6B9B76' }]}>
              {selectedProperty.price}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.viewButton, { backgroundColor: themeColors?.primaryColor || '#6B9B76' }]}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Results Counter */}
      <View style={styles.resultsCounter}>
        <Text style={styles.resultsText}>
          {filteredProperties.length} properties
        </Text>
      </View>

      {/* Floating Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={[
            styles.mapControlButton,
            isRecentering && styles.mapControlButtonActive
          ]}
          onPress={recenterMap}
          disabled={isRecentering}
        >
          {isRecentering ? (
            <Ionicons name="refresh" size={20} color="#666" />
          ) : (
            <Ionicons 
              name={userLocation ? "locate" : "compass"} 
              size={20} 
              color="#666" 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filtersSection: {
    marginTop: 12,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 90,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerPrice: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  propertyCard: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
  },
  propertyInfo: {
    marginBottom: 16,
    paddingRight: 40,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  propertyFeatures: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCounter: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 140,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultsText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    bottom: 140,
    right: 16,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mapControlButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
    color: '#666',
  },
});

export default UserSearchScreen;