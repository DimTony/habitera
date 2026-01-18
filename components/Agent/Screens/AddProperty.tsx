import { ThemedText } from 'components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { generateStableGradientPair, getInitials } from 'lib/helpers';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text } from 'react-native';
import { View } from 'react-native';
import { useUnifiedStore } from '@/stores/useUnifiedStore';
import { useNavigation } from '@react-navigation/native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { BackArrow, CaretDown, Edit, MailIcon, PhoneIncoming, UploadIcon } from 'components/Svg';
import LibraryDatePicker from '../UI/DatePicker';
import { Platform } from 'react-native';
import { navigate } from 'expo-router/build/global-state/routing';
import { useRouter } from 'expo-router';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';

const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use'];

const apartmentTypes = [
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  '5+ Bedroom',
  'Duplex',
  'Penthouse',
];

const bathroomOptions = ['1', '2', '3', '4', '5', '6+'];

const tenorOptions = ['Monthly', 'Quarterly', 'Bi-Annual', 'Annual', '2 Years', '3 Years'];

// Available facilities options
const facilitiesOptions = [
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

interface DropdownProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  width?: string | number;
}

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
        <Text
          style={[
            styles.dropdownText,
            !value && styles.placeholderText,
            label === 'Tenor' && styles.placeholderTenorSize,
          ]}>
          {value || placeholder}
        </Text>
        {label !== 'Tenor' && <CaretDown />}
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

interface FacilitiesMultiSelectProps {
  label: string;
  placeholder: string;
  selectedFacilities: string[];
  options: string[];
  onSelectionChange: (facilities: string[]) => void;
}

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

type HomeScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'AddProperty'>;

const AddProperty = () => {
  const { auth } = useUnifiedStore();
  const [activeTab, setActiveTab] = useState<'For Rent' | 'For Sale'>('For Rent');
  const navigation = useNavigation<HomeScreenNavigationProp>();

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

  const gradientColors = useMemo(() => {
    return generateStableGradientPair(auth?.user?.id ?? auth?.user?.id ?? '');
  }, [auth?.user?.id, auth?.user?.id]);

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

  const handleSaveForLater = useCallback(() => {
    // Save draft functionality
    console.log('Saving draft:', formData);
    Alert.alert('Success', 'Property saved as draft');
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      const submissionData = {
        ...formData,
        propertyOption: activeTab,
      };
      console.log('Submitting property:', submissionData);
      Alert.alert('Success', 'Property submitted successfully');
    }
  }, [formData, activeTab, validateForm]);

  const TabButton = React.memo(
    ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={onPress}>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
      </TouchableOpacity>
    )
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <BackArrow />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Add a Property</Text>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}>
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

          <View style={styles.inputContainer}>
            <Text style={styles.sectionLabel}>Location</Text>
            <TextInput
              placeholder="Find Location"
              placeholderTextColor="#9F9F9F"
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
            />
          </View>

          <Dropdown
            label="Property Type"
            placeholder="Select Property Type"
            value={formData.propertyType}
            options={propertyTypes}
            onSelect={(value) => updateFormData({ propertyType: value })}
          />

          <Dropdown
            label="Apartment Type"
            placeholder="Select Apartment Type"
            value={formData.apartmentType}
            options={apartmentTypes}
            onSelect={(value) => updateFormData({ apartmentType: value })}
          />

          <Dropdown
            label="Bathroom"
            placeholder="Select Number Of Bathrooms"
            value={formData.bathrooms}
            options={bathroomOptions}
            onSelect={(value) => updateFormData({ bathrooms: value })}
          />

          <FacilitiesMultiSelect
            label="Available Facilities"
            placeholder="Select Available Facilities"
            selectedFacilities={formData.selectedFacilities}
            options={facilitiesOptions}
            onSelectionChange={(facilities) => updateFormData({ selectedFacilities: facilities })}
          />

          <View style={styles.priceContainer}>
            {/* <View
              style={[
                styles.priceInputContainer,
                { width: activeTab !== 'For Rent' ? '100%' : '70%' },
              ]}>
              <Text style={styles.sectionLabel}>Price of Property</Text>
              <TextInput
                placeholder="NGN"
                placeholderTextColor="#9F9F9F"
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => updateFormData({ price: text })}
                keyboardType="numeric"
              />
            </View> */}
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
                options={tenorOptions}
                onSelect={(value) => updateFormData({ tenor: value })}
                width="27%"
              />
            )}
          </View>

          <LibraryDatePicker
            label="Available Date"
            placeholder="Select Date"
            selectedDate={formData.availableDate}
            onDateSelect={(date) => updateFormData({ availableDate: date })}
          />

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

          <TouchableOpacity style={styles.uploadContainer}>
            <Text style={styles.sectionLabel}>Upload Images</Text>

            <View style={styles.uploadIconContainer}>
              <UploadIcon />
            </View>

            <Text style={styles.uploadTitle}>Click to Upload</Text>
            <Text style={styles.uploadSubtitle}>SVG, PNG, JPG or GIF (max. 800x400px)</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveForLater}>
            <Text style={styles.saveButtonText}>Save For Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
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
    // width: '100%',
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
  priceInputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    position: 'relative',
    width: '70%',
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
  saveButton: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  saveButtonText: {
    color: '#000',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    width: '48%',
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
  placeholderTenorSize: {
    fontSize: 12,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  // Facilities Multi-Select styles
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});

export default AddProperty;
