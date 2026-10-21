import { BackArrow } from 'components/Svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getErrorMessage } from 'lib/api/errors';
import { getPropertyById, updateProperty } from 'lib/api/properties';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToastStore } from 'stores/useToastStore';

const EditProperty = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToastStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  const loadProperty = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getPropertyById(id);
      if (!result.success || !result.data) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to load listing.',
        });
        router.back();
        return;
      }

      const dto = result.data;
      setTitle(dto.title ?? '');
      setDescription(dto.description ?? '');
      setPrice(String(dto.price ?? ''));
      setBedrooms(String(dto.bedrooms ?? ''));
      setBathrooms(String(dto.bathrooms ?? ''));
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load listing.'),
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router, showToast]);

  useEffect(() => {
    void loadProperty();
  }, [loadProperty]);

  const handleSave = async () => {
    if (!id) return;

    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Title, description, and price are required.');
      return;
    }

    const parsedPrice = Number(String(price).replace(/,/g, ''));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateProperty(id, {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
      });

      if (!result.success) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to update listing.',
        });
        return;
      }

      showToast({
        type: 'success',
        message:
          result.message ||
          'Listing updated and submitted for review.',
      });
      router.replace(`/(agent)/property/${id}`);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to update listing.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BackArrow />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Listing</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.notice}>
            Saving changes will move this listing back under review until it is approved again.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Property title"
              placeholderTextColor="#9F9F9F"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.half]}>
              <Text style={styles.sectionLabel}>Bedrooms</Text>
              <TextInput
                style={styles.textInput}
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#9F9F9F"
              />
            </View>
            <View style={[styles.inputContainer, styles.half]}>
              <Text style={styles.sectionLabel}>Bathrooms</Text>
              <TextInput
                style={styles.textInput}
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9F9F9F"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionLabel}>Price (NGN)</Text>
            <TextInput
              style={styles.textInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9F9F9F"
            />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Enter description of property"
              placeholderTextColor="#9F9F9F"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, isSaving && styles.disabledButton]}
            onPress={() => router.back()}
            disabled={isSaving}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
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
  },
  scrollContentContainer: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  notice: {
    fontFamily: 'Bahnschrift',
    fontSize: 13,
    color: '#666',
    backgroundColor: '#FFF8E8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  half: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    zIndex: 1,
  },
  textInput: {
    paddingTop: 22,
    paddingBottom: 18,
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#000',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
    minHeight: 140,
  },
  descriptionInput: {
    paddingTop: 22,
    paddingBottom: 18,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#000',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  cancelButton: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#000',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    width: '48%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EditProperty;
