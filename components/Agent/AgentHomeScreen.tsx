import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from 'components/ThemedText';
import { generateStableGradientPair, getInitials } from 'lib/helpers';
import { resolveAvatarSource } from 'lib/avatars';
import { getMyProfile } from 'lib/api/profile';
import { deleteProperty, getAgentProperties } from 'lib/api/properties';
import { getErrorMessage } from 'lib/api/errors';
import type { PropertyDto } from 'lib/api/types';
import { syncLocalUser } from 'lib/auth/session';
import { mapPropertyDto, type AppProperty } from 'lib/properties/mapProperty';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';
import {
  BathIcon,
  BedIcon,
  Edit,
  LocationPin,
  MailIcon,
  PhoneIncoming,
  TrashIcon,
} from 'components/Svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

export const FLOATING_BUTTON_SPACE = 130;

type AgentListing = AppProperty & {
  status?: string | null;
  isPublished?: boolean;
  rawStatus?: string;
  reviewSubmittedAt?: string | null;
  rejectionReason?: string | null;
  favoriteCount: number;
  contactCount: number;
};

function toAgentListing(dto: PropertyDto): AgentListing {
  const mapped = mapPropertyDto(dto);
  return {
    ...mapped,
    status: dto.status,
    isPublished: dto.isPublished,
    rawStatus: dto.status,
    reviewSubmittedAt: dto.reviewSubmittedAt,
    rejectionReason: dto.rejectionReason,
    favoriteCount: dto.favoriteCount ?? 0,
    contactCount: dto.contactCount ?? 0,
  };
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatListingPrice(property: AgentListing) {
  const amount = Number(property.price ?? 0).toLocaleString();
  const unit = property.priceUnit ? `/${property.priceUnit.toLowerCase()}` : '';
  return `${property.currency}${amount}${unit}`;
}

function isActiveListing(property: AgentListing) {
  return (
    property.isPublished === true &&
    (normalizeStatus(property.status) === 'active' ||
      normalizeStatus(property.rawStatus) === 'active')
  );
}

function normalizeStatus(status?: string | null) {
  return String(status ?? '').trim().toLowerCase();
}

function isUnderReviewListing(property: AgentListing) {
  // Only real pending listings — never invent placeholder rows client-side.
  return normalizeStatus(property.status) === 'pending' || normalizeStatus(property.rawStatus) === 'pending';
}

function isInactiveListing(property: AgentListing) {
  const status = property.status || property.rawStatus || '';
  return ['Inactive', 'Withdrawn', 'Expired', 'Sold'].includes(status);
}

const NoPropertyScreen = ({
  onListPress,
  title = 'Showcase Your Property Today',
  subtitle = 'List your properties live and capture potential buyers and tenants',
  ctaLabel = 'List a Property',
}: {
  onListPress: () => void;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}) => (
  <View style={styles.noPropertiesContent}>
    <View style={styles.illustrationContainer}>
      <Image source={require('../../assets/images/no-property.png')} />
    </View>

    <View style={styles.ctaContainer}>
      <Text style={styles.ctaTitle}>{title}</Text>
      <Text style={styles.ctaSubtitle}>{subtitle}</Text>
    </View>

    <TouchableOpacity style={styles.listButton} onPress={onListPress}>
      <Text style={styles.listButtonText}>{ctaLabel}</Text>
    </TouchableOpacity>
  </View>
);

const ListingCard = ({
  property,
  onPress,
  onDelete,
  badge,
}: {
  property: AgentListing;
  onPress: () => void;
  onDelete: () => void;
  badge?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
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
    <Image source={property.imageSource} style={styles.propertyImage} />

    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 5,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16, flex: 1 }} numberOfLines={1}>
          {property.propertyName}
        </Text>
        {badge ? (
          <Text style={{ fontSize: 10, color: '#818181', fontFamily: 'Bahnschrift' }}>{badge}</Text>
        ) : null}
      </View>

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
          {property.location}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <BedIcon />
          <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>
            {property.bedrooms}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <BathIcon />
          <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>
            {property.bathrooms}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 11, color: '#678B83', fontFamily: 'Bahnschrift' }}>
        {countLabel(property.favoriteCount, 'bookmark', 'bookmarks')} ·{' '}
        {countLabel(property.contactCount, 'contact', 'contacts')}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 10, color: '#818181', fontFamily: 'Bahnschrift' }}>Price</Text>
          <Text style={{ fontFamily: 'Bahnschrift', fontSize: 14 }}>
            {formatListingPrice(property)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 15,
            width: 30,
            height: 30,
          }}>
          <TrashIcon />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const ListingsContent = ({
  properties,
  badgeForItem,
  onListPress,
  onDelete,
  refreshing,
  onRefresh,
  emptyTitle,
  emptySubtitle,
  emptyCtaLabel,
}: {
  properties: AgentListing[];
  badgeForItem?: (property: AgentListing) => string | undefined;
  onListPress: () => void;
  onDelete: (property: AgentListing) => void;
  refreshing: boolean;
  onRefresh: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyCtaLabel?: string;
}) => {
  const router = useRouter();

  if (properties.length === 0) {
    return (
      <NoPropertyScreen
        onListPress={onListPress}
        title={emptyTitle}
        subtitle={emptySubtitle}
        ctaLabel={emptyCtaLabel}
      />
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.activeListContainer]}
      showsVerticalScrollIndicator={false}
      bounces
      contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
      contentInsetAdjustmentBehavior="never"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
      renderItem={({ item }) => (
        <ListingCard
          property={item}
          badge={badgeForItem?.(item)}
          onPress={() => router.push(`/(agent)/property/${item.id}`)}
          onDelete={() => onDelete(item)}
        />
      )}
    />
  );
};

