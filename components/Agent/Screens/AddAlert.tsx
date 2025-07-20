import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';

// Components (these would be imported from your components folder)
import { ThemedText } from 'components/ThemedText';
import { BackArrow, CaretDown, UploadIcon } from 'components/Svg';
import LibraryDatePicker from '../UI/DatePicker';
import { useAppStore } from 'stores/useAppStore';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { generateStableGradientPair } from 'lib/helpers';

// Constants
const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use'];
const APARTMENT_TYPES = [
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  '5+ Bedroom',
  'Duplex',
  'Penthouse',
];
const BATHROOM_OPTIONS = ['1', '2', '3', '4', '5', '6+'];
const TENOR_OPTIONS = ['Monthly', 'Quarterly', 'Bi-Annual', 'Annual', '2 Years', '3 Years'];
const FACILITIES_OPTIONS = [
  'Swimming Pool',
  'Gym/Fitness Center',
  'Parking',
  'Security',
  '24/7 Power Supply',
  'Elevator',
  'Garden/Green Area',
  'Playground',
  'Internet/WiFi',
  'Air Conditioning',
  'Furnished',
  'Balcony',
  'Laundry Service',
  'Backup Generator',
  'CCTV Surveillance',
  'Gated Community',
  'Shopping Mall Nearby',
  'School Nearby',
  'Hospital Nearby',
  'Public Transport Access',
];

// Types
interface DropdownProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  width?: string | number;
}

interface FacilitiesMultiSelectProps {
  label: string;
  placeholder: string;
  selectedFacilities: string[];
  options: string[];
  onSelectionChange: (facilities: string[]) => void;
}

