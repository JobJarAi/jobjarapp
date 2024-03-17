import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './LoginScreen';
import TalentSignUp from './SignUp';
import JobRecommendations from './sections/JobRecommendations';
import LiveFeed from './LiveFeed';
import ForgotPassword from './sections/ForgotPassword';
import BottomTabNavigator from './BottomTabNavigator';
import CustomIcon from './assets/JobJar Icon.png';
import { Image } from 'react-native'; // Add this import

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={BottomTabNavigator} />
      <Drawer.Screen name="JobRecommendations" component={JobRecommendations} />
      <Drawer.Screen name="LiveFeed" component={LiveFeed} />
      {/* Add more drawer screens here */}
    </Drawer.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [
          {
            display: 'flex',
          },
          null
        ]
      }}
    >
      <Tab.Screen
        name="Feed"
        component={LiveFeed}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={CustomIcon}
              style={{ width: 18, height: 24, tintColor: color }} // Adjust the size here
            />
          ),
        }}
      />
      <Tab.Screen
        name="Recommendations"
        component={JobRecommendations}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" color={color} size={size} />
          ),
        }}
      />
      {/* Add more tab screens here */}
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <NavigationContainer initialRouteName="MainTab">
      <Stack.Navigator>
        <Stack.Screen name="SignUp" component={TalentSignUp} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Recommendations" component={JobRecommendations} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}