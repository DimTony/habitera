import { useStore } from "@/store/store";
import React, { useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

const LoadingScreen = () => {
  const { loading } = useStore();
  // Use useRef to maintain Animated values across renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  // Store the animation loop in a ref so we can stop it properly
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Only start animation when loading is true
    if (loading) {
      // Reset animations to initial values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Define the pulse animation
      const pulseAnimation = Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]);

      // Store and start the animation
      animationRef.current = Animated.loop(pulseAnimation);
      animationRef.current.start();
    }

    // Cleanup function to stop animation when component unmounts or loading changes
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      animationRef.current = null;
    };
  }, [loading, fadeAnim, scaleAnim]); // Include loading in dependencies to restart animation when it changes

  // Don't render anything if not loading
  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.bigFlower}
          resizeMode="contain"
        /> */}
        <Animated.Image
          source={require("../assets/images/splash-icon.png")}
          style={[
            styles.smallFlower,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
        {/* Only show ActivityIndicator as fallback if needed - hidden by default */}
        {false && (
          <ActivityIndicator
            size="large"
            color="#D6FFA1"
            style={styles.activityIndicator}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 9999,
    elevation: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#002400",
    alignItems: "center",
    justifyContent: "center",
  },
  bigFlower: {
    position: "absolute",
    width: width * 0.8,
    height: height * 0.8,
    opacity: 0.1,
  },
  smallFlower: {
    width: 120,
    height: 120,
    tintColor: "#D6FFA1",
  },
  activityIndicator: {
    position: "absolute",
  },
});

export default LoadingScreen;
