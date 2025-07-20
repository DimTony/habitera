import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { FLOATING_BUTTON_SPACE } from '../AgentHomeScreen';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Profile'>;

const AlertSettings = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [showAlerts, setShowAlerts] = useState(true);

  const mockAlerts: any[] = [
    {
      id: '1',
    },
  ];

  const alerts = showAlerts ? mockAlerts : [];

  const renderChatItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
      // onPress={() => handleChatPress(item)}
      // style={[styles.chatItem, item.unread && styles.unreadChatItem]}
      >
        <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />

        {/* <View style={styles.chatContent}>
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
          </View> */}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (alerts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../../../assets/animations/Empty notification.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.emptyTitle}>Stay Up-to-date</Text>
          <Text style={styles.emptySubtitle}>
            Set up alerts for when properties that meet your catalog are searched
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chatListContainer}>
        <FlatList
          data={alerts}
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alert Settings</Text>

          <TouchableOpacity onPress={() => setShowAlerts(!showAlerts)} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>{showAlerts ? 'Empty' : 'Fill'}</Text>
          </TouchableOpacity>
        </View>
      </View>

            <View style={styles.content}>{renderContent()}</View>
      
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
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 14,
    padding: 1,
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
  },
  flatListContent: {
    flexGrow: 1,
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
});

export default AlertSettings;
