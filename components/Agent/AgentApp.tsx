import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';
import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import AgentHomeScreen from './AgentHomeScreen';
import AgentChatScreen from './AgentChatScreen';
import AgentSettingsScreen from './AgentSettingsScreen';
// import { useAppStore } from 'stores/useAppStore';

// import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
// import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
// import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
// import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
// import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';

// import AgentChatScreen from './AgentChatScreen';
// import AgentHomeScreen from './AgentHomeScreen';
// import AgentSettingsScreen from './AgentSettingsScreen';

const AgentApp = () => {
  const { themeColors } = useAppStore();
  const Tab = createBottomTabNavigator();
  const windowWidth = Dimensions.get('window').width;
  // const tabBarWidth = windowWidth * 0.9;

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
            minWidth: 60, // Minimum width for each tab
            paddingHorizontal: 15,
            // width: tabBarWidth / 5,
          },
          
        })}
        // Use a custom tab bar to ensure proper spacing
        tabBar={(props) => <CustomTabBar {...props} />}>
        {/* tabBar={(props) => <CustomTabBar {...props} tabBarWidth={tabBarWidth} />}> */}
        <Tab.Screen name="Home" component={AgentHomeScreen} />
        {/* <Tab.Screen name="Bookmark" component={UserBookmarkScreen} /> */}
        {/* <Tab.Screen
          name="Search"
          component={UserSearchScreen}
          options={{
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        /> */}
        <Tab.Screen name="Chat" component={AgentChatScreen} />
        <Tab.Screen name="Settings" component={AgentSettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Custom tab bar component to ensure proper spacing
const CustomTabBar = ({ state, descriptors, navigation, tabBarWidth }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    // paddingBottom: 30,
    backgroundColor: 'transparent',
    width: '100%',
    alignItems: 'center', // Center the tab bar horizontally
  },
  tabBar: {
    // position: 'absolute',
    // bottom: 30,
    // left: '5%',
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
    alignSelf: 'center',
    paddingHorizontal: 30,
    width: '70%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: 10,
    height: '100%',
    // backgroundColor: 'red',
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

export default AgentApp;
