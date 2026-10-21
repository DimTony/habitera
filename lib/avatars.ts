import type { ImageSourcePropType } from 'react-native';

import { API_BASE_URL } from './api/config';

export type AvatarPresetId =
  | 'preset:avatar-1'
  | 'preset:avatar-2'
  | 'preset:avatar-3'
  | 'preset:avatar-4'
  | 'preset:avatar-5'
  | 'preset:avatar-6';

export const AVATAR_PRESETS: { id: AvatarPresetId; source: ImageSourcePropType }[] = [
  { id: 'preset:avatar-1', source: require('../assets/images/avatars/avatar-1.png') },
  { id: 'preset:avatar-2', source: require('../assets/images/avatars/avatar-2.jpg') },
  { id: 'preset:avatar-3', source: require('../assets/images/avatars/avatar-3.jpg') },
  { id: 'preset:avatar-4', source: require('../assets/images/avatars/avatar-4.jpg') },
  { id: 'preset:avatar-5', source: require('../assets/images/avatars/avatar-5.jpg') },
  { id: 'preset:avatar-6', source: require('../assets/images/avatars/avatar-6.jpg') },
];

const DEFAULT_AVATAR = AVATAR_PRESETS[0].source;

export function resolveAvatarSource(profilePhoto?: string | null): ImageSourcePropType {
  if (!profilePhoto) return DEFAULT_AVATAR;

  const preset = AVATAR_PRESETS.find((item) => item.id === profilePhoto);
  if (preset) return preset.source;

  if (profilePhoto.startsWith('http://') || profilePhoto.startsWith('https://')) {
    return { uri: profilePhoto };
  }

  if (profilePhoto.startsWith('/uploads/')) {
    return { uri: `${API_BASE_URL}${profilePhoto}` };
  }

  return DEFAULT_AVATAR;
}
