import { Ionicons } from '@expo/vector-icons';
import BedIcon from 'components/Icons/BedIcon';
import LocationIcon from 'components/Icons/LocationIcon';
import ToiletIcon from 'components/Icons/ToiletIcon';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getErrorMessage } from 'lib/api/errors';
import { deactivateProperty, getPropertyById } from 'lib/api/properties';
import type { PropertyDto } from 'lib/api/types';
import { mapPropertyDto, type AppProperty } from 'lib/properties/mapProperty';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AgentPropertyView = AppProperty & {
  status?: string | null;
  isPublished?: boolean;
  reviewSubmittedAt?: string | null;
  rejectionReason?: string | null;
  favoriteCount: number;
  contactCount: number;
};

function statusLabel(property: AgentPropertyView) {
  const status = String(property.status ?? '').toLowerCase();
  if (status === 'inactive') return 'Inactive';
  if (status === 'pending') {
    return property.reviewSubmittedAt ? 'Under review' : 'Draft';
  }
  if (property.isPublished && status === 'active') return 'Active';
  return property.status || 'Unknown';
}

const ViewProperty: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();

  const [property, setProperty] = useState<AgentPropertyView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadProperty = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      setProperty(null);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getPropertyById(id);
      if (!result.success || !result.data) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to load listing.',
        });
        setProperty(null);
        return;
      }

      const dto: PropertyDto = result.data;
      setProperty({
        ...mapPropertyDto(dto),
        status: dto.status,
        isPublished: dto.isPublished,
        reviewSubmittedAt: dto.reviewSubmittedAt,
        rejectionReason: dto.rejectionReason,
        favoriteCount: dto.favoriteCount ?? 0,
        contactCount: dto.contactCount ?? 0,
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load listing.'),
      });
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useFocusEffect(
    useCallback(() => {
      void loadProperty();
    }, [loadProperty])
  );

  const formatPrice = (item: AgentPropertyView): string => {
    return `${item.currency}${item.price.toLocaleString()}/${item.priceUnit}`;
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== currentImageIndex) {
      setCurrentImageIndex(slide);
    }
  };

  const handleEdit = () => {
    if (!id) return;
    router.push(`/(agent)/edit-property?id=${id}`);
  };

  const handleMakeInactive = () => {
    if (!id || !property) return;

    const status = String(property.status ?? '').toLowerCase();
    if (status === 'inactive') {
      showToast({ type: 'info', message: 'This listing is already inactive.' });
      return;
    }

    Alert.alert(
      'Make inactive',
      'This listing will be removed from the live feed. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make inactive',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeactivating(true);
              const result = await deactivateProperty(id);
              if (!result.success) {
                showToast({
                  type: 'error',
                  message: result.message || 'Unable to deactivate listing.',
                });
                return;
              }
              showToast({ type: 'success', message: 'Listing marked inactive.' });
              await loadProperty();
            } catch (error) {
              showToast({
                type: 'error',
                message: getErrorMessage(error, 'Unable to deactivate listing.'),
              });
            } finally {
              setIsDeactivating(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={themeColors.primaryColor || '#000'} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centered, { paddingHorizontal: 24 }]}>
        <Text style={styles.emptyTitle}>Listing unavailable</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = property.images?.length ? property.images : [property.imageSource];
  const isInactive = String(property.status ?? '').toLowerCase() === 'inactive';

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
            {images.map((image, index) => (
              <Image
                key={`${property.id}-${index}`}
                source={
                  typeof image === 'object' && image && 'uri' in image
                    ? image
                    : (image as ImageSourcePropType)
                }
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            className="bg-white/50"
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>

          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>{statusLabel(property)}</Text>
          </View>

          <View style={styles.indicatorContainer}>
            {images.map((_, index) => (
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
          <Text style={styles.propertyTitle}>{property.propertyName}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.favoriteCount}</Text>
              <Text style={styles.statLabel}>
                {property.favoriteCount === 1 ? 'Bookmark' : 'Bookmarks'}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.contactCount}</Text>
              <Text style={styles.statLabel}>
                {property.contactCount === 1 ? 'Contact' : 'Contacts'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <LocationIcon color="#678b83" />
            <Text style={styles.locationText}>{property.location}</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <BedIcon color="#678b83" />
              <Text style={styles.detailText}>{property.bedrooms} Bedrooms</Text>
            </View>

            <View style={styles.detail}>
              <ToiletIcon color="#678b83" />
              <Text style={styles.detailText}>{property.bathrooms} Bathrooms</Text>
            </View>
          </View>

          {property.rejectionReason ? (
            <View style={[styles.descSection, { backgroundColor: '#FFF4F4' }]}>
              <Text style={styles.sectionTitle}>Rejection reason</Text>
              <Text style={styles.descriptionText}>{property.rejectionReason}</Text>
            </View>
          ) : null}

          <View style={styles.descSection} className="bg-[#678B830D]">
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {property.description?.trim() || 'No description provided.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle} className="py-5">
              Location
            </Text>
            <View style={styles.mapContainer}>
              <Text style={styles.coordsText}>
                {property.coordinates.latitude.toFixed(5)},{' '}
                {property.coordinates.longitude.toFixed(5)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, isInactive && styles.disabledButton]}
              onPress={handleMakeInactive}
              disabled={isDeactivating || isInactive}>
              {isDeactivating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  {isInactive ? 'Already inactive' : 'Make inactive'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{formatPrice(property)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: themeColors.primaryColor || '#000' }]}
          onPress={handleEdit}>
          <Text style={styles.contactButtonText}>Edit Listing</Text>
        </TouchableOpacity>
      </View>
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
  emptyTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 400,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageCarousel: {
    height: 500,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 400,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusChip: {
    position: 'absolute',
    top: 54,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Bahnschrift',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
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
    width: 40,
    backgroundColor: '#000000',
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
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: 'Bahnschrift',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: '#678B830D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statValue: {
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statLabel: {
    marginTop: 2,
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#678B83',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 20,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontFamily: 'Bahnschrift',
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
    fontFamily: 'Bahnschrift',
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
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Bahnschrift',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  coordsText: {
    fontFamily: 'Bahnschrift',
    color: '#666',
    fontSize: 13,
  },
  actionsRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  bottomSpacing: {
    height: 120,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    gap: 16,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Bahnschrift',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Bahnschrift',
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Bahnschrift',
  },
});

export default ViewProperty;
