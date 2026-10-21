import { Ionicons } from '@expo/vector-icons';
import { suggestLocations } from 'lib/api/locations';
import { getErrorMessage } from 'lib/api/errors';
import type { LocationSuggestion } from 'lib/api/types';
import { getDeviceLocationSuggestion } from 'lib/location/device';
import { loadRecentLocations } from 'lib/location/preference';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';

type Props = {
  visible: boolean;
  selected?: LocationSuggestion | null;
  onClose: () => void;
  onSelect: (location: LocationSuggestion) => void;
};

const LocationPickerModal: React.FC<Props> = ({ visible, selected, onClose, onSelect }) => {
  const insets = useSafeAreaInsets();
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingDevice, setIsResolvingDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSuggestions([]);
      setError(null);
      setIsSearching(false);
      setIsResolvingDevice(false);
      return;
    }

    let active = true;
    (async () => {
      const recent = await loadRecentLocations();
      if (active) setRecentLocations(recent);
    })();

    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const result = await suggestLocations(trimmed, 8);
        if (currentRequest !== requestId.current) return;
        if (!result.success) {
          setSuggestions([]);
          setError(result.message || 'Unable to search locations.');
          return;
        }
        setSuggestions(result.data ?? []);
      } catch (err) {
        if (currentRequest !== requestId.current) return;
        setSuggestions([]);
        setError(getErrorMessage(err, 'Unable to search locations.'));
      } finally {
        if (currentRequest === requestId.current) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, visible]);

  const handleUseCurrentLocation = async () => {
    if (isResolvingDevice) return;
    setIsResolvingDevice(true);
    try {
      const device = await getDeviceLocationSuggestion();
      if (!device) {
        showToast({
          type: 'error',
          message: 'Location permission is required to use your current location.',
        });
        return;
      }
      onSelect(device);
    } catch {
      showToast({
        type: 'error',
        message: 'Unable to get your current location. Try again.',
      });
    } finally {
      setIsResolvingDevice(false);
    }
  };

  const isSearchingMode = query.trim().length >= 2;

  const renderLocationRow = (item: LocationSuggestion, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onSelect(item)}
      activeOpacity={0.75}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={themeColors.primaryColor} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel} numberOfLines={2}>
          {item.label}
        </Text>
        {[item.city, item.state, item.country].filter(Boolean).length > 0 ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {[item.city, item.state, item.country].filter(Boolean).join(', ')}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Choose location</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search city, area, or neighborhood"
            placeholderTextColor="#999"
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#BBB" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.currentLocationRow, { borderColor: themeColors.primaryColor }]}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
          disabled={isResolvingDevice}>
          <View style={[styles.currentLocationIcon, { backgroundColor: themeColors.primaryColor }]}>
            {isResolvingDevice ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="navigate" size={16} color="#fff" />
            )}
          </View>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowLabel, { color: themeColors.primaryColor }]}>
              Use current location
            </Text>
            <Text style={styles.rowMeta}>Detect from your device GPS</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={themeColors.primaryColor} />
        </TouchableOpacity>

        {selected ? (
          <View style={styles.selectedChip}>
            <Ionicons name="checkmark-circle" size={16} color="#6B6B6B" />
            <Text style={styles.selectedChipText} numberOfLines={1}>
              Selected: {selected.label}
            </Text>
          </View>
        ) : null}

        {isSearchingMode ? (
          isSearching ? (
            <View style={styles.centered}>
              <ActivityIndicator color={themeColors.primaryColor} />
            </View>
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : suggestions.length === 0 ? (
            <Text style={styles.message}>No locations found. Try a different search.</Text>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => `suggest-${item.id}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.list}
              renderItem={({ item }) => renderLocationRow(item, 'location-outline')}
            />
          )
        ) : recentLocations.length > 0 ? (
          <FlatList
            data={recentLocations}
            keyExtractor={(item, index) => `recent-${item.id}-${index}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Recent</Text>}
            renderItem={({ item }) => renderLocationRow(item, 'time-outline')}
          />
        ) : (
          <Text style={styles.message}>
            Type at least 2 characters to search locations. Recent picks will show up here.
          </Text>
        )}
      </View>
    </Modal>
  );
};

export default LocationPickerModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#F7FAF8',
  },
  currentLocationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  selectedChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  centered: {
    paddingTop: 40,
    alignItems: 'center',
  },
  message: {
    marginTop: 28,
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#888',
  },
});
