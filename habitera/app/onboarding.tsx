import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const OnboardingScreen = () => {
  const router = useRouter();

  // Single image for onboarding
  const image = require("../assets/images/image2.png"); // Use one of your existing images

  // Text for the onboarding screen
  const text = {
    title: "Your Dream Home, Your Trusted Partner",
    description:
      "Finding your dream home is the first step to a new beginning. Whether you seek comfort, style, or space, that dream place is waiting for you on Habitera.",
  };

  const navigateAsUser = () => {
    // Navigate to user flow
    router.push("/(tabs)"); // Change to your actual user route
  };

  const navigateAsAgent = () => {
    // Navigate to agent flow
    router.push("/(tabs)/two"); // Change to your actual agent route
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Single image container */}
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />

        {/* Overlay with text */}
        <View style={styles.overlay}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{text.title}</Text>
            <Text style={styles.description}>{text.description}</Text>
          </View>
        </View>

        {/* Two side-by-side buttons */}
        <View style={styles.buttonsContainer}>
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
              <Text style={styles.primaryButtonText}>Continue as user</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={navigateAsAgent}
          >
            <Text style={styles.secondaryButtonText}>Continue as agent</Text>
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
  },
  imageContainer: {
    height: height,
    width: width,
    position: "relative",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  textContainer: {
    position: "absolute",
    bottom: "24%",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
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
    textAlign: "center",
    fontFamily: "Bahnschrift",
    lineHeight: 18,
    letterSpacing: 0,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
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
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Bahnschrift",
  },
});

export default OnboardingScreen;
