import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from 'components/ThemedText';
import { generateStableGradientPair, getInitials } from 'lib/helpers';
import useSession from 'hooks/useSession';
import { useUnifiedStore } from '@/stores/useUnifiedStore';
import {
  BathIcon,
  BedIcon,
  Edit,
  LocationPin,
  MailIcon,
  PhoneIncoming,
  TrashIcon,
} from 'components/Svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import PropertyItem from './UI/PropertyItem';
import { AgentRootStackParamList } from 'components/User/types/navigation';

export const FLOATING_BUTTON_SPACE = 130;
type HomeScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'MainTabs'>;

// No Properties Content (when no listings exist)
const NoPropertyScreen = () => (
  <View style={styles.noPropertiesContent}>
    <View style={styles.illustrationContainer}>
      <Image source={require('../../assets/images/no-property.png')} />
    </View>

    <View style={styles.ctaContainer}>
      <Text style={styles.ctaTitle}>Showcase Your Property Today</Text>
      <Text style={styles.ctaSubtitle}>
        List your properties live and capture potential buyers and tenants
      </Text>
    </View>

    <TouchableOpacity style={styles.listButton}>
      <Text style={styles.listButtonText}>List a Property</Text>
    </TouchableOpacity>
  </View>
);

const ActiveListingsContent = ({ properties }: { properties: any }) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (properties.length === 0) {
    return <NoPropertyScreen />;
  }

  const handlePropertyPress: (property: any) => void = (property) => {
    navigation.navigate('ViewProperty', {
      propertyId: property.id,
      // propertyName: property.propertyName,
      // location: property.location,
      // bedrooms: property.bedrooms,
      // bathrooms: property.bathrooms,
      // price: property.price,
      // imageSource: property.imageSource,
      // images: property.images,
    });
  };

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[styles.activeListContainer]}
      // Add these props to ensure proper scrolling behavior
      showsVerticalScrollIndicator={false}
      bounces={true}
      // This ensures the last item can scroll up past the floating button
      contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
      contentInsetAdjustmentBehavior="never"
      // For Android compatibility
      ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handlePropertyPress(item)}
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            paddingHorizontal: 8,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            gap: 10,
            borderRadius: 18,
            marginBottom: 16,
          }}>
          <Image
            source={require('../../assets/images/onboarding-3.png')}
            style={styles.propertyImage}
          />

          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              paddingVertical: 5,
              paddingHorizontal: 5,
            }}>
            <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Clement</Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <LocationPin />
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  fontFamily: 'Bahnschrift',
                  fontWeight: '300',
                  fontSize: 12,
                  color: '#818181',
                  flexShrink: 1,
                }}>
                19. Adeniran Ogunsanya Street, Surulere, Lagos
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <BedIcon />
                <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>2</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <BathIcon />
                <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>2</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 5 }}>
                <Text style={{ fontSize: 10, color: '#818181', fontFamily: 'Bahnschrift' }}>
                  Price
                </Text>
                <Text style={{ fontFamily: 'Bahnschrift', fontSize: 14 }}>#1,200,000/year</Text>
              </View>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 15, // Changed from '100%' to numeric value
                  width: 30,
                  height: 30,
                }}>
                <TrashIcon />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const UnderReviewContent = ({ properties }: { properties: any }) => {
  const reviewProperties = properties.filter((p: any) => p.status === 'review');

  if (reviewProperties.length === 0) {
    return <NoPropertyScreen />;
  }

  return (
    <FlatList
      data={reviewProperties}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[styles.activeListContainer]}
      showsVerticalScrollIndicator={false}
      bounces={true}
      contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
      contentInsetAdjustmentBehavior="never"
      ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
      renderItem={({ item }) => <PropertyItem />}
    />
  );
};

