import { Ionicons } from '@expo/vector-icons';
import PropertyCard from 'components/User/Shared/PropertyCard';
import { BackArrow } from 'components/Svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getAgentPublicProfile } from 'lib/api/profile';
import { getErrorMessage } from 'lib/api/errors';
import type { AgentPublicProfile } from 'lib/api/types';
import { resolveAvatarSource } from 'lib/avatars';
import { mapPropertyDto } from 'lib/properties/mapProperty';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToastStore } from 'stores/useToastStore';

function locationLabel(profile: AgentPublicProfile) {
  return [profile.city, profile.state, profile.country].filter(Boolean).join(', ');
}

const AgentProfileScreen = () => {
  const router = useRouter();
  const { id, propertyId } = useLocalSearchParams<{ id?: string; propertyId?: string }>();
  const { showToast } = useToastStore();
  const [profile, setProfile] = useState<AgentPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getAgentPublicProfile(id);
        if (!active) return;
        if (!result.success || !result.data) {
          showToast({
            type: 'error',
            message: result.message || 'Unable to load this agent.',
          });
          setProfile(null);
          return;
        }
        setProfile(result.data);
      } catch (error) {
        if (!active) return;
        showToast({
          type: 'error',
          message: getErrorMessage(error, 'Unable to load this agent.'),
        });
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, showToast]);

  const listings = [...(profile?.listings ?? [])].sort((a, b) => {
    if (a.id === propertyId) return -1;
    if (b.id === propertyId) return 1;
    return 0;
  });

  const memberYear = profile?.memberSince ? new Date(profile.memberSince).getFullYear() : null;
  const reviewLabel =
    profile && profile.totalReviews > 0
      ? `${Number(profile.averageRating).toFixed(1)} · ${profile.totalReviews} review${profile.totalReviews === 1 ? '' : 's'}`
      : 'No reviews yet';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#111" />
      ) : !profile ? (
        <Text style={styles.empty}>This agent profile is unavailable.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <Image source={resolveAvatarSource(profile.profilePhoto)} style={styles.avatar} />
            <Text style={styles.name}>{profile.fullName}</Text>
            {profile.agencyName ? <Text style={styles.agency}>{profile.agencyName}</Text> : null}
            {locationLabel(profile) ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.meta}>{locationLabel(profile)}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color="#1a1a1a" />
              <Text style={styles.meta}>{reviewLabel}</Text>
            </View>
            {memberYear ? <Text style={styles.meta}>Agent since {memberYear}</Text> : null}
            {profile.licenseNumber ? (
              <Text style={styles.meta}>License {profile.licenseNumber}</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>
            Listings{profile.listingCount ? ` (${profile.listingCount})` : ''}
          </Text>
          {listings.length === 0 ? (
            <Text style={styles.emptyListings}>No published listings yet.</Text>
          ) : (
            listings.map((listing) => {
              const property = mapPropertyDto(listing);
              const isCurrent = listing.id === propertyId;
              return (
                <View key={listing.id} style={styles.listing}>
                  {isCurrent ? <Text style={styles.currentLabel}>This conversation</Text> : null}
                  <PropertyCard
                    propertyName={property.propertyName}
                    location={property.location}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    price={property.price}
                    priceUnit={property.priceUnit}
                    currency={property.currency}
                    imageSource={property.imageSource}
                    onCardPress={() => router.push(`/(user)/property/${property.id}`)}
                  />
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
  },
  content: { padding: 20, paddingBottom: 48 },
  identity: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  name: {
    fontFamily: 'Bahnschrift',
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  agency: {
    marginTop: 4,
    fontFamily: 'Bahnschrift',
    fontSize: 15,
    color: '#444',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  meta: {
    fontFamily: 'Bahnschrift',
    fontSize: 13,
    color: '#666',
  },
  sectionTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  listing: { marginBottom: 8 },
  currentLabel: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#678B83',
    marginBottom: 4,
    marginLeft: 4,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Bahnschrift',
  },
  emptyListings: {
    color: '#666',
    fontFamily: 'Bahnschrift',
    marginTop: 8,
  },
});

export default AgentProfileScreen;
