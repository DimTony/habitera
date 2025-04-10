import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LandingScreen = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const fadeAnim1 = useState(new Animated.Value(1))[0];
  const fadeAnim2 = useState(new Animated.Value(0))[0];
  const [activeImage, setActiveImage] = useState(1); // 1 or 2
  const router = useRouter();

  // Sample image URLs (replace with your actual image URLs)
  // For React Native, you should use require for local images or full URLs for remote images
  const images = [
    require("../assets/images/image1.png"), // Replace with your actual image paths
    require("../assets/images/image2.png"),
    require("../assets/images/image3.png"),
  ];

  // Individual text for each image
  const imageTexts = [
    {
      title: "Start Your Journey to the Perfect Home",
      description:
        "Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.",
    },
    {
      title: "House-hunting Simplified",
      description:
        "Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.",
    },
    {
      title: "Smarter Searches, Better Homes",
      description:
        "Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.",
    },
  ];

  // Handle the cross-fade transition effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newNextImageIndex = (currentImageIndex + 1) % images.length;
      setNextImageIndex(newNextImageIndex);

      if (activeImage === 1) {
        // Fade out image 1, fade in image 2
        Animated.parallel([
          Animated.timing(fadeAnim1, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentImageIndex(newNextImageIndex);
          setActiveImage(2);
        });
      } else {
        // Fade out image 2, fade in image 1
        Animated.parallel([
          Animated.timing(fadeAnim2, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim1, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentImageIndex(newNextImageIndex);
          setActiveImage(1);
        });
      }
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [currentImageIndex, activeImage]);

  const navigateToOnboarding = () => {
    router.push("/onboarding");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Image carousel container */}
      <View style={styles.carouselContainer}>
        {/* Two animated views for cross-fading */}
        <Animated.View
          style={[
            styles.imageContainer,
            { opacity: fadeAnim1, position: "absolute" },
          ]}
        >
          <Image
            source={
              images[activeImage === 1 ? currentImageIndex : nextImageIndex]
            }
            style={styles.image}
            resizeMode="cover"
          />

          {/* Overlay with text */}
          <View style={styles.overlay}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {
                  imageTexts[
                    activeImage === 1 ? currentImageIndex : nextImageIndex
                  ].title
                }
              </Text>
              <Text style={styles.description}>
                {
                  imageTexts[
                    activeImage === 1 ? currentImageIndex : nextImageIndex
                  ].description
                }
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.imageContainer,
            { opacity: fadeAnim2, position: "absolute" },
          ]}
        >
          <Image
            source={
              images[activeImage === 2 ? currentImageIndex : nextImageIndex]
            }
            style={styles.image}
            resizeMode="cover"
          />

          {/* Overlay with text */}
          <View style={styles.overlay}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {
                  imageTexts[
                    activeImage === 2 ? currentImageIndex : nextImageIndex
                  ].title
                }
              </Text>
              <Text style={styles.description}>
                {
                  imageTexts[
                    activeImage === 2 ? currentImageIndex : nextImageIndex
                  ].description
                }
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={navigateToOnboarding}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View> */}

        {/* Image indicator dots with arrow button */}
        <View style={styles.bottomControlsContainer}>
          <View style={styles.indicatorContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index
                    ? styles.activeIndicator
                    : styles.inactiveIndicator,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={navigateToOnboarding}
          >
            <AntDesign name="arrowright" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    //   paddingBottom: 100
  },
  carouselContainer: {
    height: height, // Full screen height
    width: width,
    position: "relative",
  },
  imageContainer: {
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 200,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 400,
    color: "white",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Bahnschrift",
  },
  description: {
    fontWeight: 300,
    fontSize: 12,
    color: "white",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "Bahnschrift",
    lineHeight: 18,
    letterSpacing: 0
  },
  bottomControlsContainer: {
    position: "absolute",
    bottom: 64,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  inactiveIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  arrowButton: {
    backgroundColor: "#ffffff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonContainer: {
    position: "absolute",
    top: "50%",
    width: "100%",
    alignItems: "center",
    paddingVertical: 24,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LandingScreen;
