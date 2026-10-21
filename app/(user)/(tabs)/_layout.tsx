import BookmarkFilledIcon from 'components/Icons/TabIcons/BookmarkFilledIcon';
import BookmarkOutlineIcon from 'components/Icons/TabIcons/BookmarkOutlineIcon';
import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';
import MapSearchIcon from 'components/Icons/TabIcons/MapSearchIcon';
import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
import { Tabs } from 'expo-router/js-tabs';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from 'stores/useAppStore';

const windowWidth = Dimensions.get('window').width;
const tabBarWidth = windowWidth * 0.9;

export default function UserTabsLayout() {
  const { themeColors } = useAppStore();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors?.primaryColor || '#678B83',
        tabBarInactiveTintColor: '#404040',
        tabBarIcon: ({ focused }) => {
          const iconSize = 20;

          if (route.name === 'index') {
            return focused ? (
              <HomeFilledIcon width={iconSize} height={iconSize} />
            ) : (
              <HomeOutlineIcon width={iconSize} height={iconSize} />
            );
          }
          if (route.name === 'bookmark') {
            return focused ? (
              <BookmarkFilledIcon width={iconSize} height={iconSize} />
            ) : (
              <BookmarkOutlineIcon width={iconSize} height={iconSize} />
            );
          }
          if (route.name === 'search') {
            return null;
          }
          if (route.name === 'chat') {
            return focused ? (
              <ChatFilledIcon width={iconSize} height={iconSize} />
            ) : (
              <ChatOutlineIcon width={iconSize} height={iconSize} />
            );
          }
          if (route.name === 'settings') {
            return focused ? (
              <SettingsIconFilled width={iconSize} height={iconSize} />
            ) : (
              <SettingsIcon width={iconSize} height={iconSize} />
            );
          }
          return null;
        },
      })}
      tabBar={(props) => <UserTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bookmark" options={{ title: 'Bookmark' }} />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarButton: (props) => (
            <SearchTabButton
              accessibilityState={props.accessibilityState}
              onPress={props.onPress}
            />
          ),
        }}
      />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

function UserTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={[styles.tabBar, { width: tabBarWidth }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.title ?? route.name;

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

        if (route.name === 'search') {
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
                  color: isFocused ? options.tabBarActiveTintColor : options.tabBarInactiveTintColor,
                },
              ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SearchTabButton({
  accessibilityState,
  onPress,
}: {
  accessibilityState?: { selected?: boolean };
  onPress?: any;
}) {
  const focused = accessibilityState?.selected;
  const iconSize = 25;

  return (
    <View style={styles.customButtonContainer}>
      <View style={styles.customButtonOuter}>
        <TouchableOpacity style={styles.customButton} onPress={onPress}>
          <MapSearchIcon
            width={iconSize}
            height={iconSize}
            primaryColor={focused ? '#fff' : '#404040'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 2 },
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
});