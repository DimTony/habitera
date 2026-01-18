import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity } from 'react-native';
import { useUnifiedStore } from '../stores/useUnifiedStore';

// Auth Screens
import Login from '../components/Auth/Login';
import SignUp from '../components/Auth/SignUp';
import AgentSignUp from '../components/Auth/AgentSignUp';
import ForgotPassword from '../components/Auth/ForgotPassword';
import EmailOTP from '../components/Auth/EmailOTP';

// User Screens
import UserHomeScreen from '../components/User/UserHomeScreen';
import UserBookmarkScreen from '../components/User/UserBookmarkScreen';
import UserSearchScreen from '../components/User/UserSearchScreen';
import UserChatScreen from '../components/User/UserChatScreen';
import UserSettingsScreen from '../components/User/UserSettingsScreen';
import PropertyDetailsScreen from '../components/User/Screens/PropertyDetailsScreen';
import ChangePasswordScreen from '../components/User/Screens/ChangePasswordScreen';
import ProfileScreen from '../components/User/Screens/ProfileScreen';
import FilterModal from '../components/User/Modals/FilterModal';

// Agent Screens
import AgentHomeScreen from '../components/Agent/AgentHomeScreen';
import AgentChatScreen from '../components/Agent/AgentChatScreen';
import AgentSettingsScreen from '../components/Agent/AgentSettingsScreen';
import AddProperty from '../components/Agent/Screens/AddProperty';
import ViewProperty from '../components/Agent/Screens/ViewProperty';
import ChatScreen from '../components/Agent/Screens/Chat';
import Notifications from '../components/Agent/Screens/Notifications';
import Profile from '../components/Agent/Screens/Profile';
import AlertSettings from '../components/Agent/Screens/AlertSettings';
import ChangePassword from '../components/Agent/Screens/ChangePassword';
import AboutUs from '../components/Agent/Screens/AboutUs';
import CustomerSupport from '../components/Agent/Screens/CustomerSupport';
import AddAlert from '../components/Agent/Screens/AddAlert';
import EditAlert from '../components/Agent/Screens/EditAlert';

// Icons
import BookmarkFilledIcon from '../components/Icons/TabIcons/BookmarkFilledIcon';
import BookmarkOutlineIcon from '../components/Icons/TabIcons/BookmarkOutlineIcon';
import ChatFilledIcon from '../components/Icons/TabIcons/ChatFilledIcon';
import ChatOutlineIcon from '../components/Icons/TabIcons/ChatOutlineIcon';
import HomeFilledIcon from '../components/Icons/TabIcons/HomeFilledIcon';
import HomeOutlineIcon from '../components/Icons/TabIcons/HomeOutlineIcon';
import MapSearchIcon from '../components/Icons/TabIcons/MapSearchIcon';
import SettingsIconFilled from '../components/Icons/TabIcons/SettingsIconFilled';
import SettingsIconOutline from '../components/Icons/TabIcons/SettingsIconOutline';

