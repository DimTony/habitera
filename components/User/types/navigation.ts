import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Tab Navigator Params
export type TabParamList = {
  Home: undefined;
  Bookmark: undefined;
  Search: undefined;
  Chat: undefined;
  Settings: undefined;
};

// Root Stack Navigator Params
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  PropertyDetails: {
    propertyId: string;
    propertyName: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    imageSource: any;
    images: any[];
    // Add more property details as needed
    description?: string;
    amenities?: string[];
    ownerInfo?: {
      name: string;
      image: string;
      rating: number;
      properties: number;
      responseTime: string;
      isVerified: boolean;
    };
  };
  PropertyImageGallery: {
    propertyId: string;
    images: any[];
  };
  ContactOwner: {
    propertyId: string;
    propertyName: string;
    ownerInfo?: {
      name: string;
      image: string;
      rating: number;
      properties: number;
      responseTime: string;
      isVerified: boolean;
    };
  };
  FilterModal: undefined;
  ChangePassword: undefined;
  Profile: undefined;
};

// Screen Props Types
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;
export type PropertyDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PropertyDetails'
>;
export type PropertyImageGalleryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PropertyImageGallery'
>;
export type ContactOwnerScreenProps = NativeStackScreenProps<RootStackParamList, 'ContactOwner'>;
export type FilterModalScreenProps = NativeStackScreenProps<RootStackParamList, 'FilterModal'>;
export type ChangePasswordProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Navigation Hook Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
