import { Ionicons } from '@expo/vector-icons';
import EditIcon from 'components/Icons/EditIcon';
import { BackArrow } from 'components/Svg';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AVATAR_PRESETS, resolveAvatarSource } from 'lib/avatars';
import { getErrorMessage } from 'lib/api/errors';
import {
  getMyProfile,
  updateAgentProfile,
  updateProfilePhoto,
  uploadProfilePhoto,
} from 'lib/api/profile';
import { syncLocalUser } from 'lib/auth/session';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToastStore } from 'stores/useToastStore';

const AVATAR_SIZE = 400;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  agencyName: string;
  licenseNumber: string;
}

const emptyForm: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  country: '',
  agencyName: '',
  licenseNumber: '',
};

const Profile = () => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [initialData, setInitialData] = useState<FormData>(emptyForm);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

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
        const next: FormData = {
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          email: profile.email ?? '',
          phone: profile.phoneNumber ?? '',
          city: profile.city ?? '',
          state: profile.state ?? '',
          country: profile.country ?? '',
          agencyName: profile.agencyName ?? '',
          licenseNumber: profile.licenseNumber ?? '',
        };
        setFormData(next);
        setInitialData(next);
        setProfilePhoto(profile.profilePhoto ?? null);
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
  }, [showToast]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const canSave =
    isEditing &&
    isDirty &&
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.city.trim().length > 0 &&
    formData.state.trim().length > 0 &&
    formData.country.trim().length > 0;

  const handleSaveChanges = async () => {
    if (!canSave || isSaving) return;

    try {
      setIsSaving(true);
      const result = await updateAgentProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        phoneNumber: formData.phone.trim() || undefined,
        agencyName: formData.agencyName.trim() || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
      });

      if (!result.success || !result.data) {
        showToast({
          type: 'error',
          message: result.message || 'Unable to update profile.',
        });
        return;
      }

      await syncLocalUser(result.data);
      setInitialData(formData);
      setIsEditing(false);
      setShowSavedModal(true);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to update profile.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowSavedModal(false);
    router.back();
  };

  const displayName =
    [formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'Your profile';

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setFormData(initialData);
    setIsEditing(false);
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
      await applyPhotoResult(await updateProfilePhoto(presetId));
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
      await applyPhotoResult(await uploadProfilePhoto(resized.uri));
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to upload photo.'),
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#000" />
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets>
            <View style={styles.editRow}>
              {isEditing ? (
                <TouchableOpacity onPress={handleCancelEdit}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <EditIcon />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => setAvatarModalVisible(true)}
              activeOpacity={0.85}>
              <Image source={resolveAvatarSource(profilePhoto)} style={styles.avatar} />
              <View style={styles.avatarCameraBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Bahnschrift', fontSize: 18, fontWeight: '600' }}>
                {displayName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Image source={require('../../../assets/images/Prize.png')} />
                <Text style={{ fontFamily: 'Bahnschrift', fontWeight: '300', fontSize: 12 }}>
                  Verified Agent
                </Text>
              </View>
            </View>

            {(
              [
                ['firstName', 'First Name', 'Enter First Name'],
                ['lastName', 'Last Name', 'Enter Last Name'],
                ['email', 'Email Address', 'Enter Email Address'],
                ['phone', 'Phone Number', 'Enter Phone Number'],
                ['agencyName', 'Agency Name', 'Enter Agency Name'],
                ['licenseNumber', 'License Number', 'Enter License Number'],
                ['city', 'City', 'Enter City'],
                ['state', 'State', 'Enter State'],
                ['country', 'Country', 'Enter Country'],
              ] as const
            ).map(([field, label, placeholder]) => {
              const isEmail = field === 'email';
              const canEditField = isEditing && !isEmail;
              return (
                <View
                  key={field}
                  style={[styles.inputContainer, isEmail ? styles.inputContainerReadOnly : null]}>
                  <Text style={styles.sectionLabel}>{label}</Text>
                  <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#9F9F9F"
                    style={[styles.textInput, { color: '#222' }]}
                    value={formData[field]}
                    editable={canEditField}
                    autoCapitalize={isEmail ? 'none' : 'words'}
                    keyboardType={
                      isEmail ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'
                    }
                    onChangeText={(text) => updateField(field, text)}
                  />
                </View>
              );
            })}
          </ScrollView>

          {isEditing ? (
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { opacity: canSave && !isSaving ? 1 : 0.5 }]}
                onPress={handleSaveChanges}
                disabled={!canSave || isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      <Modal
        visible={showSavedModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.addModalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require('../../../assets/animations/Save.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>
            <Text style={styles.addModalTitle}>Profile updated successfully</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={avatarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAvatarModalVisible(false)}>
        <Pressable
          style={styles.avatarModalOverlay}
          onPress={() => !isSavingPhoto && setAvatarModalVisible(false)}>
          <Pressable style={styles.avatarModalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.avatarModalTitle}>Choose avatar</Text>
            <Text style={styles.avatarModalSubtitle}>
              Pick a preset or upload your own photo
            </Text>
            <View style={styles.avatarPresetGrid}>
              {AVATAR_PRESETS.map((preset) => {
                const selected = profilePhoto === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleSelectPreset(preset.id)}
                    disabled={isSavingPhoto}
                    style={styles.avatarPresetItem}>
                    <View
                      style={[
                        styles.avatarPresetRing,
                        selected ? styles.avatarPresetRingSelected : null,
                      ]}>
                      <Image source={preset.source} style={styles.avatarPresetImage} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.uploadAvatarButton}
              onPress={handleUploadPhoto}
              disabled={isSavingPhoto}>
              {isSavingPhoto ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadAvatarButtonText}>Upload photo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAvatarModalVisible(false)}
              disabled={isSavingPhoto}
              style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#666', fontFamily: 'Bahnschrift' }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  editRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F2F2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    fontFamily: 'Bahnschrift',
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelEditText: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#666',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  inputContainerReadOnly: {
    backgroundColor: '#F7F7F7',
  },
  avatarWrap: {
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: '38%',
    bottom: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 6,
  },
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  avatarModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  avatarModalTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarModalSubtitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  avatarPresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginBottom: 20,
  },
  avatarPresetItem: {
    width: '30%',
    alignItems: 'center',
  },
  avatarPresetRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarPresetRingSelected: {
    borderColor: '#1a1a1a',
  },
  avatarPresetImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  uploadAvatarButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadAvatarButtonText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    fontSize: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: 'transparent',
    width: '90%',
    height: 40,
    fontFamily: 'Bahnschrift',
    letterSpacing: 1.5,
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
  iconContainer: {},
  lottieAnimation: {
    width: 100,
    height: 100,
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

export default Profile;
