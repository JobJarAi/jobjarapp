// DirectResumeUpload.js for React Native with Expo
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const DirectResumeUpload = ({ onUploadSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [progressText, setProgressText] = useState("");
    const [selectedFileName, setSelectedFileName] = useState("");

    const progressStages = [
        "Scanning",
        "Reading Resume",
        "Extracting Contact Information",
        "Identifying Personal Details",
        "Getting Work History",
        "Analyzing Employment Gaps",
        "Evaluating Educational Background",
        "Analyzing Your Skills",
        "Assessing Certifications",
        "Evaluating Language Proficiency",
        "Identifying Achievements and Awards",
        "Summarizing Professional Summary",
        "Classifying Job Roles",
        "Detecting Technical Skills",
        "Extracting Soft Skills",
        "Analyzing Project Experience",
        "Reviewing Leadership Qualities",
        "Assessing Team Collaboration Experience",
        "Quantifying Performance Metrics",
        "Validating References",
        "Ensuring Consistency in Experience",
        "Cross-referencing with Job Requirements",
        "Finalizing Skill Set Analysis",
        "Optimizing for Applicant Tracking Systems",
        "Finishing Up"
    ];

    useEffect(() => {
        let intervalId;
        let stageIndex = 0;

        if (isLoading) {
            intervalId = setInterval(() => {
                setProgressText(progressStages[stageIndex]);

                stageIndex++;
                if (stageIndex >= progressStages.length) {
                    clearInterval(intervalId);
                }
            }, 2000); // Adjust this interval as needed
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isLoading]);

    const handleFileSelect = async () => {
        setIsLoading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf', // Specify the allowed file type
                copyToCacheDirectory: true, // Keeping the file in the cache directory
            });

            // Check if the action was not canceled
            if (!result.cancelled) {
                const file = result.assets[0]; // Since DocumentPicker now returns an assets array
                setSelectedFileName(file.name);
                checkFile(file.uri); // Call checkFile here with the correct file.uri

                if (file.size > 0) {
                    uploadResume(file.uri, file.name, file.mimeType.split('/')[1]);
                } else {
                    setIsLoading(false);
                    Alert.alert('Empty File', 'The selected file is empty.');
                }
            } else {
                setIsLoading(false);
                Alert.alert('File Selection', 'File selection was cancelled.');
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            Alert.alert('Error', 'An error occurred while selecting the file.');
        }
    };

    const checkFile = async (fileUri) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
        } catch (error) {
            console.error('Error accessing file:', error);
        }
    };

    const uploadResume = async (fileUri, fileName, fileType) => {
        setIsLoading(true);

        const formData = new FormData();

        // Append the file directly to formData, the uri should be used as it is for iOS
        formData.append('resume', {
            uri: fileUri, // The fileUri from DocumentPicker result
            name: fileName, // The file name
            type: `application/${fileType}`, // The MIME type
        });

        try {
            // Post the formData to the server
            const response = await axios.post('http://localhost:3001/api/mobile/process_resume', formData, {
                headers: {
                    // Content-Type header is set automatically by axios, including the boundary parameter
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgressText(`Uploading ${percentCompleted}%`);
                },
            });

            setIsSuccess(true);
            handleUploadResponse(response.data.parsedData);
        } catch (error) {
            console.error('Error uploading resume:', error);
            Alert.alert('Upload Error', 'Error uploading resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadResponse = (parsedData) => {
        // Call the callback function with the parsed data
        onUploadSuccess(parsedData);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.uploadSection}>
                {!isLoading && (
                    <>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleFileSelect}
                            disabled={isLoading}
                        >
                            <Text style={styles.uploadButtonText}>Select Resume/CV</Text>
                        </TouchableOpacity>
                        <Text style={styles.helperText}>
                            Please upload a PDF, DOC, DOCX, or TXT file.
                        </Text>
                    </>
                )}
                {isLoading && (
                    <View style={styles.loadingSection}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.progressText}>{progressText}</Text>
                    </View>
                )}
                {isSuccess && (
                    <Text style={styles.successText}>Resume processed! Let's finish up...</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 70,
    },
    uploadSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileSelectedText: {
        marginTop: 10,
        color: 'blue',
        fontSize: 16,
    },
    uploadButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        borderColor: "#fff",
        borderWidth: 1,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    helperText: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    },
    loadingSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    progressText: {
        color: '#01bf02',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    successSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    successText: {
        fontSize: 16,
        color: 'green',
    },
    // Add other styles as needed
});

export default DirectResumeUpload;
