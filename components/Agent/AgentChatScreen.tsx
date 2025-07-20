// In your AgentChatScreen.tsx, update the navigation prop type and handleChatPress

import React, { useState } from 'react';
import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
// Import CompositeNavigationProp to handle nested navigation
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { FLOATING_BUTTON_SPACE } from './AgentHomeScreen';
import { formatUTCTo12Hour } from 'lib/helpers';

// Define your navigation types (add these to your types file)
type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  Chat: {
    chatId: string;
    // Add other params as needed
  };
  AddProperty: undefined;
  ViewProperty: undefined;
};

// Use CompositeNavigationProp to properly handle nested navigation
type ScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Chat'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Chat {
  id: string;
  name: string;
  preview: string;
  unread: boolean;
  unreadCount: string;
  createdAt: string;
}

const AgentChatScreen = () => {
  const navigation = useNavigation();
  const [showChats, setShowChats] = useState(true);

  const mockChats: Chat[] = [
    {
      id: '8',
      name: 'Divine Ajayi',
      preview:
        'The inspection can be scheduled for Thursday evening if you are available. Kindly let me know ahead to enable proper planning.',
      unread: true,
      unreadCount: '2',
      createdAt: '2025-07-20T15:21:00.000Z',
    },
    {
      id: '9',
      name: 'Anthony Obinna',
      preview: 'Kindly provide a working budget.',
      unread: false,
      unreadCount: '0',
      createdAt: '2025-07-20T10:59:00.000Z',
    },
  ];

  const chats = showChats ? mockChats : [];

  const handleChatPress = (chat: Chat) => {
    console.log('PRESSED');

    // Navigate to the Stack Navigator's Chat screen
    // Use getParent() to access the parent Stack Navigator
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate('Chat', {
        chatId: chat.id,
        // Add other params as needed
      });
    } else {
      // Fallback: try direct navigation (might work in some setups)
      navigation.navigate('Chat' as any, {
        chatId: chat.id,
      });
    }
  };

  // Rest of your component remains the same...
  const renderChatItem = ({ item }: { item: Chat }) => {
    return (
      <TouchableOpacity
        onPress={() => handleChatPress(item)}
        style={[styles.chatItem, item.unread && styles.unreadChatItem]}>
        <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />

        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.chatPreview}>
            {item.preview}
          </Text>
        </View>

        <View style={styles.chatMeta}>
          <Text style={styles.chatTime}>{formatUTCTo12Hour(item.createdAt)}</Text>
          {item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (chats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../../assets/animations/Chat.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.emptyTitle}>No Conversations Found</Text>
          <Text style={styles.emptySubtitle}>
            Chat history will be available when a conversation has been started by a user
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chatListContainer}>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
          contentInsetAdjustmentBehavior="never"
          ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>

          {/* Demo Toggle Button */}
          <TouchableOpacity onPress={() => setShowChats(!showChats)} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>{showChats ? 'Empty' : 'Fill'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </KeyboardAvoidingView>
  );
};

// Your existing styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
  },
  toggleButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  chatListContainer: {
    flex: 1,
    paddingTop: 16,
  },
  flatListContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderColor: '#BFBFBF',
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 2,
  },
  unreadChatItem: {
    backgroundColor: '#E6E6E6',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 14,
    padding: 1,
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
  },
  chatContent: {
    flex: 1,
    gap: 6,
  },
  chatName: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatPreview: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    fontWeight: '300',
    color: '#666',
    lineHeight: 18,
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  chatTime: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#000',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AgentChatScreen;
