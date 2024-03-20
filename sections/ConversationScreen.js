// sections/ConversationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import useSocket from '../hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ConversationScreen = ({ route }) => {
    const { roomName, recipientId, senderId, connectionId, userId } = route.params;
    console.log('Parameters:', { roomName, recipientId, senderId, connectionId, userId });
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const socket = useSocket();
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        if (socket) {

            socket.on('connect_error', (err) => {
                console.log(`Connect Error: ${err.message}`);
            }); 
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {

            const joinRoom = () => {
                socket.emit('joinPrivateRoom', { connectionId, roomName });
            };

            if (socket.connected) {
                joinRoom();
            } else {
                console.log('Socket not connected, waiting for connection...');
                socket.on('connect', joinRoom);
            }

            const readMessages = () => {
                socket.emit('markMessagesAsRead', { roomName });
            };

            if (socket.connected) {
                readMessages();
            } else {
                console.log('Reading messages...');
                socket.on('markMessagesAsRead', readMessages);
            }

            // Listen for incoming messages
            const handleNewPrivateMessage = (newMessage) => {
                if (newMessage.text) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            };

            // Listen for typing events
            const handleTyping = ({ senderId }) => {
                if (senderId !== connectionId) {
                    setIsTyping(true);
                    setTimeout(() => {
                        setIsTyping(false);
                    }, 2000);
                }
            };

            // Listen for existing messages when joining the room
            const handleExistingMessages = (messages) => {
                setMessages(messages);
            };

            socket.on('newPrivateMessage', handleNewPrivateMessage);
            socket.on('typing', handleTyping);
            socket.on('existingMessages', handleExistingMessages);
           

            // Fetch existing messages
            socket.emit('fetchExistingMessages', { roomName });

            // Clean up the event listeners when the component unmounts or the dependencies change
            return () => {
                if (socket) {
                    socket.off('newPrivateMessage', handleNewPrivateMessage);
                    socket.off('typing', handleTyping);
                    socket.off('existingMessages', handleExistingMessages);
                    socket.off('connect', joinRoom);
                    setInputText('');
                }
            };
        }
    }, [socket, roomName, connectionId, userId]);

    const sendMessage = async () => {
        if (!socket || !inputText.trim()) {
            console.error('Socket is not initialized or input text is empty.');
            return;
        }

        const token = await AsyncStorage.getItem('auth_token');
        if (!userId) {
            console.error('User ID is undefined.');
            return;
        }

        const messageData = {
            roomName,
            text: inputText,
            senderId: userId, // Ensure this is defined
            recipientId: recipientId,
            connectionId,
            token, // Assuming token is also needed based on your initial setup
        };

        // Emit the private message event to the server
        socket.emit('privateMessage', messageData);

        setInputText('');
        setIsTyping(false);
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const markMessagesAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            // Make sure to include authorization headers if your API requires
            await axios.post('https://jobjar.ai:3001/api/messages/markAsRead', {
                roomName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Assuming you have a state management for unread messages counts
            // setUnreadCounts((prevCounts) => ({
            //     ...prevCounts,
            //     [roomName]: 0,
            // }));
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Add useEffect to call markMessagesAsRead when messages change
    useEffect(() => {
        if (messages.length > 0) {
            markMessagesAsRead();
        }
    }, [messages]);

    const renderMessage = ({ item }) => {
        const sentTime = new Date(item.createdAt);
        const currentTime = new Date();
        const timeDiff = currentTime - sentTime;
        let timeString;

        if (timeDiff < 60000) {
            timeString = 'Just now';
        } else if (timeDiff < 3600000) {
            const minutes = Math.floor(timeDiff / 60000);
            timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (timeDiff < 86400000) {
            const hours = Math.floor(timeDiff / 3600000);
            timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const options = {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            };
            timeString = sentTime.toLocaleString('en-US', options);
        }

        return (
            <View
                style={[
                    styles.messageContainer,
                    item.senderId === userId ? styles.sentMessage : styles.receivedMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>{timeString}</Text>
            </View>
        );
    };

    const TypingIndicator = () => {
        return (
            <View style={styles.typingIndicatorContainer}>
                <Text style={styles.typingIndicatorText}>Typing...</Text>
                <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesContainer}
                ref={endOfMessagesRef}
            />
            {isTyping && <TypingIndicator />}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={(text) => {
                        setInputText(text);
                        socket.emit('typing', { roomName, senderId: userId });
                    }}
                    placeholder="Type your message..."
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messagesContainer: {
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    messageContainer: {
        maxWidth: '75%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#01bf02',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    typingIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    typingIndicatorText: {
        marginRight: 5,
        fontSize: 14,
        color: '#888',
    },
    typingIndicator: {
        flexDirection: 'row',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#888',
        marginHorizontal: 2,
    },
    typingDot1: {
        animation: 'bounce 1s infinite',
    },
    typingDot2: {
        animation: 'bounce 1s infinite',
        animationDelay: '0.2s',
    },
    typingDot3: {
        animation: 'bounce 1s infinite',
        animationDelay: '0.4s',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
        marginBottom: 40,
    },
    sendButton: {
        backgroundColor: '#01bf02',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ConversationScreen;