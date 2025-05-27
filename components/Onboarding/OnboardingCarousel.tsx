// components/Onboarding/OnboardingCarousel.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StyleSheet,
  ImageSourcePropType,
  Animated,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

interface OnboardingCarouselProps {
  onComplete: (userType: 'user' | 'agent') => void;
}

const carouselData: CarouselItem[] = [
  {
    id: '1',
    image: require('../../assets/images/onboarding-1.png'),
    title: 'Start Your Journey to the Perfect Home',
    description:
      'Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.',
  },
  {
    id: '2',
    image: require('../../assets/images/onboarding-2.png'),
    title: 'House-hunting Simplified',
    description:
      'Explore a curated selection of properties that match your lifestyle and preferences.',
  },
  {
    id: '3',
    image: require('../../assets/images/onboarding-3.png'),
    title: 'Smarter Searches, Better Homes',
    description: 'Schedule viewings and make inquiries with just a few taps.',
  },
  {
    id: '4',
    image: require('../../assets/images/onboarding-4.png'),
    title: 'Your Dream Home, Your Trusted Partner',
    description: 'Get personalized assistance from our network of professional real estate agents.',
  },
];

const OVERLAY_COLOR = '#678B83';
const OVERLAY_OPACITY = 0.5;

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animation values for text fade and slide transitions
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;

  // Handle animated text transition when index changes
  useEffect(() => {
    // Start by moving text down slightly while fading out
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(textTranslateY, {
        toValue: 20,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      // Reset the position above the viewport (prep for slide down animation)
      textTranslateY.setValue(-20);

      // Then fade in and move to original position
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  }, [currentIndex]);

  // Function to go to next slide
  const goToNextSlide = ({ userType }: { userType?: 'user' | 'agent' }) => {
    if (currentIndex === carouselData.length - 1) {
      onComplete(userType as 'user' | 'agent');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Combined render item function that includes both image and overlay
  const renderItem = ({ item }: { item: CarouselItem }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        {/* Darker overlay for better contrast */}
        <View style={styles.imageDimOverlay} />
        {/* Brand color overlay */}
        <View
          style={[
            styles.colorOverlay,
            {
              backgroundColor: OVERLAY_COLOR,
              opacity: OVERLAY_OPACITY,
            },
          ]}
        />
      </View>
    );
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Swipeable FlatList for the full screen - MAIN CONTAINER */}
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        bounces={false}
      />

      {/* UI Controls as a separate layer - NO POINTER EVENTS */}
      <View style={styles.controlsContainer} pointerEvents="box-none">
        {/* Skip button (on ALL slides) */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onComplete('user')}
          activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Text content with fade animation */}
        <View style={styles.textContentContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
            pointerEvents="none">
            <Text style={styles.title}>{carouselData[currentIndex].title}</Text>
            <Text style={styles.description}>{carouselData[currentIndex].description}</Text>
          </Animated.View>

          {/* Bottom controls container */}
          <View style={styles.bottomControls} pointerEvents="box-none">
            {/* Pagination dots */}
            <View style={styles.dotsContainer}>
              {carouselData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                  style={styles.dotTouchable}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          index === currentIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Next button */}
            {currentIndex === carouselData.length - 1 ? (
              <View className="flex w-full flex-row items-center justify-center gap-5 p-5 text-base font-normal">
                <TouchableOpacity
                  className="flex w-2/5 items-center justify-center rounded-2xl bg-[#678B83] px-2 py-5 shadow-md"
                  onPress={() => goToNextSlide({ userType: 'user' })}
                  activeOpacity={0.8}>
                  <Text className="text-base text-white">Continue as User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex w-2/5 items-center justify-center rounded-2xl bg-white px-2 py-5 shadow-md"
                  onPress={() => goToNextSlide({ userType: 'agent' })}
                  activeOpacity={0.8}>
                  <Text className="text-base text-[#678B83]">Continue as Agent</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center self-center rounded-3xl bg-white shadow-lg"
                onPress={() => goToNextSlide}
                activeOpacity={0.8}>
                <Text className="text-[20px] font-bold text-[#678B83]">→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker overlay for contrast
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Color and opacity are set dynamically
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // Important for pointer events
  },
  textContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  textContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
    lineHeight: 22,
  },
  bottomControls: {
    width: '100%',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dotTouchable: {
    padding: 8, // Larger touch target
    marginHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonIcon: {
    fontSize: 20,
    color: '#678B83',
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  skipText: {
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
});

export default OnboardingCarousel;
