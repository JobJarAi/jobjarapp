// sections/MessagesScreen.js
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import useSocket from '../hooks/useSocket';

const MessagesScreen = ({ navigation }) => {
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [senderFirstName, setSenderFirstName] = useState('');
  const [senderLastName, setSenderLastName] = useState('');
  const [senderPFP, setSenderPFP] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingConnections, setTypingConnections] = useState([]);
  const [userId, setUserId] = useState(null)
  const socket = useSocket();

  useFocusEffect(
    React.useCallback(() => {
      fetchConnections();
    }, [])
  );

  useEffect(() => {
    if (socket) {
      socket.on('newPrivateMessage', handleNewPrivateMessage);
      socket.on('typing', handleTypingEvent);

      return () => {
        socket.off('newPrivateMessage', handleNewPrivateMessage);
        socket.off('typing', handleTypingEvent);
      };
    }
  }, [socket, userId]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('user_id');
      setUserId(userId);

      const [connectionsResponse, unreadMessagesCountResponse] = await Promise.all([
        axios.get('localhost:3001/api/user-connections', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('localhost:3001/api/unread-messages-count', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = connectionsResponse.data;
      const unreadMessagesCount = unreadMessagesCountResponse.data;

      setSenderPFP(data.senderPFP);
      setSenderFirstName(data.senderFirstName);
      setSenderLastName(data.senderLastName);

      if (data.connections) {
        const connectionsWithUnreadMessages = data.connections.map((connection) => {
          const unreadCount = unreadMessagesCount.find(
            (count) => count._id === connection.connectionId
          );
          return {
            ...connection,
            hasUnreadMessages: unreadCount ? unreadCount.count > 0 : false,
          };
        });

        setConnections(connectionsWithUnreadMessages);
        setFilteredConnections(connectionsWithUnreadMessages);
        joinPrivateRooms(connectionsWithUnreadMessages);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinPrivateRooms = (connections) => {
    if (socket) {
      connections.forEach((connection) => {
        socket.emit('joinPrivateRoom', { connectionId: connection.connectionId });
      });
    }
  };

  const handleNewPrivateMessage = (newMessage) => {
    // Assume the new message has the structure of { ... message details ..., connectionId: '...', read: boolean }
    setConnections(prevConnections =>
      prevConnections.map(connection => {
        if (connection.connectionId === newMessage.connectionId && newMessage.recipientId === userId && !newMessage.read) {
          return { ...connection, hasUnreadMessages: true };
        }
        return connection;
      })
    );
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = connections.filter((connection) =>
      connection.requesterName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredConnections(filtered);
  };

  const AvatarInitials = ({ name }) => {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');

    return (
      <View style={styles.avatarInitials}>
        <Text style={styles.avatarInitialsText}>{initials}</Text>
      </View>
    );
  };

  const handleConnectionClick = (connection) => {
    navigation.navigate('ConversationScreen', {
      roomName: connection.connectionId,
      senderPFP: senderPFP,
      senderFirstName: senderFirstName,
      senderLastName: senderLastName,
      recipientId: connection.requesterUserId,
      senderId: userId,
      connectionId: connection.connectionId,
      userId: userId,
    });
  };

  const handleTypingEvent = ({ senderId, roomName, senderFirstName, senderLastName }) => {
    setTypingConnections((prevTypingConnections) => {
      const typingConnection = { senderId, roomName, senderFirstName, senderLastName };
      const existingIndex = prevTypingConnections.findIndex(
        (connection) => connection.senderId === senderId && connection.roomName === roomName
      );

      if (existingIndex !== -1) {
        // If the typing connection already exists, remove it and add it again at the end
        const updatedTypingConnections = [...prevTypingConnections];
        updatedTypingConnections.splice(existingIndex, 1);
        updatedTypingConnections.push(typingConnection);
        return updatedTypingConnections;
      } else {
        // If the typing connection doesn't exist, add it to the end
        return [...prevTypingConnections, typingConnection];
      }
    });

    // Clear the typing indicator after a certain timeout (e.g., 2 seconds)
    setTimeout(() => {
      setTypingConnections((prevTypingConnections) =>
        prevTypingConnections.filter(
          (connection) => !(connection.senderId === senderId && connection.roomName === roomName)
        )
      );
    }, 2000);
  };

  useEffect(() => {
    const filtered = connections.filter((connection) =>
      connection.requesterName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredConnections(filtered);
  }, [searchText, connections]);

  const renderConnectionItem = ({ item, userId }) => {
    const { requesterName, requesterPFP, createdAt, latestMessage, hasUnreadMessages, connectionId, requesterUserId } = item;
    const isTyping = typingConnections.some(
      (connection) => connection.roomName === item.connectionId
    );

    return (
      <TouchableOpacity onPress={() => handleConnectionClick({ connectionId, requesterUserId })}>
        <View style={styles.connectionItem}>
          {requesterPFP ? (
            <Image source={{ uri: requesterPFP }} style={styles.avatar} />
          ) : (
            <AvatarInitials name={requesterName} />
          )}
          <View style={styles.connectionDetails}>
            <View style={styles.connectionNameContainer}>
              <Text style={styles.connectionName}>{requesterName}</Text>
              {hasUnreadMessages && (
                <View style={styles.unreadIndicatorContainer}>
                  <Text style={styles.unreadIndicator}>New</Text>
                </View>
              )}
            </View>
            {isTyping ? (
              <Text style={styles.typingIndicator}>Typing...</Text>
            ) : (
              <>
                {latestMessage ? (
                  <Text style={styles.messagePreview}>{latestMessage}</Text>
                ) : (
                  <Text style={styles.connectionDate}>{new Date(createdAt).toLocaleDateString()}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No connections found.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search connections"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredConnections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => renderConnectionItem({ item, userId })}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={isLoading}
          onRefresh={fetchConnections}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 20,
  },
  connectionDetails: {
    flex: 1,
    flexShrink: 1,
  },
  connectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  connectionDate: {
    fontSize: 15,
    color: '#777777',
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  loading: {
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888888',
  },
  connectionNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIndicatorContainer: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 12,
    alignSelf: 'center',
  },
  unreadIndicator: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagePreview: {
    fontSize: 15,
    color: '#777777',
    marginTop: 4,
  },
  avatarInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarInitialsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default MessagesScreen;