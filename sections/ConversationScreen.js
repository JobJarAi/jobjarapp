// sections/ConversationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import useSocket from '../hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';


const ConversationScreen = ({ route }) => {
    const { roomName, senderPFP, senderFirstName, senderLastName, recipientId, senderId, connectionId, userId } = route.params;
    console.log('Parameters:', { roomName, senderPFP, senderFirstName, senderLastName, recipientId, senderId, connectionId, userId });
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [pendingImage, setPendingImage] = useState(null);
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

            const handleNewPrivateMessage = (newMessage) => {
                if (newMessage.text || newMessage.fileUrl) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            };

            const handleTyping = ({ senderId }) => {
                if (senderId !== connectionId) {
                    setIsTyping(true);
                    setTimeout(() => {
                        setIsTyping(false);
                    }, 2000);
                }
            };

            const handleExistingMessages = (messages) => {
                console.log('Existing messages received:', messages);
                setMessages(messages);
            };

            socket.on('newPrivateMessage', handleNewPrivateMessage);
            socket.on('typing', handleTyping);
            socket.on('existingMessages', handleExistingMessages);

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

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            const image = result.assets[0];
            console.log(image.uri);
            setPendingImage(image.uri);
        }
    };

    const sendMessage = async () => {
        if (!socket || !inputText.trim() && !pendingImage) {
            console.error('Socket is not initialized, input text is empty or no image selected.');
            return;
        }

        const token = await AsyncStorage.getItem('auth_token');
        if (!token || !userId) {
            console.error('User ID or auth token is undefined.');
            return;
        }

        let fileUrl = pendingImage;

        if (pendingImage) {
            const formData = new FormData();

            formData.append('file', {
                uri: pendingImage,
                name: "upload.jpg",
                type: 'image/jpeg',
            });

            try {
                const uploadResponse = await axios.post('https://jobjar.ai:3001/api/project/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                fileUrl = uploadResponse.data.fileUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                return;
            }
        }

        const messageData = {
            roomName,
            text: inputText,
            senderId: userId,
            senderPFP,
            senderFirstName,
            senderLastName,
            recipientId,
            fileUrl,
            fileType: pendingImage ? 'image' : null,
            connectionId,
            token,
        };

        socket.emit('privateMessage', messageData);

        setInputText('');
        setIsTyping(false);
        setPendingImage(null);
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const markMessagesAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            await axios.post('https://jobjar.ai:3001/api/messages/markAsRead', {
                roomName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

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
                {item.fileType === 'image' && <Image source={{ uri: item.fileUrl }} style={styles.messageImage} />}
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
                onContentSizeChange={() => endOfMessagesRef.current?.scrollToEnd({ animated: true })}
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

                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                    <Text style={styles.imagePickerButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            {pendingImage && (
                <View style={styles.pendingImageContainer}>
                    <Image source={{ uri: pendingImage }} style={styles.pendingImage} />
                    <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setPendingImage(null)}
                    >
                        <Text style={styles.removeImageButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        marginBottom: 40,
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
    imagePickerButton: {
        backgroundColor: '#01bf02',
        borderRadius: 20,
        padding: 10,
        marginLeft: 10,
    },
    imagePickerButtonText: {
        color: '#fff',
        fontSize: 20,
    },
    pendingImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pendingImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    removeImageButton: {
        backgroundColor: 'red',
        borderRadius: 10,
        padding: 5,
    },
    removeImageButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    messageImage: {
        width: 200,
        height: 200,
        marginBottom: 5,
    },
});

export default ConversationScreen;