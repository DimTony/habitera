import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from 'components/Navigation/AuthNavigator';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from 'stores/useAppStore';
import * as Yup from 'yup';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { themeColors } = useAppStore();

  const handleReset = (values: { email: string }) => {
    // Here you would normally call an API to authenticate the user
    console.log('Form values:', values);

    // Mock login success
    // In a real app, you'd call your authentication API here
    navigation.navigate('EmailOTP');
  };

  const FormField = ({
    field,
    label,
    placeholder,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    keyboardType = 'default',
  }: any) => (
    <View style={[styles.fieldSet, touched[field] && errors[field] ? styles.fieldSetError : {}]}>
      <Text style={[styles.legend, touched[field] && errors[field] ? styles.legendError : {}]}>
        {label}
      </Text>
      <TextInput
        className="w-full rounded-lg px-4 pb-3 pt-5"
        placeholder={placeholder}
        value={values[field]}
        onChangeText={handleChange(field)}
        onBlur={handleBlur(field)}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
      />
      {touched[field] && errors[field] && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.primaryColor }}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <SafeAreaView
          className="min-h-72 w-full"
          style={{ backgroundColor: themeColors.primaryColor }}>
          <View className="px-8 py-5">
            <Text className="text-4xl text-white">Forgot</Text>
            <Text className="text-4xl text-white">Password</Text>
          </View>
          <Text className="px-8 text-sm text-white">Confirm email address to reset password</Text>
        </SafeAreaView>

        {/* White content area with rounded top corners */}
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            backgroundColor: 'white',
            minHeight: 500,
          }}
          className="-mt-12 p-6 pt-6">
          <Formik
            initialValues={{
              email: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleReset}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
            }) => (
              <View className="mt-10">
                <FormField
                  field="email"
                  label="Email Address"
                  placeholder="Email address"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  keyboardType="email-address"
                />

                <TouchableOpacity
                  className="mt-8 items-center rounded-xl py-4"
                  style={{
                    backgroundColor:
                      isValid && dirty
                        ? themeColors.primaryColor
                        : themeColors.bgColor
                          ? themeColors.bgColor(0.5)
                          : '#E2E2E2',
                  }}
                  disabled={!(isValid && dirty)}
                  onPress={() => handleSubmit()}>
                  <Text className="text-lg font-bold text-white">Reset Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View className="mb-6 mt-10 flex w-full items-center justify-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: themeColors.primaryColor }}>Back to login</Text>
            </TouchableOpacity>
          </View>

          {/* This empty view ensures the white background extends to fill the screen */}
          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldSet: {
    margin: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#E2E2E2',
  },
  fieldSetError: {
    borderColor: '#FF3B30',
  },
  legend: {
    position: 'absolute',
    top: -5,
    left: 15,
    backgroundColor: '#FFFFFF',
    color: '#636363',
    fontSize: 8,
    paddingHorizontal: 6,
  },
  legendError: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
});

export default ForgotPassword;
