import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Platform, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Text } from 'react-native-paper';

const OriginalPostForm = () => {
    const [originalContent, setOriginalContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

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
            setSelectedImage(image.uri);
        }
    };

    const handlePost = async () => {
        const authToken = await AsyncStorage.getItem('auth_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!authToken) {
            Alert.alert('Post Failed', 'You must be logged in to post.');
            return;
        }

        setIsPosting(true);

        const formData = new FormData();
        if (selectedImage) {
            const uriParts = selectedImage.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('image', {
                uri: selectedImage,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        formData.append('originalContent', originalContent);
        formData.append('role', userRole);

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`,
        };

        try {
            const response = await axios.post('https://jobjar.ai:3001/api/create-post', formData, { headers });
            console.log(response.data);
            Alert.alert("Post Successful", "Your post has been created successfully.");
            setOriginalContent('');
            setSelectedImage(null);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert("Post Failed", "An error occurred while creating your post.");
        }
        setIsPosting(false);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.textArea}
                placeholder="What's on your mind?"
                value={originalContent}
                onChangeText={setOriginalContent}
                multiline
            />
            {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.image} />
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={pickImage} style={[styles.button, styles.iconButton]}>
                    <FontAwesomeIcon icon={faCamera} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePost} style={styles.button}>
                    {isPosting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <FontAwesomeIcon icon={faPaperPlane} size={24} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
        marginTop: 10,
        backgroundColor: '#000000', 
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    textArea: {
        minHeight: 80,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        textAlignVertical: 'top',
        width: '100%', // Ensures full width within the padding of the container
        marginBottom: 20,
    },
    button: {

        // height removed to allow the button to expand based on content size
        padding: 10,
        height: 40,
        backgroundColor: '#01BF02',
        borderRadius: 30,
        width: '40%', // Reduce width to ensure it doesn't touch the screen edges
        alignSelf: 'center', // Center the button in the container
        shadowColor: "#000", // Shadow for iOS
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        marginHorizontal: 5,
        shadowRadius: 4.65,
        elevation: 7, // Elevation for Android
        marginBottom: 20,
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center', // Centers text vertically
    },
    buttonContainer: {
        flexDirection: 'row', // Aligns buttons horizontally
        justifyContent: 'space-evenly', // Evenly space the buttons
        width: '100%', // Full width to align with the parent container
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 18, // Adjust size as needed
        textAlign: 'center', // Ensure text is centered within the Text component
    },
    image: {
        width: '100%', // Full width image
        height: 200, // Fixed height, you may want to make this responsive
        resizeMode: 'cover', // Covers the dimensions without stretching
        borderRadius: 10, // Consistent with other elements
        marginBottom: 20,
    },
    iconButton: {
        borderWidth: 2,
        borderColor: '#ffffff',
        backgroundColor: 'transparent', // Make the button transparent
    },
});

export default OriginalPostForm;