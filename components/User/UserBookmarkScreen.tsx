import { View, Text, ScrollView } from 'react-native';

import PropertyCard from './Shared/PropertyCard';
import TabsLayout from './TabsLayout';

const UserBookmarkScreen = () => {
  return (
    <TabsLayout tabName="Bookmarks">
      <ScrollView className="flex-1 gap-3 px-5 pb-28">
        <PropertyCard
          propertyName="Clement Properties"
          location="19, Adeniran Ogunsanya Street, Surulere, Lagos"
          bedrooms={2}
          bathrooms={2}
          price={1200000}
          priceUnit="Year"
          currency="₦"
          imageSource={require('../../assets/images/onboarding-1.png')}
          isBookmarked
          onBookmarkPress={() => console.log('Bookmark pressed')}
          onCardPress={() => console.log('Card pressed')}
          customStyles={{
            container: { marginVertical: 8 },
            // priceText: { fontWeight: 'bold' },
          }}
        />
      </ScrollView>
    </TabsLayout>
  );
};

export default UserBookmarkScreen;
