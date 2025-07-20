import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LocationIcon from 'components/Icons/LocationIcon';
import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';

import PropertyCard from './Shared/PropertyCard';
import { properties, Property } from './Utils/constants';
import { RootStackParamList } from './types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const UserHomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { themeColors } = useAppStore();

  const handleFilterPress = (): void => {
    navigation.navigate('FilterModal');
  };

  const handlePropertyPress = (property: Property): void => {
    navigation.navigate('PropertyDetails', {
      propertyId: property.id,
      propertyName: property.propertyName,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      price: property.price,
      imageSource: property.imageSource,
      images: property.images,
    });
  };

  const handleBookmarkPress = (propertyId: string): void => {
    console.log('Bookmark pressed for property:', propertyId);
    // Add your bookmark logic here - maybe update global state
    // Example: toggleBookmark(propertyId);
  };

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <PropertyCard
      propertyName={item.propertyName}
      location={item.location}
      bedrooms={item.bedrooms}
      bathrooms={item.bathrooms}
      price={item.price}
      priceUnit="Year"
      currency="₦"
      imageSource={item.imageSource}
      isBookmarked={false} // You can manage this with global state
      onBookmarkPress={() => handleBookmarkPress(item.id)}
      onCardPress={() => handlePropertyPress(item)}
      customStyles={{
        container: { marginVertical: 8 },
      }}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarContainer}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
        </TouchableOpacity>

        <View style={styles.locationWrapper}>
          <Text style={styles.locationLabel}>Location</Text>
          <View style={styles.locationSelect}>
            <LocationIcon color={themeColors.primaryColor} />
            <Text style={styles.locationText}>Surulere, Lagos</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
        </View>

        <TouchableOpacity style={styles.notificationContainer}>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={20} color="#333" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput placeholder="Search" style={styles.searchInput} placeholderTextColor="#999" />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: themeColors.primaryColor }]}
          onPress={handleFilterPress}>
          <Ionicons name="options" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsLabel}>Search results ({properties.length})</Text>
      </View>

      {/* Property List */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderPropertyCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default UserHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 70,
    paddingHorizontal: 30,
    paddingBottom: 20,
    backgroundColor: '#8A8A8A80',
  },
  avatarContainer: {
    width: 50,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  locationWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    color: '#222',
    marginBottom: 2,
  },
  locationSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  notificationContainer: {
    width: 50,
    alignItems: 'flex-end',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#8A8A8A80',
    paddingBottom: 40,
  },
  searchInputContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#6B9B76',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
