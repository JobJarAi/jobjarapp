// sections/MessagesScreen.js
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import useSocket from '../hooks/useSocket';

const MessagesScreen = ({ navigation }) => {
  const [recentMessages, setRecentMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userId, setUserId] = useState(null);
  const socket = useSocket();

  useFocusEffect(
    React.useCallback(() => {
      const fetchMessages = async () => {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          const response = await axios.get('http://localhost:3001/api/connectionIds', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = response.data;
          console.log('Fetched userId:', data.userId);
          console.log('Fetched messages:', data.connections);

          if (data.userId) {
            setUserId(data.userId);
          }
          if (data.connections) {
            setRecentMessages(data.connections);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }, [])
  );

  const fetchUnreadCounts = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:3001/api/user/unreadCounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCounts(response.data.unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const fetchNewMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:3001/api/connectionIds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log('Fetched userId:', data.userId);
      console.log('Fetched messages:', data.connections);

      if (data.userId) {
        setUserId(data.userId);
      }
      if (data.connections) {
        setRecentMessages(data.connections);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    fetchNewMessages();
  }, []);

  useEffect(() => {
    if (socket) {
      const joinRooms = () => {
        recentMessages.forEach((message) => {
          socket.emit('joinPrivateRoom', {
            connectionId: message.connectionId,
            roomName: message.roomName,
          });
        });
      };

      if (socket.connected) {
        joinRooms();
      } else {
        console.log('Socket not connected, waiting for connection...');
        socket.on('connect', joinRooms);
      }

      // Listen for incoming messages
      const handleNewPrivateMessage = (newMessage) => {
        if (newMessage.text) {
          setRecentMessages((prevMessages) => {
            const updatedMessages = prevMessages.map((message) => {
              if (message.roomName === newMessage.roomName) {
                return newMessage;
              }
              return message;
            });
            return sortMessages(updatedMessages);
          });
          // Increment the unread count for the conversation
          setUnreadCounts((prevCounts) => ({
            ...prevCounts,
            [newMessage.roomName]: (prevCounts[newMessage.roomName] || 0) + 1,
          }));
        }
      };

      socket.on('newPrivateMessage', handleNewPrivateMessage);

      // Clean up the event listeners when the component unmounts or the dependencies change
      return () => {
        if (socket) {
          socket.off('newPrivateMessage', handleNewPrivateMessage);
          socket.off('connect', joinRooms);
        }
      };
    }
  }, [socket, recentMessages]);

  const handleConversationClick = (message) => {
    const { roomName, connectionId, recipientId, senderId } = message;
    navigation.navigate('ConversationScreen', {
      roomName,
      recipientId,
      senderId,
      connectionId,
      userId,
    });

    // Reset the unread count for the clicked conversation
    setUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [roomName]: 0,
    }));
  };

  const sortMessages = (messages) => {
    return messages.sort((a, b) => {
      const unreadCountA = unreadCounts[a.roomName] || 0;
      const unreadCountB = unreadCounts[b.roomName] || 0;
      return unreadCountB - unreadCountA;
    });
  };



  const renderConversationItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleConversationClick(item)}>
      <View style={styles.conversationItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.conversationDetails}>
          <Text style={styles.conversationPartner}>{item.partnerName}</Text>
          <Text style={styles.conversationPreview}>{item.text}</Text>
        </View>
        <View style={styles.conversationMetadata}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          {unreadCounts[item.roomName] > 0 && (
            <View style={styles.unreadIndicator}>
              <Text style={styles.unreadCount}>{unreadCounts[item.roomName]}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortMessages(recentMessages)}
        keyExtractor={(item) => item.connectionId.toString()}
        renderItem={renderConversationItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={false}
        onRefresh={() => {
          fetchNewMessages();
          fetchUnreadCounts();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationPartner: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  conversationPreview: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  conversationMetadata: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
  },
  unreadIndicator: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
});

export default MessagesScreen;