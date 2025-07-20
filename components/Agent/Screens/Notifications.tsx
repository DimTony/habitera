import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  FlatList,
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

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Notifications'>;

interface NotificationItem {
  id: string;
  type: 'message' | 'approval';
  title: string;
  description: string;
  time: string;
  date: string;
  isNew?: boolean;
}

const Notifications = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [showNotifications, setShowNotifications] = useState(true);

  const mockNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      description: 'You have a new message from a user - Divine Ajayi - regarding your listing.',
      time: '11:01 A.M',
      date: '23 Jan 2025',
      isNew: true,
    },
    {
      id: '2',
      type: 'approval',
      title: 'Listing Approved',
      description: 'Your listing has been reviewed and approved for listing on Habitera.',
      time: '10:31 A.M',
      date: '23 Jan 2025',
      isNew: true,
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'You have a new message from a user - Divine Ajayi - regarding your listing.',
      time: '10:01 A.M',
      date: '23 Jan 2025',
      isNew: true,
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      description: 'You have a new message from a user - Divine Ajayi - regarding your listing.',
      time: '12:30 P.M',
      date: '22 Jan 2025',
    },
    {
      id: '5',
      type: 'approval',
      title: 'Listing Approved',
      description: 'Your listing has been reviewed and approved for listing on Habitera.',
      time: '12:00 P.M',
      date: '22 Jan 2025',
    },
  ];

  const notifications = showNotifications ? mockNotifications : [];

  const groupNotificationsByDate = (notifications: NotificationItem[]) => {
    const grouped: { [key: string]: NotificationItem[] } = {};
    notifications.forEach((notification) => {
      if (!grouped[notification.date]) {
        grouped[notification.date] = [];
      }
      grouped[notification.date].push(notification);
    });
    return grouped;
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {item.isNew && <View style={styles.newIndicator} />}
          </View>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateSection = (date: string, items: NotificationItem[]) => (
    <View key={date} style={styles.dateSection}>
      <Text style={styles.dateHeader}>{date}</Text>
      {items.map((item) => (
        <View key={item.id}>
          {renderNotificationItem({ item })}
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../../../assets/animations/Empty notification.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.emptyTitle}>Stay Up-to-date</Text>
          <Text style={styles.emptySubtitle}>Set up alerts for when my properties are viewed</Text>
        </View>
      );
    }

    const groupedNotifications = groupNotificationsByDate(notifications);
    const sections = Object.entries(groupedNotifications).map(([date, items]) =>
      renderDateSection(date, items)
    );

    return (
      <FlatList
        data={sections}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => item}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
        contentInsetAdjustmentBehavior="never"
        ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
      />
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            onPress={() => setShowNotifications(!showNotifications)}
            style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>{showNotifications ? 'Empty' : 'Fill'}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 20,
    paddingTop: 60,
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
    fontSize: 18,
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
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  flatListContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 20,
    marginTop: 8,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 0,
    overflow: 'hidden',
  },
  notificationContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Bahnschrift',
    color: '#666',
    fontWeight: '400',
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    color: '#666',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default Notifications;