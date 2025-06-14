import BedIcon from 'components/Icons/BedIcon';
import LocationIcon from 'components/Icons/LocationIcon';
import BookmarkFilledIcon from 'components/Icons/TabIcons/BookmarkFilledIcon';
import ToiletIcon from 'components/Icons/ToiletIcon';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import React from 'react';
import BookmarkOutlineIcon from 'components/Icons/TabIcons/BookmarkOutlineIcon';

interface CustomStyles {
  container?: ViewStyle;
  image?: ImageStyle;
  content?: ViewStyle;
  propertyNameText?: TextStyle;
  locationText?: TextStyle;
  amenityText?: TextStyle;
  priceLabel?: TextStyle;
  priceText?: TextStyle;
  priceUnitText?: TextStyle;
  bookmarkButton?: ViewStyle;
}

interface PropertyCardProps {
  propertyName: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  priceUnit?: string;
  currency?: string;
  imageSource: ImageSourcePropType;
  isBookmarked?: boolean;
  onBookmarkPress?: () => void;
  onCardPress?: () => void;
  customStyles?: CustomStyles;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  propertyName,
  location,
  bedrooms,
  bathrooms,
  price,
  priceUnit = 'Year',
  currency = '₦',
  imageSource,
  isBookmarked = false,
  onBookmarkPress,
  onCardPress,
  customStyles = {},
}) => {
  const {
    container,
    image,
    content,
    propertyNameText,
    locationText,
    amenityText,
    priceLabel,
    priceText,
    priceUnitText,
    bookmarkButton,
  } = customStyles;

  return (
    <TouchableOpacity
      className="flex min-w-full flex-row items-center gap-4 rounded-lg bg-white p-2 shadow-sm shadow-slate-400/60"
      style={container}
      onPress={onCardPress}
      activeOpacity={0.7}>
      <View>
        <Image
          source={imageSource}
          className="h-[100px] w-[100px] rounded-lg"
          style={image}
          resizeMode="cover"
        />
      </View>
      <View className="flex-1 gap-2" style={content}>
        <Text className="font-sm" style={propertyNameText}>
          {propertyName}
        </Text>
        <View className="flex-row items-start gap-1">
          <LocationIcon />
          <Text className="text-[8px] text-[#818181]" style={locationText}>
            {location}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {bedrooms && (
            <View className="flex-row items-center gap-1">
              <BedIcon />
              <Text className="text-[10px] text-[#818181]" style={amenityText}>
                {bedrooms}
              </Text>
            </View>
          )}
          {bathrooms && (
            <View className="flex-row items-center gap-1">
              <ToiletIcon />
              <Text className="text-[10px] text-[#818181]" style={amenityText}>
                {bathrooms}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[8px] text-[#707070]" style={priceLabel}>
              Price
            </Text>
            <View className="flex-row items-end">
              <Text style={priceText}>
                {currency} {price?.toLocaleString()}/
              </Text>
              <Text className="text-xs" style={priceUnitText}>
                {priceUnit}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="mx-4 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white shadow-sm"
            style={bookmarkButton}
            onPress={onBookmarkPress}
            activeOpacity={0.7}>
            {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PropertyCard;
