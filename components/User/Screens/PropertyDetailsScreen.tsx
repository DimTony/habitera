import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BedIcon from 'components/Icons/BedIcon';
import LocationIcon from 'components/Icons/LocationIcon';
import ToiletIcon from 'components/Icons/ToiletIcon';
import React, { useState } from 'react';
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
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';

import { RootStackParamList } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PropertyDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PropertyDetails'
>;
type PropertyDetailsRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

interface PropertyDetailsScreenProps {
  navigation: PropertyDetailsNavigationProp;
  route: PropertyDetailsRouteProp;
}

const PropertyDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PropertyDetailsNavigationProp>();
  const route = useRoute<PropertyDetailsRouteProp>();
  const { propertyId, propertyName, location, bedrooms, bathrooms, price, imageSource, images } =
    route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const { themeColors } = useAppStore();

  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}/Year`;
  };

  const handleContactAgent = (): void => {
    navigation.navigate('ContactOwner', { propertyId, propertyName });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== currentImageIndex) {
      setCurrentImageIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Image Carousel */}
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
                key={index}
                source={
                  typeof image === 'object' && 'uri' in image
                    ? image
                    : (image as ImageSourcePropType)
                }
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>

          {/* Back Button */}
          <TouchableOpacity
            className="bg-white/50"
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>

          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex ? styles.activeIndicator : styles.inactiveIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection} className="rounded-t-lg pt-20">
          {/* Property Title */}
          <Text style={styles.propertyTitle}>{propertyName}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <LocationIcon color={themeColors.primaryColor} />
            <Text style={styles.locationText}>{location}</Text>
          </View>

          {/* Property Details */}
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

          {/* Description Section */}
          <View style={styles.descSection} className="bg-[#678B830D]">
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              This beautifully finished 2-bedroom, 2.5-bathroom apartment offers the perfect blend
              of comfort, style, and convenience. Step into a spacious open-plan living and dining
              area flooded with natural light, complete with sleek tiled flooring and contemporary
              lighting. The fully fitted kitchen boasts granite countertops, high-end appliances,
              and ample storage to realize your culinary needs.
            </Text>
          </View>

          {/* Google Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} className="py-5">
              Google Location
            </Text>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/350x150/E8E8E8/666666?text=Map+View' }}
                style={styles.mapImage}
              />
            </View>
          </View>

          {/* Bottom spacing for fixed button */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{formatPrice(price)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: themeColors.primaryColor }]}
          onPress={handleContactAgent}>
          <Text style={styles.contactButtonText}>Contact Agent</Text>
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
    // backgroundColor: '#fff',
    // opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
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
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // minHeight: 500,
    // marginTop: -15,
    // backgroundColor: '#fff',
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
  },
  mapImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
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
    // backgroundColor: '#6B9B76',
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
});

export default PropertyDetailsScreen;
