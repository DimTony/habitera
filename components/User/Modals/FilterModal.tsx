import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { RootStackParamList } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FilterModal'>;

const FilterScreen: React.FC = () => {
  const navigation = useNavigation<FilterScreenNavigationProp>();
  const { themeColors } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<'rent' | 'sale'>('rent');
  const [selectedApartmentType, setSelectedApartmentType] = useState<string>('Storey');
  const [selectedBedrooms, setSelectedBedrooms] = useState<number>(3);
  const [selectedBathrooms, setSelectedBathrooms] = useState<number>(4);
  const [priceRange, setPriceRange] = useState<[number, number]>([750, 1800]);

  const apartmentTypes = ['Bungalow', 'Storey', 'Duplex'];
  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5, 6];

  const handleClose = (): void => {
    navigation.goBack();
  };

  const handleSaveFilter = (): void => {
    const filters = {
      category: selectedCategory,
      apartmentType: selectedApartmentType,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,
      priceRange,
    };
    console.log('Saved filters:', filters);
    navigation.goBack();
  };

  // Mock chart data for the price range visualization
  const chartBars = [
    { height: 20, active: false },
    { height: 35, active: false },
    { height: 45, active: true },
    { height: 60, active: true },
    { height: 75, active: true },
    { height: 85, active: true },
    { height: 70, active: true },
    { height: 55, active: true },
    { height: 40, active: false },
    { height: 65, active: true },
    { height: 80, active: true },
    { height: 45, active: true },
    { height: 30, active: false },
    { height: 25, active: false },
    { height: 15, active: false },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Toggle */}
        <View style={styles.section}>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'rent' && {
                  backgroundColor: themeColors?.primaryColor || '#6B9B76',
                },
              ]}
              onPress={() => setSelectedCategory('rent')}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === 'rent' && styles.categoryButtonTextActive,
                ]}>
                For Rent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'sale' && {
                  backgroundColor: themeColors?.primaryColor || '#6B9B76',
                },
              ]}
              onPress={() => setSelectedCategory('sale')}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === 'sale' && styles.categoryButtonTextActive,
                ]}>
                For Sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price range</Text>

          {/* Chart Visualization */}
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {chartBars.map((bar, index) => (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: bar.height,
                        backgroundColor: bar.active ? themeColors.primaryColor : '#E0E0E0',
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Price Labels */}
          </View>
          <View style={styles.priceLabels}>
            <Text style={styles.priceLabel}>#750k</Text>
            <Text style={styles.priceLabel}>#1.8m</Text>
          </View>
        </View>

        {/* Apartment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apartment Type</Text>
          <View style={styles.optionsRow}>
            {apartmentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  selectedApartmentType === type && {
                    backgroundColor: themeColors?.primaryColor || '#6B9B76',
                  },
                ]}
                onPress={() => setSelectedApartmentType(type)}>
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedApartmentType === type && styles.optionButtonTextActive,
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bedroom */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedroom</Text>
          <View style={styles.numbersGrid}>
            {bedroomOptions.map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.numberButton,
                  selectedBedrooms === number && {
                    backgroundColor: themeColors?.primaryColor || '#6B9B76',
                  },
                ]}
                onPress={() => setSelectedBedrooms(number)}>
                <Text
                  style={[
                    styles.numberButtonText,
                    selectedBedrooms === number && styles.numberButtonTextActive,
                  ]}>
                  {number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bathroom */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bathroom</Text>
          <View style={styles.numbersGrid}>
            {bathroomOptions.map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.numberButton,
                  selectedBathrooms === number && {
                    backgroundColor: themeColors?.primaryColor || '#6B9B76',
                  },
                ]}
                onPress={() => setSelectedBathrooms(number)}>
                <Text
                  style={[
                    styles.numberButtonText,
                    selectedBathrooms === number && styles.numberButtonTextActive,
                  ]}>
                  {number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Filter Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: themeColors?.primaryColor || '#6B9B76' }]}
          onPress={handleSaveFilter}>
          <Text style={styles.saveButtonText}>Save Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
  },
  categoryButtonActive: {
    // backgroundColor: themeColors?.primaryColor || '#6B9B76',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 1,
    width: '50%',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  optionButtonActive: {},
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  numberButton: {
    width: (SCREEN_WIDTH - 80) / 6, // 6 buttons per row with gaps
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonActive: {},
  numberButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  numberButtonTextActive: {
    color: '#fff',
  },
  bottomSpacing: {
    height: 20,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilterScreen;
