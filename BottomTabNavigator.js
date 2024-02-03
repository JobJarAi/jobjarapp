// BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JobRecommendations from './sections/JobRecommendations';
import MessagesScreen from './sections/MessagesScreen';
//import LiveFeedScreen from './sections/LiveFeedScreen';
// Import your other screens

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Recommendations" component={JobRecommendations} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            {/*}<Tab.Screen name="LiveFeed" component={LiveFeedScreen} />
            <Tab.Screen name="Emails" component={SentEmails} />
            <Tab.Screen name="Settings" component={UserSettings} />
            {/* Add more tabs for other screens here */}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