const InactiveListingsContent = ({ properties }: { properties: any }) => {
  const inactiveProperties = properties.filter((p: any) => p.status === 'inactive');

  if (inactiveProperties.length === 0) {
    return <NoPropertyScreen />;
  }

  return (
    <FlatList
      data={inactiveProperties}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
      bounces={true}
      // This ensures the last item can scroll up past the floating button
      contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
      contentInsetAdjustmentBehavior="never"
      // For Android compatibility
      ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
      renderItem={({ item }) => (
        <View style={[styles.propertyCard, styles.inactiveCard]}>
          <Image
            source={{ uri: item.image }}
            style={[styles.propertyImage, styles.inactiveImage]}
          />
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, styles.inactiveText]}>{item.title}</Text>
            <Text style={[styles.propertyLocation, styles.inactiveText]}>{item.location}</Text>
            <Text style={[styles.propertyPrice, styles.inactiveText]}>{item.price}</Text>
            <View style={styles.inactiveStatus}>
              <Text style={styles.inactiveReason}>Reason: {item.inactiveReason}</Text>
              <Text style={styles.inactiveDate}>Deactivated {item.deactivatedDays} days ago</Text>
            </View>
          </View>
          <View style={styles.propertyActions}>
            <TouchableOpacity style={[styles.actionButton, styles.reactivateButton]}>
              <Text style={styles.reactivateButtonText}>Reactivate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const AgentHomeScreen = () => {
  const { auth } = useUnifiedStore();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'Active Listings' | 'Under Review' | 'Inactive Listings'
  >('Active Listings');

  useEffect(() => {
    console.log('sss', auth?.user);
    // Mock data for demonstration - replace with actual API call
    setProperties([
      {
        id: 1,
        title: 'Modern 3BR Apartment',
        location: 'Lagos Island, Lagos',
        price: '₦2,500,000/year',
        image: 'https://example.com/property1.jpg',
        views: 245,
        inquiries: 12,
        status: 'active',
      },
      {
        id: 2,
        title: 'Luxury 4BR Duplex',
        location: 'Victoria Island, Lagos',
        price: '₦5,000,000/year',
        image: 'https://example.com/property2.jpg',
        views: 189,
        inquiries: 8,
        status: 'active',
      },
      {
        id: 3,
        title: 'Cozy 2BR Flat',
        location: 'Ikeja, Lagos',
        price: '₦1,800,000/year',
        image: 'https://example.com/property3.jpg',
        submittedDays: 3,
        status: 'review',
      },
      {
        id: 4,
        title: 'Executive 5BR Villa',
        location: 'Ikoyi, Lagos',
        price: '₦8,000,000/year',
        image: 'https://example.com/property4.jpg',
        inactiveReason: 'Expired listing',
        deactivatedDays: 15,
        status: 'active',
      },
      {
        id: 5,
        title: 'Modern 3BR Apartment',
        location: 'Lagos Island, Lagos',
        price: '₦2,500,000/year',
        image: 'https://example.com/property1.jpg',
        views: 245,
        inquiries: 12,
        status: 'active',
      },
    ]);
  }, [auth?.user]);

  const [fontsLoaded] = useFonts({
    Bahnschrift: require('../../assets/fonts/BAHNSCHRIFT.ttf'),
    // Bahnschrift1: require('../../assets/fonts/BAHNSCHRIFT.TTF'),
  });

  const tabs = ['Active Listings', 'Under Review', 'Inactive Listings'];

  const TabButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: any;
    isActive: boolean;
    onPress: any;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  const gradientColors = useMemo(() => {
    return generateStableGradientPair(auth?.user?.id ?? auth?.user?.id ?? '');
  }, [auth.user?.id]);

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Active Listings':
        return (
          <ActiveListingsContent properties={properties.filter((p) => p.status === 'active')} />
        );
      case 'Under Review':
        return <UnderReviewContent properties={properties} />;
      case 'Inactive Listings':
        return <InactiveListingsContent properties={properties} />;
      default:
        return (
          <ActiveListingsContent properties={properties.filter((p) => p.status === 'active')} />
        );
    }
  };

  return (
    <>
      {/* <SafeAreaView style={[styles.container,  {
            paddingTop: insets.top,
          },]}> */}
      <View
        style={[
          styles.container,
          // {
          //   paddingTop: insets.top,
          // },
        ]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  {auth?.user?.avatar ? (
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                      <Image source={{ uri: auth?.user?.avatar }} style={styles.questionImage} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.questionImage}>
                        <ThemedText style={styles.initialsText}>
                          {getInitials(auth?.user?.firstName ?? '')}
                        </ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <Text style={{ fontFamily: 'Bahnschrift', color: '#fff' }}>Hello,</Text>
                    <Text style={styles.userName}>Ajirioghene Okpeva</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={{
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '100%',
                    width: 34,
                    height: 34,
                  }}>
                  <EvilIcons name="bell" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <View style={styles.contactInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MailIcon />
                  <Text style={styles.contactText}>{auth?.user?.email}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Edit />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <PhoneIncoming />
                  <Text style={styles.contactText}>{auth?.user?.phoneNumber}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Edit />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              title={tab}
              isActive={activeTab === tab}
              onPress={() =>
                setActiveTab(tab as 'Active Listings' | 'Under Review' | 'Inactive Listings')
              }
            />
          ))}
        </View>

        {/* Main Content - Conditionally rendered based on active tab */}
        <View style={styles.content}>{renderTabContent()}</View>

        {/* <TouchableOpacity style={{ position: 'absolute', backgroundColor: '#000', borderRadius: '100%', width: 50, height: 50, bottom: "15%", right: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{color: '#fff', fontSize: 30}}>+</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => navigation.navigate('AddProperty')}
          style={{ position: 'absolute', bottom: '15%', right: '6%' }}>
          <AntDesign name="plus-circle" size={50} color="black" />
          {/* <SimpleLineIcons name="plus" size={50} color="white" style={{backgroundColor: 'black', borderRadius: '100%'}} /> */}
        </TouchableOpacity>
      </View>

      {/* </SafeAreaView> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 20,
    paddingTop: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  questionImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    objectFit: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    width: 65,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Matter',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 8,
    marginTop: 10,
  },
  contactText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  profileImageContainer: {
    marginLeft: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    // marginBottom: 200,
  },
  // Original NoPropertyScreen styles
  noPropertiesContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  illustrationContainer: {
    alignItems: 'center',
  },
  ctaContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 12,
    fontWeight: 300,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  listButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
  },
  listButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  // New styles for listings content
  listingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listingsHeader: {
    paddingVertical: 20,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  listingsSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  activeListContainer: {
    marginTop: 24,
    flex: 1,
    paddingHorizontal: 24,
    // paddingBottom: 240,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    gap: 10,
  },
  propertyImage: {
    width: '35%',
    height: 130,
    borderRadius: 18,
    // marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  propertyInfo: {
    paddingVertical: 12,
    // gap: 4,
    width: '62%',
    // backgroundColor: 'red',
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: 'Cabin',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a90e2',
    marginBottom: 8,
  },
  propertyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  propertyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  deactivateButton: {
    borderColor: '#ff4757',
  },
  deactivateButtonText: {
    color: '#ff4757',
  },
  reactivateButton: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  reactivateButtonText: {
    color: '#fff',
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Review-specific styles
  reviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  reviewTime: {
    fontSize: 12,
    color: '#888',
  },
  // Inactive-specific styles
  inactiveCard: {
    opacity: 0.7,
  },
  inactiveImage: {
    opacity: 0.6,
  },
  inactiveText: {
    color: '#999',
  },
  inactiveStatus: {
    gap: 4,
  },
  inactiveReason: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '500',
  },
  inactiveDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default AgentHomeScreen;
