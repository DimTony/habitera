// AnimatedSplash.tsx
import LogoIcon from 'components/Icons/Logo';
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

// const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
  onFinish?: () => void;
}

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onFinish }) => {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textPosition = useRef(new Animated.Value(-50)).current; // Start offscreen
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    const sequence = Animated.sequence([
      // Step 1: Fade in the logo
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // Step 2: Slight pause
      Animated.delay(300),

      // Step 3: Parallel animations for text slide in
      Animated.parallel([
        // Animate text position from -50 to 0
        Animated.timing(textPosition, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),

        // Fade in the text
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Step 4: Pause before finishing
      Animated.delay(1000),
    ]);

    // Start the animation sequence
    sequence.start(() => {
      if (onFinish) {
        onFinish();
      }
    });

    return () => {
      // Clean up animations if component unmounts
      sequence.stop();
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-[#5f8179]">
      <View className="flex-row items-center">
        <Animated.View style={{ opacity: logoOpacity }}>
          <LogoIcon width={32} height={33} fill="#FFFFFF" />
        </Animated.View>

        <Animated.View
          style={{
            marginLeft: 8,
            opacity: textOpacity,
            transform: [{ translateX: textPosition }],
          }}>
          <Animated.Text className="text-2xl font-medium text-white">Habitera</Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default AnimatedSplash;
