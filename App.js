import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './LoginScreen';
import TalentSignUp from './TalentSignUp';
import JobRecommendations from './sections/JobRecommendations';
import LiveFeed from './LiveFeed';
import ForgotPassword from './sections/ForgotPassword';
import BottomTabNavigator from './BottomTabNavigator';
import CustomIcon from './assets/JobJar Icon.png';
import { Image } from 'react-native'; // Add this import
import MessagesScreen from './sections/MessagesScreen';
import SignUp from './SignUp';
import ConversationScreen from './sections/ConversationScreen';
import useSocket from './hooks/useSocket';

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
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();

  useFocusEffect(
    useCallback(() => {
      fetchConnections().then(() => {

        if (socket) {
          socket.on('newPrivateMessage', (message) => {
            // WRITE Logic to determine if this message should trigger a new message indicator
            // This might involve checking if the message belongs to the current user and if it's unread senderId !== userId
            setHasNewMessage(true); // Example condition
          });

          // Cleanup on component blur
          return () => {
            socket.off('newPrivateMessage');
          };
        }
      });
    }, [socket])
  );

  // Fetch user connections
  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);
      const response = await axios.get('https://jobjar.ai:3001/api/user-connections', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const connections = response.data.connections;
      console.log('connections', connections);
      if (connections && socket) { // Ensure socket is not null
        connections.forEach((connection) => {
          socket.emit('joinPrivateRoom', { connectionId: connection.connectionId });
        });
      } else {
        console.log('Socket not initialized');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        name="Messages"
        component={MessagesScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ color, size }) => (
            <Icon name="envelope" color={color} size={size} />
          ),
          tabBarBadge: hasNewMessage ? '●' : undefined,
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setHasNewMessage(false);
            navigation.navigate('Messages');
          },
        })}
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
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Recommendations" component={JobRecommendations} />
        <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="TalentSignUp" component={TalentSignUp} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}