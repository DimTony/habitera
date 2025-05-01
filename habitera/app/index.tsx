import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const LandingScreen = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeAnim1] = useState(new Animated.Value(1));
  const [fadeAnim2] = useState(new Animated.Value(0));
  const [activeImage, setActiveImage] = useState(1); // 1 or 2
  const router = useRouter();

  // Sample image URLs (replace with your actual image URLs)
  const images = [
    require("../assets/images/image1.png"),
    require("../assets/images/image2.png"),
    require("../assets/images/image3.png"),
    require("../assets/images/image4.png"), // Added fourth image
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
    {
      title: "Your Dream Home, Your Trusted Partner",
      description:
        "Continue as a user looking for your dream home or as an agent helping others find theirs. Your Habitera journey begins now.",
    },
  ];

  // Handle manual image transition
  const goToNextImage = () => {
    const nextImageIndex = (currentImageIndex + 1) % images.length;

    if (activeImage === 1) {
      // Fade out image 1, fade in image 2
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex(nextImageIndex);
        setActiveImage(2);
      });
    } else {
      // Fade out image 2, fade in image 1
      Animated.parallel([
        Animated.timing(fadeAnim2, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex(nextImageIndex);
        setActiveImage(1);
      });
    }
  };

  // Skip to the last image (4th image)
  const skipToLastImage = () => {
    const lastImageIndex = images.length - 1;

    if (activeImage === 1) {
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex(lastImageIndex);
        setActiveImage(2);
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex(lastImageIndex);
        setActiveImage(1);
      });
    }
  };

  const navigateAsUser = () => {
    router.push("/onboarding?role=user");
  };

  const navigateAsAgent = () => {
    router.push("/onboarding?role=agent");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Skip button */}
      {currentImageIndex < 3 && (
        <TouchableOpacity style={styles.skipButton} onPress={skipToLastImage}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

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
              images[
                activeImage === 1
                  ? currentImageIndex
                  : (currentImageIndex + 1) % images.length
              ]
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
                    activeImage === 1
                      ? currentImageIndex
                      : (currentImageIndex + 1) % images.length
                  ].title
                }
              </Text>
              <Text style={styles.description}>
                {
                  imageTexts[
                    activeImage === 1
                      ? currentImageIndex
                      : (currentImageIndex + 1) % images.length
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
              images[
                activeImage === 2
                  ? currentImageIndex
                  : (currentImageIndex + 1) % images.length
              ]
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
                    activeImage === 2
                      ? currentImageIndex
                      : (currentImageIndex + 1) % images.length
                  ].title
                }
              </Text>
              <Text style={styles.description}>
                {
                  imageTexts[
                    activeImage === 2
                      ? currentImageIndex
                      : (currentImageIndex + 1) % images.length
                  ].description
                }
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Image indicator dots with arrow button or action buttons */}
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

          {/* Show either the arrow button or the action buttons based on current image */}
          {currentImageIndex < 3 ? (
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={goToNextImage}
            >
              <AntDesign name="arrowright" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtonsContainer}>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.primaryButtonContainer}
                  onPress={navigateAsUser}
                >
                  <LinearGradient
                    colors={["#678B83", "#475C57"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>
                      Continue as user
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={navigateAsAgent}
                >
                  <Text style={styles.secondaryButtonText}>
                    Continue as agent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  carouselContainer: {
    height: height,
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
    fontWeight: "400",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Bahnschrift",
  },
  description: {
    fontWeight: "300",
    fontSize: 12,
    color: "white",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "Bahnschrift",
    lineHeight: 18,
    letterSpacing: 0,
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
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    width: "80%",
    marginTop: 8,
    alignItems: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  primaryButtonContainer: {
    flex: 1,
    marginRight: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Bahnschrift",
  },
  secondaryButton: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#678B83",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Bahnschrift",
  },
});

export default LandingScreen;
