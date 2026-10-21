import ChatFilledIcon from 'components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from 'components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from 'components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from 'components/Icons/TabIcons/HomeOutlineIcon';
import SettingsIconFilled from 'components/Icons/TabIcons/SettingsIconFilled';
import SettingsIcon from 'components/Icons/TabIcons/SettingsIconOutline';
import { Tabs } from 'expo-router/js-tabs';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';

export default function AgentTabsLayout() {
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
      tabBar={(props) => <AgentTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'My Properties' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

function AgentTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;
  const maxTabBarWidth = windowWidth - 40;
  const tabBarWidth = Math.min(windowWidth * 0.7, maxTabBarWidth);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: Math.max(insets.bottom + 10, 30),
          paddingHorizontal: Math.max(insets.left, insets.right, 20),
        },
      ]}>
      <View style={[styles.tabBar, { width: tabBarWidth, maxWidth: maxTabBarWidth }]}>
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
                      ? options.tabBarActiveTintColor
                      : options.tabBarInactiveTintColor,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

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
    shadowOffset: { width: 0, height: 1 },
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
});
