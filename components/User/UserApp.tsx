import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import BookmarkFilledIcon from 'components/Icons/TabIcons/BookmarkFilledIcon';
import BookmarkOutlineIcon from 'components/Icons/TabIcons/BookmarkOutlineIcon';
import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';
import MapSearchIcon from 'components/Icons/TabIcons/MapSearchIcon';
import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

import UserBookmarkScreen from './UserBookmarkScreen';
import UserChatScreen from './UserChatScreen';
import UserHomeScreen from './UserHomeScreen';
import UserSearchScreen from './UserSearchScreen';
import UserSettingsScreen from './UserSettingsScreen';

const UserApp = () => {
  const { themeColors } = useAppStore();
  const Tab = createBottomTabNavigator();
  const windowWidth = Dimensions.get('window').width;
  const tabBarWidth = windowWidth * 0.9; // 90% of screen width

  return (
    <NavigationContainer>
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

            if (route.name === 'Home') {
              return focused ? (
                <HomeFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <HomeOutlineIcon width={iconSize} height={iconSize} />
              );
            } else if (route.name === 'Bookmark') {
              return focused ? (
                <BookmarkFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <BookmarkOutlineIcon width={iconSize} height={iconSize} />
              );
            } else if (route.name === 'Search') {
              // We'll return null here as we'll handle this in a custom tab bar button
              return null;
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
            // Set a fixed width for each tab to ensure proper spacing
            width: tabBarWidth / 5,
          },
        })}
        // Use a custom tab bar to ensure proper spacing
        tabBar={(props) => <CustomTabBar {...props} tabBarWidth={tabBarWidth} />}>
        <Tab.Screen name="Home" component={UserHomeScreen} />
        <Tab.Screen name="Bookmark" component={UserBookmarkScreen} />
        <Tab.Screen
          name="Search"
          component={UserSearchScreen}
          options={{
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />
        <Tab.Screen name="Chat" component={UserChatScreen} />
        <Tab.Screen name="Settings" component={UserSettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Custom tab bar component to ensure proper spacing
const CustomTabBar = ({ state, descriptors, navigation, tabBarWidth }: any) => {
  return (
    <View style={[styles.tabBar, { width: tabBarWidth }]}>
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

        // Use the custom tab bar button for Search tab
        if (route.name === 'Search') {
          return (
            <View key={route.key} style={[styles.tabItem, { width: tabBarWidth / 5 }]}>
              {options.tabBarButton
                ? options.tabBarButton({
                    accessibilityState: { selected: isFocused },
                    onPress,
                  })
                : null}
            </View>
          );
        }

        // Regular tab items
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            onPress={onPress}
            style={[styles.tabItem, { width: tabBarWidth / 5 }]}>
            {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused }) : null}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? descriptors[route.key].options.tabBarActiveTintColor
                    : descriptors[route.key].options.tabBarInactiveTintColor,
                },
              ]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const CustomTabBarButton = (props: BottomTabBarButtonProps) => {
  const { accessibilityState, onPress } = props;
  const focused = accessibilityState?.selected;
  const iconSize = 25;

  return (
    <View style={styles.customButtonContainer}>
      <View style={styles.customButtonOuter}>
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: focused ? '#678B83' : '#678B83' }]}
          onPress={onPress}>
          <MapSearchIcon
            width={iconSize}
            height={iconSize}
            primaryColor={focused ? '#fff' : '#404040'}
          />
        </TouchableOpacity>
      </View>
      {/* <Text style={[styles.customButtonLabel, { color: focused ? '#678B83' : '#404040' }]}>
        Search
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: '5%',
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
    flexDirection: 'row',
    alignSelf: 'center',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
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

export default UserApp;