interface FormData {
  propertyOption: 'For Rent' | 'For Sale';
  location: string;
  propertyType: string;
  apartmentType: string;
  bathrooms: string;
  selectedFacilities: string[];
  price: string;
  tenor: string;
  availableDate: Date | null;
  description: string;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'AddAlert'>;

// Dropdown Component
const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  width = '100%',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (option: string) => {
      onSelect(option);
      setIsOpen(false);
    },
    [onSelect]
  );

  return (
    //@ts-ignore
    <View style={[styles.dropdownContainer, { width }]}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(true)}>
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <CaretDown />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}>
          <View style={styles.dropdownModal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownOption} onPress={() => handleSelect(item)}>
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Facilities Multi-Select Component
const FacilitiesMultiSelect: React.FC<FacilitiesMultiSelectProps> = ({
  label,
  placeholder,
  selectedFacilities,
  options,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleFacility = useCallback(
    (facility: string) => {
      const updatedFacilities = selectedFacilities.includes(facility)
        ? selectedFacilities.filter((f) => f !== facility)
        : [...selectedFacilities, facility];
      onSelectionChange(updatedFacilities);
    },
    [selectedFacilities, onSelectionChange]
  );

  const handleRemoveFacility = useCallback(
    (facility: string) => {
      const updatedFacilities = selectedFacilities.filter((f) => f !== facility);
      onSelectionChange(updatedFacilities);
    },
    [selectedFacilities, onSelectionChange]
  );

  const renderSelectedFacilities = useCallback(() => {
    if (selectedFacilities.length === 0) {
      return <Text style={styles.placeholderText}>{placeholder}</Text>;
    }

    return (
      <View style={styles.selectedFacilitiesContainer}>
        {selectedFacilities.map((facility) => (
          <View key={facility} style={styles.facilityTag}>
            <Text style={styles.facilityTagText}>{facility}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveFacility(facility)}
              style={styles.removeButton}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }, [selectedFacilities, placeholder, handleRemoveFacility]);

  return (
    <View style={styles.facilitiesContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity style={styles.facilitiesButton} onPress={() => setIsOpen(true)}>
        <View style={styles.facilitiesContent}>{renderSelectedFacilities()}</View>
        <CaretDown />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}>
          <View style={styles.facilitiesModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Facilities</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.facilitiesScrollView}>
              {options.map((facility) => {
                const isSelected = selectedFacilities.includes(facility);
                return (
                  <TouchableOpacity
                    key={facility}
                    style={[styles.facilityOption, isSelected && styles.selectedFacilityOption]}
                    onPress={() => handleToggleFacility(facility)}>
                    <Text
                      style={[
                        styles.facilityOptionText,
                        isSelected && styles.selectedFacilityOptionText,
                      ]}>
                      {facility}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Tab Button Component
const TabButton = React.memo(
  ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  )
);

// Main Component
const AddAlert = () => {
  const { user } = useAppStore();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'For Rent' | 'For Sale'>('For Rent');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    propertyOption: 'For Rent',
    location: '',
    propertyType: '',
    apartmentType: '',
    bathrooms: '',
    selectedFacilities: [],
    price: '',
    tenor: '',
    availableDate: null,
    description: '',
  });

  const tabs = ['For Rent', 'For Sale'] as const;

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const requiredFields = [
      'location',
      'propertyType',
      'apartmentType',
      'bathrooms',
      'price',
      'description',
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        Alert.alert(
          'Validation Error',
          `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
        return false;
      }
    }

    if (activeTab === 'For Rent' && !formData.tenor) {
      Alert.alert('Validation Error', 'Please select a tenor for rental properties');
      return false;
    }

    if (!formData.availableDate) {
      Alert.alert('Validation Error', 'Please select an available date');
      return false;
    }

    return true;
  }, [formData, activeTab]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      const submissionData = { ...formData, propertyOption: activeTab };
      console.log('Submitting property alert:', submissionData);
      setShowSuccessModal(true);
    }
  }, [formData, activeTab, validateForm]);

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <BackArrow />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Alert</Text>
          </View>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}>
        {/* Property Option Tabs */}
        <View style={styles.tabContainer}>
          <Text style={styles.sectionLabel}>Property Option</Text>
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              title={tab}
              isActive={activeTab === tab}
              onPress={() => {
                setActiveTab(tab);
                updateFormData({ propertyOption: tab });
              }}
            />
          ))}
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Location</Text>
          <TextInput
            placeholder="Find Location"
            placeholderTextColor="#9F9F9F"
            style={styles.textInput}
            value={formData.location}
            onChangeText={(text) => updateFormData({ location: text })}
          />
        </View>

        {/* Property Type Dropdown */}
        <Dropdown
          label="Property Type"
          placeholder="Select Property Type"
          value={formData.propertyType}
          options={PROPERTY_TYPES}
          onSelect={(value) => updateFormData({ propertyType: value })}
        />

        {/* Apartment Type Dropdown */}
        <Dropdown
          label="Apartment Type"
          placeholder="Select Apartment Type"
          value={formData.apartmentType}
          options={APARTMENT_TYPES}
          onSelect={(value) => updateFormData({ apartmentType: value })}
        />

        {/* Bathroom Dropdown */}
        <Dropdown
          label="Bathroom"
          placeholder="Select Number Of Bathrooms"
          value={formData.bathrooms}
          options={BATHROOM_OPTIONS}
          onSelect={(value) => updateFormData({ bathrooms: value })}
        />

        {/* Facilities Multi-Select */}
        <FacilitiesMultiSelect
          label="Available Facilities"
          placeholder="Select Available Facilities"
          selectedFacilities={formData.selectedFacilities}
          options={FACILITIES_OPTIONS}
          onSelectionChange={(facilities) => updateFormData({ selectedFacilities: facilities })}
        />

        {/* Price and Tenor */}
        <View style={styles.priceContainer}>
          <View
            style={[styles.inputContainer, { width: activeTab !== 'For Rent' ? '100%' : '70%' }]}>
            <Text style={styles.sectionLabel}>Price of Property</Text>
            <TextInput
              placeholder="NGN"
              placeholderTextColor="#9F9F9F"
              style={styles.textInput}
              value={formData.price}
              onChangeText={(text) => updateFormData({ price: text })}
              keyboardType="numeric"
            />
          </View>

          {activeTab === 'For Rent' && (
            <Dropdown
              label="Tenor"
              placeholder="Select Tenor"
              value={formData.tenor}
              options={TENOR_OPTIONS}
              onSelect={(value) => updateFormData({ tenor: value })}
              width="27%"
            />
          )}
        </View>

        {/* Available Date */}
        <LibraryDatePicker
          label="Available Date"
          placeholder="Select Date"
          selectedDate={formData.availableDate}
          onDateSelect={(date) => updateFormData({ availableDate: date })}
        />

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            multiline
            placeholder="Enter description of property"
            placeholderTextColor="#9F9F9F"
            style={styles.descriptionInput}
            value={formData.description}
            onChangeText={(text) => updateFormData({ description: text })}
          />
        </View>

        {/* Upload Images */}
        <TouchableOpacity style={styles.uploadContainer}>
          <Text style={styles.sectionLabel}>Upload Images</Text>
          <View style={styles.uploadIconContainer}>
            <UploadIcon />
          </View>
          <Text style={styles.uploadTitle}>Click to Upload</Text>
          <Text style={styles.uploadSubtitle}>SVG, PNG, JPG or GIF (max. 800x400px)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.addModalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require('../../../assets/animations/Log out.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>
            <Text style={styles.addModalTitle}>Alert added successfully!</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Close</Text>
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
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
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
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingTop: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: '#000',
    borderRadius: 14,
  },
  tabText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionLabel: {
    position: 'absolute',
    left: '5%',
    top: -8,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 5,
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingTop: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  textInput: {
    backgroundColor: 'transparent',
    height: 40,
    fontFamily: 'Bahnschrift',
    letterSpacing: 1.5,
    fontSize: 14,
    color: '#000',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingTop: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  descriptionInput: {
    backgroundColor: 'transparent',
    width: '100%',
    minHeight: 100,
    fontFamily: 'Bahnschrift',
    letterSpacing: 1.5,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#000',
  },
  uploadContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 25,
    paddingTop: 20,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 10,
  },
  uploadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
  },
  uploadTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
  },
  uploadSubtitle: {
    color: '#8C94A0',
    fontSize: 12,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  // Dropdown styles
  dropdownContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  dropdownLabel: {
    position: 'absolute',
    left: '5%',
    top: -8,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 5,
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 25,
  },
  dropdownText: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    color: '#9F9F9F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: 300,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
  },
  dropdownOptionText: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#000',
  },
  // Facilities styles
  facilitiesContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
    minHeight: 60,
  },
  facilitiesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 15,
    paddingTop: 20,
    minHeight: 40,
  },
  facilitiesContent: {
    flex: 1,
    marginRight: 10,
  },
  selectedFacilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  facilityTagText: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#000',
    marginRight: 4,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  facilitiesModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '70%',
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
  },
  modalTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  facilitiesScrollView: {
    maxHeight: 400,
  },
  facilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  selectedFacilityOption: {
    backgroundColor: '#f8f9fa',
  },
  facilityOptionText: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#000',
  },
  selectedFacilityOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  addModalOverlay: {
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
  lottieAnimation: {
    width: 80,
    height: 80,
  },
  addModalTitle: {
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

export default AddAlert;
