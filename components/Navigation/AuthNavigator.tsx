import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AgentSignUp from 'components/Auth/AgentSignUp';
import EmailOTP from 'components/Auth/EmailOTP';
import ForgotPassword from 'components/Auth/ForgotPassword';
import Login from 'components/Auth/Login';
import SignUp from 'components/Auth/SignUp';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  AgentSignup: undefined;
  ForgotPassword: undefined;
  EmailOTP: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={SignUp} />
        <Stack.Screen name="AgentSignup" component={AgentSignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="EmailOTP" component={EmailOTP} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
