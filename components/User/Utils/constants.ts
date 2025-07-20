import { ImageSourcePropType } from 'react-native';

export interface Property {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: ImageSourcePropType[];
  imageSource: ImageSourcePropType; // Main image (first in images array)
}

export const properties: Property[] = [
  {
    id: '1',
    propertyName: 'Sunset Villa',
    location: '12, Victoria Island, Lagos',
    bedrooms: 4,
    bathrooms: 3,
    price: 3500000,
    description:
      'Luxurious 4-bedroom villa with ocean view, modern amenities, and private garden. Perfect for families seeking comfort and elegance.',
    coordinates: {
      latitude: 6.4317,
      longitude: 3.4106,
    },
    images: [
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-3.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    propertyName: 'Modern Heights Apartment',
    location: '45, Ikoyi, Lagos',
    bedrooms: 2,
    bathrooms: 2,
    price: 2200000,
    description:
      'Contemporary 2-bedroom apartment in a high-rise building with gym, swimming pool, and 24/7 security.',
    coordinates: {
      latitude: 6.4568,
      longitude: 3.4441,
    },
    images: [
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-1.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    propertyName: 'Green Park Residence',
    location: '8, Lekki Phase 1, Lagos',
    bedrooms: 3,
    bathrooms: 2,
    price: 2800000,
    description:
      'Spacious 3-bedroom house with beautiful garden, parking space for 2 cars, and close to shopping centers.',
    coordinates: {
      latitude: 6.4441,
      longitude: 3.5143,
    },
    images: [
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-4.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-3.png'),
  },
  {
    id: '4',
    propertyName: 'Skyline Towers',
    location: '23, Surulere, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    price: 950000,
    description:
      'Cozy 1-bedroom apartment perfect for young professionals. Includes fitted kitchen and balcony with city view.',
    coordinates: {
      latitude: 6.4969,
      longitude: 3.3603,
    },
    images: [
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-2.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-4.png'),
  },
  {
    id: '5',
    propertyName: 'Royal Gardens Estate',
    location: '56, Ajah, Lagos',
    bedrooms: 5,
    bathrooms: 4,
    price: 4500000,
    description:
      'Magnificent 5-bedroom duplex with swimming pool, boys quarters, generator house, and gated community.',
    coordinates: {
      latitude: 6.4698,
      longitude: 3.5852,
    },
    images: [
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-4.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-1.png'),
  },
  {
    id: '6',
    propertyName: 'Harmony Flats',
    location: '19, Yaba, Lagos',
    bedrooms: 2,
    bathrooms: 1,
    price: 1400000,
    description:
      'Affordable 2-bedroom flat in a serene environment. Good for students and young couples starting out.',
    coordinates: {
      latitude: 6.5158,
      longitude: 3.3784,
    },
    images: [
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-3.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-2.png'),
  },
  {
    id: '7',
    propertyName: 'Executive Chambers',
    location: '31, Victoria Island, Lagos',
    bedrooms: 3,
    bathrooms: 3,
    price: 3200000,
    description:
      'Premium 3-bedroom serviced apartment with housekeeping, laundry service, and prime location.',
    coordinates: {
      latitude: 6.429,
      longitude: 3.4197,
    },
    images: [
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-1.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-3.png'),
  },
  {
    id: '8',
    propertyName: 'Oceanview Terraces',
    location: '67, Lekki Phase 2, Lagos',
    bedrooms: 4,
    bathrooms: 4,
    price: 3800000,
    description:
      'Stunning 4-bedroom terrace with direct beach access, modern fittings, and smart home features.',
    coordinates: {
      latitude: 6.405,
      longitude: 3.5528,
    },
    images: [
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-2.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-4.png'),
  },
  {
    id: '9',
    propertyName: 'Urban Nest',
    location: '14, Ikeja, Lagos',
    bedrooms: 2,
    bathrooms: 2,
    price: 1800000,
    description:
      'Modern 2-bedroom apartment close to airport and business district. Fully furnished with AC.',
    coordinates: {
      latitude: 6.5934,
      longitude: 3.3464,
    },
    images: [
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-4.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-1.png'),
  },
  {
    id: '10',
    propertyName: 'Golden Gate Mansion',
    location: '89, Banana Island, Lagos',
    bedrooms: 6,
    bathrooms: 5,
    price: 8500000,
    description:
      'Ultra-luxury 6-bedroom mansion with cinema room, wine cellar, infinity pool, and yacht dock.',
    coordinates: {
      latitude: 6.4167,
      longitude: 3.4458,
    },
    images: [
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-4.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-2.png'),
  },
  {
    id: '11',
    propertyName: 'Student Lodge',
    location: '42, Akoka, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    price: 650000,
    description:
      'Budget-friendly 1-bedroom apartment ideal for students. Close to University of Lagos campus.',
    coordinates: {
      latitude: 6.52,
      longitude: 3.3889,
    },
    images: [
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-2.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-3.png'),
  },
  {
    id: '12',
    propertyName: 'Family Haven',
    location: '25, Gbagada, Lagos',
    bedrooms: 4,
    bathrooms: 3,
    price: 2600000,
    description:
      'Spacious 4-bedroom bungalow with large compound, parking for 3 cars, and children play area.',
    coordinates: {
      latitude: 6.5492,
      longitude: 3.3947,
    },
    images: [
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-1.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-4.png'),
  },
  {
    id: '13',
    propertyName: 'Business District Suites',
    location: '38, Apapa, Lagos',
    bedrooms: 2,
    bathrooms: 2,
    price: 1600000,
    description:
      'Professional 2-bedroom apartment in commercial area. Perfect for business executives and port workers.',
    coordinates: {
      latitude: 6.4406,
      longitude: 3.3589,
    },
    images: [
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-2.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-1.png'),
  },
  {
    id: '14',
    propertyName: 'Serene Courts',
    location: '71, Magodo, Lagos',
    bedrooms: 3,
    bathrooms: 2,
    price: 2400000,
    description:
      'Peaceful 3-bedroom flat in gated estate with 24/7 security, playground, and recreational facilities.',
    coordinates: {
      latitude: 6.5714,
      longitude: 3.3792,
    },
    images: [
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-3.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-2.png'),
  },
  {
    id: '15',
    propertyName: 'Millennium Heights',
    location: '93, Festac Town, Lagos',
    bedrooms: 2,
    bathrooms: 1,
    price: 1100000,
    description:
      'Affordable 2-bedroom apartment in well-planned estate with good road network and infrastructure.',
    coordinates: {
      latitude: 6.4642,
      longitude: 3.2808,
    },
    images: [
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-1.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-3.png'),
  },
  {
    id: '16',
    propertyName: 'Paradise Villas',
    location: '16, Chevron Drive, Lekki, Lagos',
    bedrooms: 5,
    bathrooms: 4,
    price: 5200000,
    description:
      'Exclusive 5-bedroom villa with private pool, tennis court, gym, and 24/7 concierge service.',
    coordinates: {
      latitude: 6.4314,
      longitude: 3.5064,
    },
    images: [
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-1.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-4.png'),
  },
  {
    id: '17',
    propertyName: 'Metro Square',
    location: '52, Maryland, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    price: 800000,
    description:
      'Compact 1-bedroom studio apartment perfect for singles. Walking distance to bus stops and shopping malls.',
    coordinates: {
      latitude: 6.5691,
      longitude: 3.3542,
    },
    images: [
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-3.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-1.png'),
  },
  {
    id: '18',
    propertyName: 'Coastal Retreats',
    location: '84, Oniru, Lagos',
    bedrooms: 3,
    bathrooms: 3,
    price: 3600000,
    description:
      'Beachfront 3-bedroom apartment with panoramic ocean views, balcony, and direct beach access.',
    coordinates: {
      latitude: 6.4086,
      longitude: 3.4653,
    },
    images: [
      require('../../../assets/images/onboarding-2.png'),
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-4.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-2.png'),
  },
  {
    id: '19',
    propertyName: 'Heritage Homes',
    location: '27, Anthony Village, Lagos',
    bedrooms: 4,
    bathrooms: 3,
    price: 2100000,
    description:
      'Traditional 4-bedroom house with modern renovations, large living spaces, and mature garden.',
    coordinates: {
      latitude: 6.5542,
      longitude: 3.4119,
    },
    images: [
      require('../../../assets/images/onboarding-3.png'),
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-2.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-3.png'),
  },
  {
    id: '20',
    propertyName: 'Downtown Lofts',
    location: '65, Lagos Island, Lagos',
    bedrooms: 2,
    bathrooms: 2,
    price: 1750000,
    description:
      'Historic 2-bedroom loft apartment with high ceilings, exposed brick walls, and city center location.',
    coordinates: {
      latitude: 6.455,
      longitude: 3.3841,
    },
    images: [
      require('../../../assets/images/onboarding-4.png'),
      require('../../../assets/images/onboarding-1.png'),
      require('../../../assets/images/onboarding-3.png'),
    ],
    imageSource: require('../../../assets/images/onboarding-4.png'),
  },
];