// Types
export type RootStackParamList = {
  Auth: undefined;
  UserTabs: undefined;
  AgentTabs: undefined;
  PropertyDetails: {
    propertyId: string;
    propertyName: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    imageSource: any;
    images: string[];
  };
  ChangePassword: undefined;
  Profile: undefined;
  FilterModal: undefined;
  AddProperty: undefined;
  ViewProperty: { propertyId: string };
  Chat: { chatId: string };
  Notifications: undefined;
  AlertSettings: undefined;
  AboutUs: undefined;
  CustomerSupport: undefined;
  AddAlert: undefined;
  EditAlert: { alertId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  AgentSignup: undefined;
  ForgotPassword: undefined;
  EmailOTP: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  Bookmark: undefined;
  Search: undefined;
  Chat: undefined;
  Settings: undefined;
};

export type AgentTabParamList = {
  'My Properties': undefined;
  Chat: undefined;
  Settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();
const AgentTab = createBottomTabNavigator<AgentTabParamList>();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    initialRouteName="Login"
    screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={Login} />
    <AuthStack.Screen name="Signup" component={SignUp} />
    <AuthStack.Screen name="AgentSignup" component={AgentSignUp} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
    <AuthStack.Screen name="EmailOTP" component={EmailOTP} />
  </AuthStack.Navigator>
);

// User Tab Navigator
const UserTabNavigator = () => {
  const { themeColors } = useUnifiedStore();

  return (
    <UserTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 30,
          right: '5%',
          elevation: 5,
          backgroundColor: '#fff',
          borderRadius: 15,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          borderTopWidth: 0,
          width: '90%',
          alignSelf: 'center',
          paddingBottom: 6,
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 20;
          switch (route.name) {
            case 'Home':
              return focused ? (
                <HomeFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <HomeOutlineIcon width={iconSize} height={iconSize} />
              );
            case 'Bookmark':
              return focused ? (
                <BookmarkFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <BookmarkOutlineIcon width={iconSize} height={iconSize} />
              );
            case 'Search':
              return null;
            case 'Chat':
              return focused ? (
                <ChatFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <ChatOutlineIcon width={iconSize} height={iconSize} />
              );
            case 'Settings':
              return focused ? (
                <SettingsIconFilled width={iconSize} height={iconSize} />
              ) : (
                <SettingsIconOutline width={iconSize} height={iconSize} />
              );
            default:
              return null;
          }
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
        },
      })}>
      <UserTab.Screen name="Home" component={UserHomeScreen} />
      <UserTab.Screen name="Bookmark" component={UserBookmarkScreen} />
      <UserTab.Screen
        name="Search"
        component={UserSearchScreen}
        options={{
          tabBarButton: (props) => (
            <View style={styles.customButtonContainer}>
              <View style={styles.customButtonOuter}>
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: '#678B83' }]}
                  onPress={props.onPress}>
                  <MapSearchIcon width={25} height={25} primaryColor="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ),
        }}
      />
      <UserTab.Screen name="Chat" component={UserChatScreen} />
      <UserTab.Screen name="Settings" component={UserSettingsScreen} />
    </UserTab.Navigator>
  );
};

// Agent Tab Navigator
const AgentTabNavigator = () => {
  const { themeColors } = useUnifiedStore();

  return (
    <AgentTab.Navigator
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
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          borderTopWidth: 0,
          width: '90%',
          alignSelf: 'center',
          paddingBottom: 6,
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 20;
          switch (route.name) {
            case 'My Properties':
              return focused ? (
                <HomeFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <HomeOutlineIcon width={iconSize} height={iconSize} />
              );
            case 'Chat':
              return focused ? (
                <ChatFilledIcon width={iconSize} height={iconSize} />
              ) : (
                <ChatOutlineIcon width={iconSize} height={iconSize} />
              );
            case 'Settings':
              return focused ? (
                <SettingsIconFilled width={iconSize} height={iconSize} />
              ) : (
                <SettingsIconOutline width={iconSize} height={iconSize} />
              );
            default:
              return null;
          }
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
      })}>
      <AgentTab.Screen name="My Properties" component={AgentHomeScreen} />
      <AgentTab.Screen name="Chat" component={AgentChatScreen} />
      <AgentTab.Screen name="Settings" component={AgentSettingsScreen} />
    </AgentTab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, userType } = useUnifiedStore();
  
  console.log('AppNavigator render state:', { isAuthenticated, userType });

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === 'user' ? (
          <>
            <RootStack.Screen name="UserTabs" component={UserTabNavigator} />
            <RootStack.Screen
              name="PropertyDetails"
              component={PropertyDetailsScreen}
              options={{ presentation: 'modal' }}
            />
            <RootStack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <RootStack.Screen name="Profile" component={ProfileScreen} />
            <RootStack.Screen
              name="FilterModal"
              component={FilterModal}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="AgentTabs" component={AgentTabNavigator} />
            <RootStack.Screen name="AddProperty" component={AddProperty} />
            <RootStack.Screen name="ViewProperty" component={ViewProperty} />
            <RootStack.Screen name="Chat" component={ChatScreen} />
            <RootStack.Screen name="Notifications" component={Notifications} />
            <RootStack.Screen name="Profile" component={Profile} />
            <RootStack.Screen name="AlertSettings" component={AlertSettings} />
            <RootStack.Screen name="ChangePassword" component={ChangePassword} />
            <RootStack.Screen name="AboutUs" component={AboutUs} />
            <RootStack.Screen name="CustomerSupport" component={CustomerSupport} />
            <RootStack.Screen name="AddAlert" component={AddAlert} />
            <RootStack.Screen name="EditAlert" component={EditAlert} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = {
  customButtonContainer: {
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    height: 60,
  },
  customButtonOuter: {
    position: 'absolute' as const,
    top: -32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

export default AppNavigator;
