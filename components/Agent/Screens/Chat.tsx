import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
  Keyboard,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { formatUTCTo12Hour } from 'lib/helpers';
import Feather from '@expo/vector-icons/Feather';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
}

const ChatScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const mockMessages: Message[] = [
    {
      id: '1',
      text: "Hi.\nGood evening. I'd like to have an inspection.",
      timestamp: '2025-07-20T22:12:00.000Z',
      isFromUser: true,
    },
    {
      id: '2',
      text: 'I will be able to come to the house probably tomorrow if I get off work early. Is that fine?',
      timestamp: '2025-07-20T22:13:00.000Z',
      isFromUser: true,
    },
    {
      id: '3',
      text: 'Hello. Good evening.',
      timestamp: '2025-07-20T22:14:00.000Z',
      isFromUser: false,
    },
    {
      id: '4',
      text: 'The inspection can happen on thursday evening, if you are available. Just let me know so we can plan ahead',
      timestamp: '2025-07-20T22:15:00.000Z',
      isFromUser: false,
    },
    {
      id: '5',
      text: "Hi.\nGood evening. I'd like to have an inspection.",
      timestamp: '2025-07-20T22:16:00.000Z',
      isFromUser: true,
    },
    {
      id: '6',
      text: 'I will be able to come to the house probably tomorrow if I get off work early. Is that fine?',
      timestamp: '2025-07-20T22:17:00.000Z',
      isFromUser: true,
    },
    {
      id: '7',
      text: 'Hello. Good evening.',
      timestamp: '2025-07-20T22:18:00.000Z',
      isFromUser: false,
    },
    {
      id: '8',
      text: 'The inspection can happen on thursday evening, if you are available. Just let me know so we can plan ahead',
      timestamp: '2025-07-20T22:19:00.000Z',
      isFromUser: false,
    },
    {
      id: '9',
      text: "Hi.\nGood evening. I'd like to have an inspection.",
      timestamp: '2025-07-20T22:20:00.000Z',
      isFromUser: true,
    },
  ];

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Scroll to bottom when keyboard opens
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isFromUser ? styles.userMessageContainer : styles.agentMessageContainer,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.isFromUser ? styles.userMessageBubble : styles.agentMessageBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            item.isFromUser ? styles.userMessageText : styles.agentMessageText,
          ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.messageTime}>{formatUTCTo12Hour(item.timestamp)}</Text>
    </View>
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message logic here
      setMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      {/* Agent Info */}
      <View style={styles.agentInfo}>
        <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
        <Text style={styles.agentName}>Divine Ajayi</Text>
      </View>

      {/* Messages Container */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={mockMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 50 + (keyboardHeight > 0 ? 20 : 0) }, // Dynamic padding
          ]}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content changes
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />
      </View>

      {/* Input Area - Now relative positioned */}
      <View style={[styles.inputContainer, { marginBottom: keyboardHeight > 0 ? 10 : 5 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    alignItems: 'center'
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
  },
  agentInfo: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    padding: 1,
    borderColor: '#e6e6e6',
    borderWidth: 0.5,
  },
  agentName: {
    fontWeight: '600',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#1a1a1a',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  agentMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  userMessageBubble: {
    backgroundColor: '#E6E6E6',
    borderBottomRightRadius: 4,
  },
  agentMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
  },
  messageText: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#000',
  },
  agentMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontFamily: 'Bahnschrift',
    fontSize: 11,
    color: '#999',
    marginHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    // backgroundColor: 'rgba(248, 249, 250, 0.99)',
    // backgroundColor: 'red',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: -2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#1a1a1a',
    maxHeight: 100,
    paddingVertical: 8,
    fontWeight: '300',
  },
  sendButton: {
    backgroundColor: '#1a1a1a',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