const AgentHomeScreen = () => {
  const { user } = useAppStore();
  const { showToast } = useToastStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<AgentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'Active Listings' | 'Under Review' | 'Inactive Listings'
  >('Active Listings');
  const profileCompleted = Boolean(user?.profileCompleted);
  const completionPercentage = Number(user?.completionPercentage ?? 0);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Agent';

  const loadProperties = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await getAgentProperties({ pageNumber: 1, pageSize: 50 });
      if (!result.success) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to load your listings.',
        });
        return;
      }
      setProperties(
        (result.data ?? [])
          .map(toAgentListing)
          .filter((item) => item.status !== 'Deleted' && item.rawStatus !== 'Deleted')
      );
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load your listings.'),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const result = await getMyProfile();
          if (!active || !result.success || !result.data) return;
          await syncLocalUser(result.data);
        } catch {
          // Keep cached session if refresh fails.
        }

        if (active) {
          await loadProperties('initial');
        }
      })();
      return () => {
        active = false;
      };
    }, [loadProperties])
  );

  const handleDeleteProperty = useCallback(
    (property: AgentListing) => {
      Alert.alert('Delete listing', `Remove "${property.propertyName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteProperty(property.id);
              if (!result.success) {
                showToast({
                  type: 'error',
                  message: result.message || 'Unable to delete listing.',
                });
                return;
              }
              setProperties((prev) => prev.filter((item) => item.id !== property.id));
              showToast({ type: 'success', message: 'Listing deleted.' });
            } catch (error) {
              showToast({
                type: 'error',
                message: getErrorMessage(error, 'Unable to delete listing.'),
              });
            }
          },
        },
      ]);
    },
    [showToast]
  );

  const [fontsLoaded] = useFonts({
    Bahnschrift: require('../../assets/fonts/BAHNSCHRIFT.ttf'),
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
    return generateStableGradientPair(user?._id ?? user?.id ?? '');
  }, [user?.id, user?._id]);

  const activeListings = useMemo(() => properties.filter(isActiveListing), [properties]);
  const underReviewListings = useMemo(
    () => properties.filter(isUnderReviewListing),
    [properties]
  );
  const inactiveListings = useMemo(() => properties.filter(isInactiveListing), [properties]);

  const goToAddProperty = () => router.push('/(agent)/add-property');

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    }

    switch (activeTab) {
      case 'Under Review':
        return (
          <ListingsContent
            properties={underReviewListings}
            onListPress={goToAddProperty}
            onDelete={handleDeleteProperty}
            refreshing={isRefreshing}
            onRefresh={() => loadProperties('refresh')}
            badgeForItem={(item) => (item.reviewSubmittedAt ? 'In review' : 'Draft')}
            emptyTitle="Nothing under review"
            emptySubtitle="Submitted listings will appear here until an admin approves them."
            emptyCtaLabel="Add a listing"
          />
        );
      case 'Inactive Listings':
        return (
          <ListingsContent
            properties={inactiveListings}
            onListPress={goToAddProperty}
            onDelete={handleDeleteProperty}
            refreshing={isRefreshing}
            onRefresh={() => loadProperties('refresh')}
          />
        );
      case 'Active Listings':
      default:
        return (
          <ListingsContent
            properties={activeListings}
            onListPress={goToAddProperty}
            onDelete={handleDeleteProperty}
            refreshing={isRefreshing}
            onRefresh={() => loadProperties('refresh')}
          />
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
                  <TouchableOpacity onPress={() => router.push('/(agent)/profile')}>
                    {user?.profilePhoto ? (
                      <Image
                        source={resolveAvatarSource(user.profilePhoto)}
                        style={styles.questionImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.questionImage}>
                        <ThemedText style={styles.initialsText}>
                          {getInitials(displayName)}
                        </ThemedText>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <Text style={{ fontFamily: 'Bahnschrift', color: '#fff' }}>Hello,</Text>
                    <Text style={styles.userName}>{displayName}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(agent)/notifications')}
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
                  <Text style={styles.contactText}>{user?.email || '—'}</Text>
                  <TouchableOpacity onPress={() => router.push('/(agent)/profile')}>
                    <Edit />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <PhoneIncoming />
                  <Text style={styles.contactText}>{user?.phoneNumber || 'Add phone'}</Text>
                  <TouchableOpacity onPress={() => router.push('/(agent)/profile')}>
                    <Edit />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {!profileCompleted ? (
          <TouchableOpacity
            style={styles.completeProfileCta}
            onPress={() => router.push('/(agent)/profile')}
            activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
              <Text style={styles.completeProfileTitle}>Complete your profile</Text>
              <Text style={styles.completeProfileSubtitle}>
                {completionPercentage > 0
                  ? `${completionPercentage}% done — finish your agent details to build trust.`
                  : 'Add your details so buyers can recognize and trust your listings.'}
              </Text>
            </View>
            <View style={styles.completeProfileButton}>
              <Text style={styles.completeProfileButtonText}>Continue</Text>
            </View>
          </TouchableOpacity>
        ) : null}

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
          onPress={() => router.push('/(agent)/add-property')}
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
  completeProfileCta: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completeProfileTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  completeProfileSubtitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#5C5C5C',
    lineHeight: 16,
  },
  completeProfileButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  completeProfileButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Bahnschrift',
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
