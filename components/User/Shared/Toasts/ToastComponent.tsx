import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedStore } from '@/stores/useUnifiedStore';

const { width } = Dimensions.get('window');
const TOAST_HEIGHT = 50;
const TOAST_MARGIN = 8;
const ICON_SIZE = 40;
const FULL_WIDTH = width * 0.50; // Reduced width - 75% of screen

export const ToastComponent: React.FC = () => {
  const { toasts, hideToast } = useUnifiedStore();

  if (toasts.length === 0) {
    return null;
  }

  const toast = toasts[0]; // Get the first toast
  const index = 0; // Since we're only showing one toast at a time

  const scaleXAnim = useRef(new Animated.Value(ICON_SIZE / FULL_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Icon appears with scale animation (faster)
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Step 2: Toast expands horizontally using scaleX (faster)
      Animated.parallel([
        Animated.timing(scaleXAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 3: Text fades in (faster)
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleHideToast = () => {
    // Reverse animation (faster)
    Animated.sequence([
      Animated.timing(textOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scaleXAnim, {
          toValue: ICON_SIZE / FULL_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast(toasts[0].id);
    });
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#2196F3',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const topOffset = Platform.OS === 'ios' 
    ? (StatusBar.currentHeight || 44) + 20 + (index * (TOAST_HEIGHT + TOAST_MARGIN))
    : (StatusBar.currentHeight || 24) + 20 + (index * (TOAST_HEIGHT + TOAST_MARGIN));

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          top: topOffset,
          width: FULL_WIDTH,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { scaleX: scaleXAnim }
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getIcon()} 
            size={20} 
            color="white"
          />
        </View>
        
        <Animated.View style={[styles.textContainer, { opacity: textOpacityAnim }]}>
          <Text style={styles.message} numberOfLines={1}>
            {toast.message}
          </Text>
          
          {toast.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toast.action.onPress}
            >
              <Text style={styles.actionText}>{toast.action.label}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        
        <Animated.View style={[styles.closeButtonContainer, { opacity: textOpacityAnim }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleHideToast}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: TOAST_HEIGHT,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    alignSelf: 'center',
    left: (width - FULL_WIDTH) / 2, // Center the toast properly
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: ICON_SIZE - 8,
    height: ICON_SIZE - 8,
    borderRadius: (ICON_SIZE - 8) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  closeButtonContainer: {
    marginRight: 4,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToastComponent;