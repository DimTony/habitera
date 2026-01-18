import {
  BackArrow,
  BathIcon,
  BedIcon,
  LocationPin,
  NoticeIcon,
  RedTrashIcon,
  ThickEditIcon,
} from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
  const [showTrashModal, setShowTrashModal] = useState(false);

  const mockAlerts = [{ id: '1' }];
  const alerts = showAlerts ? mockAlerts : [];

  const handleTrashPress = () => setShowTrashModal(true);
  const handleConfirmDelete = () => setShowTrashModal(false);
  const handleCancelDelete = () => setShowTrashModal(false);

  const renderAlertItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.alertItem}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.alertName}>Clement</Text>
          <View style={styles.propertyDetails}>
            <View style={styles.detailItem}>
              <BedIcon />
              <Text style={styles.detailText}>2</Text>
            </View>
            <View style={styles.detailItem}>
              <BathIcon />
              <Text style={styles.detailText}>2</Text>
            </View>
          </View>
        </View>
        <NoticeIcon />
      </View>

      <View style={styles.locationContainer}>
        <LocationPin />
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.locationText}>
          19. Adeniran Ogunsanya Street, Surulere, Lagos
        </Text>
      </View>

      <View style={styles.alertFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>#600,000 / year</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}
          onPress={() => navigation.navigate('EditAlert')}
          
          >
            <ThickEditIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleTrashPress}>
            <RedTrashIcon />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.emptySubtitle}>Set up alerts for when my properties are viewed</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddAlert')}>
            <Text style={styles.addButtonText}>Add Alert</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.alertsList}>
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
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

      {alerts.length !== 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAlert')}
          style={styles.floatingButton}>
          <AntDesign name="plus-circle" size={50} color="black" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showTrashModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require('../../../assets/animations/Delete.json')}
                autoPlay
                loop
                style={styles.modalLottie}
              />
            </View>
            <Text style={styles.modalTitle}>Are you sure you want to delete this alert?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleConfirmDelete}>
                <Text style={styles.deleteButtonText}>Yes, Delete alert</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDelete}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
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
    marginBottom: 24,
  },
  addButton: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  // Alerts list styles
  alertsList: {
    flex: 1,
    paddingTop: 16,
  },
  flatListContent: {
    flexGrow: 1,
  },
  alertItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
    borderRadius: 18,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertInfo: {
    gap: 8,
  },
  alertName: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 11,
    color: '#818181',
    fontFamily: 'Bahnschrift',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 4,
  },
  locationText: {
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    fontSize: 12,
    color: '#818181',
    flexShrink: 1,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainer: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: 'Bahnschrift',
  },
  priceValue: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Floating button
  floatingButton: {
    position: 'absolute',
    bottom: '15%',
    right: '6%',
  },
  // Modal styles (smaller scale)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalLottie: {
    width: 60,
    height: 60,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#F93030',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Bahnschrift',
  },
});

export default AlertSettings;
