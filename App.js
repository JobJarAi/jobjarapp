// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import TalentSignUp from './SignUp';
import JobRecommendations from './sections/JobRecommendations';
import LiveFeed from './LiveFeed';
import ForgotPassword from './sections/ForgotPassword';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Artificially delay for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen when ready
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SignUp" component={TalentSignUp} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Recommendations" component={JobRecommendations} />
        <Stack.Screen name="LiveFeed" component={LiveFeed} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        {/* Add more screens here */}
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}