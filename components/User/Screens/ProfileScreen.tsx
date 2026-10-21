import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import { AVATAR_PRESETS, resolveAvatarSource } from 'lib/avatars';
import { getErrorMessage } from 'lib/api/errors';
import {
  getMyProfile,
  updateProfilePhoto,
  updateUserProfile,
  uploadProfilePhoto,
} from 'lib/api/profile';
import { syncLocalUser } from 'lib/auth/session';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { useToastStore } from 'stores/useToastStore';
import * as Yup from 'yup';

import EditableInput from '../Shared/EditableInput';
import TabsLayout from '../TabsLayout';

const AVATAR_SIZE = 400;

const validationSchema = Yup.object().shape({
  firstName: Yup.string().trim().required('First name is required'),
  lastName: Yup.string().trim().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().nullable(),
  city: Yup.string().trim().required('City is required'),
  state: Yup.string().trim().required('State is required'),
  country: Yup.string().trim().required('Country is required'),
});

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
};

const emptyValues: ProfileFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  city: '',
  state: '',
  country: '',
};

const ProfileScreen = () => {
  const { themeColors, user } = useAppStore();
  const { showToast } = useToastStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const formik = useFormik<ProfileFormValues>({
    initialValues: emptyValues,
    validationSchema,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        let lat = latitude;
        let lng = longitude;

        if (!lat && !lng) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const current = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            lat = current.coords.latitude;
            lng = current.coords.longitude;
            setLatitude(lat);
            setLongitude(lng);
          }
        }

        const result = await updateUserProfile({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          country: values.country.trim(),
          latitude: lat,
          longitude: lng,
          phoneNumber: values.phoneNumber.trim() || undefined,
          preferredLanguage: 'en',
        });

        if (!result.success || !result.data) {
          showToast({
            type: 'error',
            message: result.message || 'Unable to update profile.',
          });
          return;
        }

        const nextValues: ProfileFormValues = {
          firstName: result.data.firstName ?? '',
          lastName: result.data.lastName ?? '',
          email: result.data.email ?? values.email,
          phoneNumber: result.data.phoneNumber ?? '',
          city: result.data.city ?? '',
          state: result.data.state ?? '',
          country: result.data.country ?? '',
        };

        await syncLocalUser(result.data);
        setCompletionPercentage(result.data.completionPercentage ?? 0);
        helpers.resetForm({ values: nextValues });
        setIsEditing(false);
        showToast({
          type: 'success',
          message: result.message || 'Profile updated successfully.',
        });
      } catch (error) {
        showToast({
          type: 'error',
          message: getErrorMessage(error, 'Unable to update profile.'),
        });
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    dirty,
    isSubmitting,
    resetForm,
    setFieldTouched,
  } = formik;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        const result = await getMyProfile();
        if (!active) return;

        if (!result.success || !result.data) {
          showToast({
            type: 'error',
            message: result.message || 'Unable to load profile.',
          });
          return;
        }

        const profile = result.data;
        const email = profile.email || user?.email || '';
        setLatitude(profile.latitude ?? 0);
        setLongitude(profile.longitude ?? 0);
        setProfilePhoto(profile.profilePhoto ?? null);
        setCompletionPercentage(profile.completionPercentage ?? 0);
        resetForm({
          values: {
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            email,
            phoneNumber: profile.phoneNumber ?? '',
            city: profile.city ?? '',
            state: profile.state ?? '',
            country: profile.country ?? '',
          },
        });
        setIsEditing(false);
        await syncLocalUser(profile);
      } catch (error) {
        if (!active) return;
        showToast({
          type: 'error',
          message: getErrorMessage(error, 'Unable to load profile.'),
        });
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [resetForm, showToast, user?.email]);

  const requiredFilled = useMemo(() => {
    return (
      values.firstName.trim().length > 0 &&
      values.lastName.trim().length > 0 &&
      values.email.trim().length > 0 &&
      values.city.trim().length > 0 &&
      values.state.trim().length > 0 &&
      values.country.trim().length > 0
    );
  }, [values]);

  const canSave = isEditing && dirty && requiredFilled && !isSubmitting;

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Mark required fields so validation messages show if save is blocked.
    await Promise.all(
      (['firstName', 'lastName', 'city', 'state', 'country'] as const).map((field) =>
        setFieldTouched(field, true, true)
      )
    );
    if (!requiredFilled) {
      showToast({
        type: 'error',
        message: 'Please fill in first name, last name, city, state, and country.',
      });
      return;
    }
    handleSubmit();
  };

  const applyPhotoResult = async (result: Awaited<ReturnType<typeof updateProfilePhoto>>) => {
    if (!result.success || !result.data) {
      showToast({
        type: 'error',
        message: result.message || 'Unable to update photo.',
      });
      return;
    }

    setProfilePhoto(result.data.profilePhoto ?? null);
    setCompletionPercentage(result.data.completionPercentage ?? completionPercentage);
    await syncLocalUser(result.data);
    setAvatarModalVisible(false);
    showToast({
      type: 'success',
      message: result.message || 'Profile photo updated.',
    });
  };

  const handleSelectPreset = async (presetId: string) => {
    try {
      setIsSavingPhoto(true);
      const result = await updateProfilePhoto(presetId);
      await applyPhotoResult(result);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to update photo.'),
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast({
          type: 'error',
          message: 'Photo library permission is required to upload an avatar.',
        });
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      setIsSavingPhoto(true);
      const resized = await ImageManipulator.manipulateAsync(
        picked.assets[0].uri,
        [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const result = await uploadProfilePhoto(resized.uri);
      await applyPhotoResult(result);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to upload photo.'),
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const displayName =
    [values.firstName, values.lastName].filter(Boolean).join(' ') || 'Your profile';
  const emailDisplay = values.email || user?.email || '';

  return (
    <TabsLayout tabName="Profile" onBack={() => router.back()}>
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator color={themeColors.primaryColor} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-white px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <View className="mb-2 mt-2 flex-row items-center justify-end">
            {isEditing ? (
              <TouchableOpacity onPress={handleCancelEdit} className="px-2 py-1">
                <Text className="text-base text-gray-500">Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleStartEdit}
                className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
                style={{ backgroundColor: `${themeColors.primaryColor}18` }}>
                <Ionicons name="create-outline" size={18} color={themeColors.primaryColor} />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: themeColors.primaryColor }}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex w-full items-center justify-center pb-4">
            <TouchableOpacity
              onPress={() => setAvatarModalVisible(true)}
              activeOpacity={0.85}
              className="items-center">
              <View className="relative rounded-full border border-gray-300 p-1">
                <Image
                  source={resolveAvatarSource(profilePhoto)}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <View
                  className="absolute bottom-0 right-0 rounded-full p-1.5"
                  style={{ backgroundColor: themeColors.primaryColor }}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </View>
              <Text className="mt-2 text-sm text-gray-500">Tap to change avatar</Text>
            </TouchableOpacity>
            <Text className="mt-2 text-lg font-semibold text-gray-800">{displayName}</Text>
            {completionPercentage < 100 ? (
              <Text className="mt-1 text-sm text-gray-500">
                Profile {completionPercentage}% complete
              </Text>
            ) : null}
          </View>

          <View className="flex">
            <EditableInput
              label="First Name"
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              onBlur={() => handleBlur('firstName')}
              error={errors.firstName}
              touched={touched.firstName}
              editable={isEditing}
              placeholder="Enter first name"
            />
            <EditableInput
              label="Last Name"
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              onBlur={() => handleBlur('lastName')}
              error={errors.lastName}
              touched={touched.lastName}
              editable={isEditing}
              placeholder="Enter last name"
            />
            <EditableInput
              label="Email address"
              value={emailDisplay}
              onChangeText={handleChange('email')}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              readOnly
              placeholder="Email address"
            />
            <EditableInput
              label="Phone Number"
              value={values.phoneNumber}
              onChangeText={handleChange('phoneNumber')}
              onBlur={() => handleBlur('phoneNumber')}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />
            <EditableInput
              label="City"
              value={values.city}
              onChangeText={handleChange('city')}
              onBlur={() => handleBlur('city')}
              error={errors.city}
              touched={touched.city}
              editable={isEditing}
              placeholder="Enter city"
            />
            <EditableInput
              label="State"
              value={values.state}
              onChangeText={handleChange('state')}
              onBlur={() => handleBlur('state')}
              error={errors.state}
              touched={touched.state}
              editable={isEditing}
              placeholder="Enter state"
            />
            <EditableInput
              label="Country"
              value={values.country}
              onChangeText={handleChange('country')}
              onBlur={() => handleBlur('country')}
              error={errors.country}
              touched={touched.country}
              editable={isEditing}
              placeholder="Enter country"
            />
          </View>

          {isEditing ? (
            <TouchableOpacity
              className="mb-10 mt-5 items-center rounded-3xl py-4"
              style={{
                backgroundColor: canSave ? themeColors?.primaryColor || '#6B9B76' : '#ccc',
              }}
              onPress={handleSave}
              disabled={!canSave}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Save Changes</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}

      <Modal
        visible={avatarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAvatarModalVisible(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => !isSavingPhoto && setAvatarModalVisible(false)}>
          <Pressable
            className="rounded-t-3xl bg-white px-5 pb-10 pt-4"
            onPress={(e) => e.stopPropagation()}>
            <View className="mb-4 items-center">
              <View className="mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
              <Text className="text-lg font-semibold text-gray-900">Choose avatar</Text>
              <Text className="mt-1 text-sm text-gray-500">
                Pick a preset or upload your own photo
              </Text>
            </View>

            <View className="mb-5 flex-row flex-wrap justify-between gap-y-4">
              {AVATAR_PRESETS.map((preset) => {
                const selected = profilePhoto === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleSelectPreset(preset.id)}
                    disabled={isSavingPhoto}
                    className="items-center"
                    style={{ width: '30%' }}>
                    <View
                      className="rounded-full p-1"
                      style={{
                        borderWidth: 2,
                        borderColor: selected ? themeColors.primaryColor : 'transparent',
                      }}>
                      <Image
                        source={preset.source}
                        style={{ width: 72, height: 72, borderRadius: 36 }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className="mb-3 items-center rounded-3xl py-4"
              style={{ backgroundColor: themeColors.primaryColor }}
              onPress={handleUploadPhoto}
              disabled={isSavingPhoto}>
              {isSavingPhoto ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Upload photo</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-2"
              onPress={() => setAvatarModalVisible(false)}
              disabled={isSavingPhoto}>
              <Text className="text-base text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </TabsLayout>
  );
};

export default ProfileScreen;
