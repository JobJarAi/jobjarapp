import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../assets/whitelogo.png';

const JobRecommendations = () => {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [showDescription, setShowDescription] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchRecommendedJobs();
    }, []);

    const fetchRecommendedJobs = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const response = await axios.get('https://jobjar.ai:3001/api/mobile/getRecommendations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRecommendedJobs(response.data);
        } catch (error) {
            setError('Error fetching recommended jobs');
            console.error('Error fetching recommended jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeDescription = () => {
        setShowDescription(false); // This will hide the description
        setSelectedJob(null); // This will reset the selected job
    };

    const toggleDescription = (job) => {
        if (selectedJob && selectedJob._id === job._id) {
            // If the description is already shown for this job, hide it
            setShowDescription(false);
            setSelectedJob(null);
        } else {
            // Show the description for the selected job
            setShowDescription(true);
            setSelectedJob(job);
        }
    };

    const onSwipedTop = (index) => {
        const job = recommendedJobs[index];
        if (index === recommendedJobs.length - 1) {
            fetchRecommendedJobs();
        }
    };

    const onSwipedLeft = (index) => {
        if (index === recommendedJobs.length - 1) {
            fetchRecommendedJobs();
        }
    };

    const handleRefresh = async () => {
        await fetchRecommendedJobs();
    };

    const goToLiveFeed = async () => {
        navigation.navigate("LiveFeed");
    };

    const onSwipedRight = async (index) => {
        const jobId = recommendedJobs[index]._id;
        try {
            console.log('Applying for job:', jobId); // Debugging log
            setIsApplying(true);
            const token = await AsyncStorage.getItem('auth_token');
            await axios.post('https://jobjar.ai:3001/api/apply', { jobId }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsApplying(false);
            console.log('Applied successfully'); // Debugging log
        } catch (error) {
            Alert.alert('Error', 'Failed to apply for the job');
            console.error('Error applying to job:', error);
            setIsApplying(false); // Ensure this is set to false in case of error
        }

        const newJobs = recommendedJobs.filter((job, idx) => idx !== index);
        fetchRecommendedJobs(newJobs);

        // Check if it's the last job and fetch more jobs
        if (index === recommendedJobs.length - 1) {
            fetchRecommendedJobs();
        }
    }

    const applyToJob = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            await axios.post('https://jobjar.ai:3001/api/apply', { jobId }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Close the description after applying
            setShowDescription(false);
            setSelectedJob(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to apply for the job');
            console.error('Error applying to job:', error);
        }
    };

    const renderCard = (job) => {
        // Determine the image source (local or remote)
        const imageSource = job.image && job.image.trim() !== ''
            ? { uri: job.image }
            : require('../assets/blacklogo.png');

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => toggleDescription(job)}>
                <View style={styles.card}>
                    <Image source={imageSource} style={styles.cardImage} />
                    <View style={styles.paymentInfoContainer}>
                        <Text style={styles.paymentText}>
                            {job.paymentDetails.qualifier}: ${job.paymentDetails.amount}/ {job.paymentType}
                        </Text>
                    </View>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.gradientOverlay}
                    >
                        <View style={styles.cardDetails}>
                            <Text style={styles.cardTitle}>{job.jobTitle}</Text>
                            <Text style={styles.cardText}>{job.industry}</Text>
                            <Text style={styles.cardText}>
                                {job.employmentType} | {job.workLocationType}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
            {isLoading ? (
                <>
                    <Text style={styles.applyingText}>Loading Jobs...</Text>
                    <ActivityIndicator size="large" />
                </>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : isApplying ? (
                <View style={styles.applyingContainer}>
                    <Text style={styles.applyingText}>Applying...</Text>
                    <ActivityIndicator size="large" color="#00ff00" />
                </View>
            ) : recommendedJobs.length > 0 ? (
                <>
                    <Swiper
                        key={recommendedJobs.length}
                        cards={recommendedJobs}
                        renderCard={renderCard}
                        onSwipedLeft={onSwipedLeft}
                        onSwipedRight={(index) => onSwipedRight(index)}
                        onSwipedTop={onSwipedTop}
                        backgroundColor={"#000"}
                        stackSize={8}
                    />
                    <TouchableOpacity style={styles.livefeedButton} onPress={goToLiveFeed}>
                        <Text style={styles.closeButtonText}>Go To Live Feed</Text>
                    </TouchableOpacity>
                    {showDescription && selectedJob && (
                        <View style={styles.descriptionOverlay}>
                            <TouchableOpacity style={styles.applyButton} onPress={() => applyToJob(selectedJob._id)}>
                                <Text style={styles.buttonText}>Apply</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={closeDescription}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                            <ScrollView style={styles.descriptionScrollView}>
                                <Text style={styles.descriptionText}>{selectedJob.description}</Text>
                            </ScrollView>
                        </View>
                    )}
                </>
            ) : (
                <>
                    <TouchableOpacity style={styles.livefeedButton} onPress={goToLiveFeed}>
                        <Text style={styles.closeButtonText}>Go To Live Feed</Text>
                    </TouchableOpacity>
                    <Text style={styles.noJobsText}>No jobs to display. Please update your job preferences.</Text>
                    <TouchableOpacity style={styles.buttonStyle} onPress={handleRefresh}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <>
                                <FontAwesome name="refresh" size={24} color="#fff" />
                                <Text style={styles.refreshButtonText}>Refresh Recommendations</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250, // Adjust the width as necessary
        height: 120, // Adjust the height as necessary
        resizeMode: 'contain', // This ensures the logo is scaled correctly within the size specified
        alignSelf: 'center', // This will center the logo in the available space
        marginVertical: 10, // This adds vertical space above and below the logo
    },
    card: {
        width: '100%',
        height: 600,
        backgroundColor: '#fff',
        borderRadius: 14,
        shadowColor: "#fff",
        shadowOffset: {
            width: 10,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 5,
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 20,
        paddingBottom: 200,
    },
    cardImage: {
        width: '100%',
        height: '90%', // Fixed height for consistency
        resizeMode: 'cover', // Ensure the full image is visible
        borderRadius: 8,
        marginLeft: 20,
        marginTop: 5,
        marginRight: 20,
        marginBottom: 30,
        position: 'absolute',
    },
    cardDetails: {
        padding: 10, // Padding inside the details container
        position: 'absolute', // Position absolutely to overlay on the image
        bottom: 0, // Stick to the bottom of the card
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff', // White text for the overlay
        paddingHorizontal: 10,
    },
    cardText: {
        fontSize: 18,
        color: '#fff', // Light grey for less important text
        paddingHorizontal: 10,
    },
    paymentInfoContainer: {
        alignSelf: 'flex-end', // Align payment info to the right
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
        padding: 10,
        borderTopLeftRadius: 14, // Match the card's border radius
        borderBottomLeftRadius: 14,
        marginTop: 10, // Space from the top of the card
    },
    paymentText: {
        fontSize: 16,
        fontWeight: 'semibold',
        color: '#000',
    },
    applyingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent overlay
    },
    applyingText: {
        fontSize: 20,
        marginBottom: 20,
        color: '#fff',
    },
    noJobsText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center', // Center text if there are no jobs
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center', // Center text if there is an error
    },
    descriptionScrollView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff', // Change this to the color you want
        padding: 50,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    descriptionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background to focus on the description
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButton: {
        position: 'absolute',
        top: 10, // Place it at the top of the overlay
        right: 80, // Right aligned, with some space from the edge
        backgroundColor: '#01bf02', // Use a brand color for buttons
        padding: 10,
        borderRadius: 5,
        zIndex: 10, // Ensure it's above other elements
    },
    closeButton: {
        position: 'absolute',
        top: 10, // Place it at the top of the overlay, next to the apply button
        right: 10, // Right aligned, with some space from the edge
        backgroundColor: 'red', // Change this to your preferred button color
        padding: 10,
        borderRadius: 5,
        zIndex: 10, // Ensure it's above other elements
    },
    livefeedButton: {
        position: 'absolute',
        top: 10, // Place it at the top of the overlay, next to the apply button
        right: 10, // Right aligned, with some space from the edge
        backgroundColor: '#01bf02', // Change this to your preferred button color
        padding: 10,
        borderRadius: 5,
        zIndex: 10, // Ensure it's above other elements
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonStyle: {
        marginTop: 20,
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // ..
    descriptionText: {
        fontSize: 16,
        padding: 10,
        color: '#000',
        // Add any other styles for your description text here
    },
    // Add a button style if you decide to include a button

});

export default JobRecommendations;