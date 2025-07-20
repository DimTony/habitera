import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';
import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

// Tab Screens
import AgentHomeScreen from './AgentHomeScreen';
import AgentChatScreen from './AgentChatScreen';
import AgentSettingsScreen from './AgentSettingsScreen';
import PropertyItem from './UI/PropertyItem';
import AddProperty from './Screens/AddProperty';
import ViewProperty from './Screens/ViewProperty';
import ChatScreen from './Screens/Chat';
import Notifications from './Screens/Notifications';
import Profile from './Screens/Profile';
import AlertSettings from './Screens/AlertSettings';
import ChangePassword from './Screens/ChangePassword';
import AboutUs from './Screens/AboutUs';
import CustomerSupport from './Screens/CustomerSupport';

// Non-Tab Screens (Stack Screens)
// import LoginScreen from './LoginScreen';
// import OnboardingScreen from './OnboardingScreen';
// import ProfileDetailScreen from './ProfileDetailScreen';
// import ChatDetailScreen from './ChatDetailScreen';
// import NotificationScreen from './NotificationScreen';
// import EditProfileScreen from './EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator Component
const TabNavigator = () => {
  const { themeColors } = useAppStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: '5%',
          right: '5%',
          elevation: 5,
          backgroundColor: '#fff',
          borderRadius: 15,
          height: 60,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          borderTopWidth: 0,
          width: '90%',
          alignSelf: 'center',
          paddingBottom: 6,
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 20;

          if (route.name === 'My Properties') {
            return focused ? (
              <HomeFilledIcon width={iconSize} height={iconSize} />
            ) : (
              <HomeOutlineIcon width={iconSize} height={iconSize} />
            );
          } else if (route.name === 'Chat') {
            return focused ? (
              <ChatFilledIcon width={iconSize} height={iconSize} />
            ) : (
              <ChatOutlineIcon width={iconSize} height={iconSize} />
            );
          } else if (route.name === 'Settings') {
            return focused ? (
              <SettingsIconFilled width={iconSize} height={iconSize} />
            ) : (
              <SettingsIcon width={iconSize} height={iconSize} />
            );
          }
          return null;
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: themeColors?.primaryColor || '#678B83',
        tabBarInactiveTintColor: '#404040',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
          paddingTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 10,
          height: '100%',
          minWidth: 60,
          paddingHorizontal: 15,
        },
      })}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="My Properties" component={AgentHomeScreen} />
      <Tab.Screen name="Chat" component={AgentChatScreen} />
      <Tab.Screen name="Settings" component={AgentSettingsScreen} />
    </Tab.Navigator>
  );
};

// Main App Component with Stack Navigator
const AgentApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide headers by default
          animation: 'slide_from_right', // Default animation
        }}>
        {/* <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        /> */}

        {/* Main Tab Navigator */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />

        {/* Detail/Modal Screens */}
        {/* <Stack.Screen
          name="ProfileDetail"
          component={ProfileDetailScreen}
          options={{
            headerShown: true,
            title: 'Profile Details',
            presentation: 'modal', // Presents as modal on iOS
          }}
        /> */}

        {/* <Stack.Screen
          name="ChatDetail"
          component={ChatDetailScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params?.chatName || 'Chat',
            headerBackTitleVisible: false,
          })}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: true,
            title: 'Edit Profile',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{
            headerShown: true,
            title: 'Notifications',
          }}
        /> */}

        {/* Auth Screens */}
        <Stack.Screen
          name="AddProperty"
          component={AddProperty}
          options={{
            headerShown: false,
            gestureEnabled: false, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="ViewProperty"
          component={ViewProperty}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="AlertSettings"
          component={AlertSettings}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="AboutUs"
          component={AboutUs}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        <Stack.Screen
          name="CustomerSupport"
          component={CustomerSupport}
          options={{
            headerShown: false,
            gestureEnabled: true, // Disable swipe back on login
          }}
        />

        {/* Add more stack screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Custom tab bar component with safe area support
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;

  // Calculate safe tab bar width (ensure it doesn't exceed screen bounds)
  const maxTabBarWidth = windowWidth - 40; // 20px margin on each side
  const preferredWidth = windowWidth * 0.7; // 70% of screen width
  const tabBarWidth = Math.min(preferredWidth, maxTabBarWidth);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: Math.max(insets.bottom + 10, 30), // Respect safe area bottom
          paddingHorizontal: Math.max(insets.left, insets.right, 20), // Respect side safe areas
        },
      ]}>
      <View
        style={[
          styles.tabBar,
          {
            width: tabBarWidth,
            maxWidth: maxTabBarWidth,
          },
        ]}>
        {state.routes.map((route: any, index: any) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Handle special Search tab if it exists
          if (route.name === 'Search') {
            return (
              <View key={route.key} style={[styles.tabItem, { flex: 1 }]}>
                {options.tabBarButton
                  ? options.tabBarButton({
                      accessibilityState: { selected: isFocused },
                      onPress,
                    })
                  : null}
              </View>
            );
          }

          // Regular tab items with flexible width
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              style={[styles.tabItem, { flex: 1 }]}>
              {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused }) : null}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused
                      ? descriptors[route.key].options.tabBarActiveTintColor
                      : descriptors[route.key].options.tabBarInactiveTintColor,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabBar: {
    elevation: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    paddingHorizontal: 20,
    minWidth: 200,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  customButtonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60,
  },
  customButtonOuter: {
    position: 'absolute',
    top: -32,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  customButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#678B83',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonLabel: {
    fontSize: 10,
    fontWeight: '500',
    position: 'absolute',
    bottom: 6,
  },
});

export default AgentApp;
