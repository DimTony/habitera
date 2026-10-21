import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  ImageSourcePropType,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    image: require('../../assets/images/onboarding-1.jpg'),
    title: 'Start Your Journey to the Perfect Home',
    description:
      'Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.',
  },
  {
    id: '2',
    image: require('../../assets/images/onboarding-2.jpg'),
    title: 'House-hunting Simplified',
    description:
      'Explore a curated selection of properties that match your lifestyle and preferences.',
  },
  {
    id: '3',
    image: require('../../assets/images/onboarding-3.jpg'),
    title: 'Smarter Searches, Better Homes',
    description: 'Schedule viewings and make inquiries with just a few taps.',
  },
  {
    id: '4',
    image: require('../../assets/images/onboarding-4.jpg'),
    title: 'Your Dream Home, Your Trusted Partner',
    description: 'Get personalized assistance from our network of professional real estate agents.',
  },
];

const OVERLAY_COLOR = '#678B83';
const OVERLAY_OPACITY = 0.5;

function preloadOnboardingImages() {
  carouselData.forEach((item) => {
    const resolved = Image.resolveAssetSource(item.image);
    if (resolved?.uri) {
      Image.prefetch(resolved.uri);
    }
  });
}

preloadOnboardingImages();

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      return;
    }

    let cancelled = false;
    const fadeOut = Animated.parallel([
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
    ]);

    fadeOut.start(({ finished }) => {
      if (!finished || cancelled) return;
      textTranslateY.setValue(-20);
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

    return () => {
      cancelled = true;
      fadeOut.stop();
    };
  }, [currentIndex, textOpacity, textTranslateY]);

  const goToNextSlide = (userType?: 'user' | 'agent') => {
    if (currentIndex === carouselData.length - 1) {
      if (userType) onComplete(userType);
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPageSize((current) =>
      current.width === width && current.height === height ? current : { width, height }
    );
  };

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (nextIndex != null) {
        setCurrentIndex(nextIndex);
      }
    }
  ).current;

  const renderItem = ({ item }: { item: CarouselItem }) => {
    return (
      <View style={[styles.slide, { width: pageSize.width, height: pageSize.height }]}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
          progressiveRenderingEnabled
        />
        <View style={styles.imageDimOverlay} />
        <View style={styles.colorOverlay} />
      </View>
    );
  };

  const isLastSlide = currentIndex === carouselData.length - 1;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {pageSize.width > 0 && (
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
          bounces={false}
          overScrollMode="never"
          initialNumToRender={carouselData.length}
          maxToRenderPerBatch={carouselData.length}
          windowSize={carouselData.length}
          removeClippedSubviews={false}
          getItemLayout={(_, index) => ({
            length: pageSize.width,
            offset: pageSize.width * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }}
          extraData={pageSize}
        />
      )}

      <View style={styles.controlsContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 8 }]}
          onPress={() => onComplete('user')}
          activeOpacity={0.7}
          hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View
          style={[styles.textContentContainer, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
          pointerEvents="box-none">
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

          <View style={styles.bottomControls} pointerEvents="box-none">
            <View style={styles.dotsContainer}>
              {carouselData.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                  style={styles.dotTouchable}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to slide ${index + 1}`}>
                  <View
                    style={[
                      styles.dot,
                      index === currentIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {isLastSlide ? (
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.choiceButton, styles.choiceButtonUser]}
                  onPress={() => goToNextSlide('user')}
                  activeOpacity={0.8}>
                  <Text style={styles.choiceLabelLight}>Continue as User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceButton, styles.choiceButtonAgent]}
                  onPress={() => goToNextSlide('agent')}
                  activeOpacity={0.8}>
                  <Text style={styles.choiceLabelDark}>Continue as Agent</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => goToNextSlide()}
                activeOpacity={0.8}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Next">
                <FontAwesome name="arrow-right" size={18} color={OVERLAY_COLOR} />
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
    backgroundColor: OVERLAY_COLOR,
  },
  slide: {
    backgroundColor: OVERLAY_COLOR,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  colorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY_COLOR,
    opacity: OVERLAY_OPACITY,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFill,
  },
  textContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
      default: {},
    }),
  },
  description: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      default: {},
    }),
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
    padding: 8,
    marginHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 6,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    paddingHorizontal: 20,
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },
  choiceButtonUser: {
    backgroundColor: OVERLAY_COLOR,
  },
  choiceButtonAgent: {
    backgroundColor: '#FFFFFF',
  },
  choiceLabelLight: {
    color: '#FFFFFF',
    fontFamily: 'Bahnschrift',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  choiceLabelDark: {
    color: OVERLAY_COLOR,
    fontFamily: 'Bahnschrift',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  skipButton: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 10,
  },
  skipText: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    includeFontPadding: false,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      default: {},
    }),
  },
});

export default OnboardingCarousel;
