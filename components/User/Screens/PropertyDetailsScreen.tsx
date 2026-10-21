import { Ionicons } from '@expo/vector-icons';
import BedIcon from 'components/Icons/BedIcon';
import LocationIcon from 'components/Icons/LocationIcon';
import ToiletIcon from 'components/Icons/ToiletIcon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getErrorMessage } from 'lib/api/errors';
import { getPropertyById } from 'lib/api/properties';
import { mapPropertyDto, type AppProperty } from 'lib/properties/mapProperty';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PropertyDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [property, setProperty] = useState<AppProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [mapSize, setMapSize] = useState<{ width: number; height: number } | null>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getPropertyById(id);
        if (!active) return;

        if (!result.success || !result.data) {
          showToast({
            type: 'error',
            message: result.message || 'Unable to load property.',
          });
          setProperty(null);
          return;
        }

        setProperty(mapPropertyDto(result.data));
      } catch (error) {
        if (!active) return;
        showToast({
          type: 'error',
          message: getErrorMessage(error, 'Unable to load property.'),
        });
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, showToast]);

  const formatPrice = (price: number, currency: string, unit: string): string => {
    return `${currency}${price.toLocaleString()}/${unit}`;
  };

  const handleContactAgent = (): void => {};

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== currentImageIndex) {
      setCurrentImageIndex(slide);
    }
  };

  const onFullscreenScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== fullscreenIndex) {
      setFullscreenIndex(slide);
      setCurrentImageIndex(slide);
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
    requestAnimationFrame(() => {
      fullscreenScrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
    });
  };

  const closeFullscreen = () => {
    setFullscreenVisible(false);
  };

  const hasValidCoordinates = useMemo(() => {
    if (!property) return false;
    const { latitude, longitude } = property.coordinates;
    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      !(latitude === 0 && longitude === 0)
    );
  }, [property]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={themeColors.primaryColor} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Property not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: themeColors.primaryColor, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    propertyName,
    location,
    bedrooms,
    bathrooms,
    price,
    currency,
    priceUnit,
    images,
    description,
    coordinates,
  } = property;

  const gallery = images?.length ? images : [property.imageSource];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.imageCarousel}>
            {gallery.map((image, index) => (
              <TouchableOpacity
                key={`hero-${index}`}
                activeOpacity={0.95}
                onPress={() => openFullscreen(index)}>
                <Image
                  source={
                    typeof image === 'object' && image && 'uri' in image
                      ? image
                      : (image as ImageSourcePropType)
                  }
                  style={styles.carouselImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            className="bg-white/50"
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => openFullscreen(currentImageIndex)}
            accessibilityLabel="View images full screen">
            <Ionicons name="expand-outline" size={18} color="#333" />
          </TouchableOpacity>

          <View style={styles.indicatorContainer}>
            {gallery.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.indicator,
                  index === currentImageIndex ? styles.activeIndicator : styles.inactiveIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.contentSection} className="rounded-t-lg pt-20">
          <Text style={styles.propertyTitle}>{propertyName}</Text>

          <View style={styles.locationRow}>
            <LocationIcon color={themeColors.primaryColor} />
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <BedIcon color={themeColors.primaryColor} />
              <Text style={styles.detailText}>{bedrooms} Bedrooms</Text>
            </View>

            <View style={styles.detail}>
              <ToiletIcon color={themeColors.primaryColor} />
              <Text style={styles.detailText}>{bathrooms} Bathrooms</Text>
            </View>
          </View>

          <View style={styles.descSection} className="bg-[#678B830D]">
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {description || 'No description available for this property.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View
              style={styles.mapContainer}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                if (width > 0 && height > 0) {
                  setMapSize({ width, height });
                }
              }}>
              {hasValidCoordinates && mapSize ? (
                <MapView
                  style={{ width: mapSize.width, height: mapSize.height }}
                  // Default provider: Apple Maps on iOS. Do not force Google without an API key.
                  initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                  mapType="standard">
                  <Marker
                    coordinate={{
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                    }}
                    title={propertyName}
                    description={location}
                    tracksViewChanges={false}
                  />
                </MapView>
              ) : (
                <View style={styles.mapFallback}>
                  <Ionicons name="map-outline" size={22} color="#888" />
                  <Text style={styles.mapFallbackText}>
                    {hasValidCoordinates ? 'Loading map…' : 'Map location unavailable'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{formatPrice(price, currency, priceUnit)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: themeColors.primaryColor }]}
          onPress={handleContactAgent}>
          <Text style={styles.contactButtonText}>Contact Agent</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={fullscreenVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={closeFullscreen}
        statusBarTranslucent>
        <View style={[styles.fullscreenContainer, { paddingTop: insets.top }]}>
          <StatusBar barStyle="light-content" />
          <View style={styles.fullscreenHeader}>
            <Text style={styles.fullscreenCounter}>
              {fullscreenIndex + 1} / {gallery.length}
            </Text>
            <TouchableOpacity
              onPress={closeFullscreen}
              style={styles.fullscreenClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={fullscreenScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onFullscreenScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: fullscreenIndex * SCREEN_WIDTH, y: 0 }}>
            {gallery.map((image, index) => (
              <Pressable
                key={`fs-${index}`}
                style={styles.fullscreenPage}
                onPress={closeFullscreen}>
                <Image
                  source={
                    typeof image === 'object' && image && 'uri' in image
                      ? image
                      : (image as ImageSourcePropType)
                  }
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  imageCarousel: {
    height: 500,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 300,
    resizeMode: 'cover',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#6B9B76',
  },
  inactiveIndicator: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentSection: {
    flex: 1,
    paddingTop: 20,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
    paddingHorizontal: 20,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 24,
    paddingHorizontal: 20,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  descSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  mapFallbackText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    gap: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 2,
  },
  fullscreenCounter: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  fullscreenClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fullscreenPage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});

export default PropertyDetailsScreen;
