import { View, Text, TouchableOpacity, Image } from 'react-native';
import TabsLayout from '../TabsLayout';
import { useAppStore } from 'stores/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFormik } from 'formik';
import EditableInput from '../Shared/EditableInput';
import * as Yup from 'yup';
import { useToastStore } from 'stores/useToastStore';

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { themeColors } = useAppStore();
  const { showToast } = useToastStore();
  const navigation = useNavigation<ProfileNavigationProp>();

  const initialValues = {
    firstName: 'Ajirioghene',
    lastName: 'Okpeva',
    email: 'ajiriokpeva@gmail.com',
  };

  const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      showToast({
          message: 'Coming soon!',
          type: 'error',
          duration: 3000,
        });
    },
  });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, isValid, dirty } =
    formik;

  return (
    <TabsLayout tabName="Profile" onBack={() => navigation.goBack()}>
      <View className="flex-1 flex-col gap-14 bg-white px-5 ">
        <View className="flex w-full items-center justify-center">
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="rounded-full border border-gray-300 p-1">
            <Image
              source={require('../../../assets/images/avatar.png')}
              style={{ width: 100, height: 100, borderRadius: 20 }}
            />
          </TouchableOpacity>
          <Text className="mt-2 text-lg font-semibold text-gray-800">Ajirioghene Okpeva</Text>
        </View>

        <View className="flex">
          <EditableInput
            label="First Name"
            value={values.firstName}
            onChangeText={handleChange('firstName')}
            onBlur={() => handleBlur('firstName')}
            error={errors.firstName}
            touched={touched.firstName}
          />
          <EditableInput
            label="Last Name"
            value={values.lastName}
            onChangeText={handleChange('lastName')}
            onBlur={() => handleBlur('lastName')}
            error={errors.lastName}
            touched={touched.lastName}
          />
          <EditableInput
            label="Email address"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            touched={touched.email}
          />
        </View>

        <TouchableOpacity
          className={`mb-10 mt-5 items-center rounded-3xl py-4 bg-[${themeColors?.primaryColor || '#6B9B76'}] ${(!isValid || !dirty) && 'bg-[#ccc]'}`}
          onPress={() => handleSubmit()}
          disabled={!isValid || !dirty}>
          <Text className="text-base font-semibold text-white">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </TabsLayout>
  );
};

export default ProfileScreen;
