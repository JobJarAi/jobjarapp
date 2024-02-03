import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Button,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart, faSquareCheck, faFlag } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, TextInput } from 'react-native-paper';
import OriginalPostForm from './components/OriginalPostForm';

const LiveFeed = () => {
    // State declarations
    const [reposts, setReposts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [comments, setComments] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [showConnectionsFeed, setShowConnectionsFeed] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const fetchReposts = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);

        try {
            const token = await AsyncStorage.getItem('auth_token');
            const response = await axios.get(`https://jobjar.ai:3001/api/reposts?page=${page}&perPage=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (page === 1) {
                setReposts(response.data);
            } else {
                setReposts(prevReposts => [...prevReposts, ...response.data]);
            }
            setHasMore(response.data.length === itemsPerPage);
        } catch (error) {
            console.error("Error fetching reposts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReposts();
        fetchUserId();
    }, [page]);

    const loadMoreReposts = () => {
        if (hasMore && !isLoading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleRefresh = async () => {
        setPage(1);
        setReposts([]);
        setHasMore(true);
    };

    const refreshFeed = async () => {
        console.log('Refreshing feed');

        // Reset the page to 1 and clear the current reposts
        setPage(1);
        setReposts([]);
        setHasMore(true);

        // Fetch the first page of reposts
        await fetchReposts();
    };

    const theme = {
        ...DefaultTheme,
        roundness: 20, // This will set the borderRadius for all react-native-paper components
        colors: {
            ...DefaultTheme.colors,
            primary: '#118AB2',
            underlineColor: 'transparent', // This should remove the underline or line at the bottom
            background: '#fff',
        },
    };

    const refreshRepost = async (repostId) => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const response = await axios.get(`https://jobjar.ai:3001/api/reposts/${repostId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Find the index of the repost to update
            const index = reposts.findIndex((repost) => repost._id === repostId);

            // If the repost is found, update it
            if (index !== -1) {
                const updatedReposts = [...reposts];
                updatedReposts[index] = response.data;
                setReposts(updatedReposts);
            }
        } catch (error) {
            console.error("Error refreshing repost:", error);
        }
    };

    const handleModerateRepost = async (repostId) => {
        setIsReviewing(true);
        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            const response = await axios.post(`https://jobjar.ai:3001/api/moderate/${repostId}`, {}, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            console.log(response.data.message); // log the message or use it in UI
            if (response.status === 201) {
                await refreshFeed(); // Call refreshFeed if a repost is deleted
            } else {
                await refreshRepost(repostId); // Otherwise, refresh the repost
            }
        } catch (error) {
            console.error('Error moderating repost:', error);
            // Handle errors
        }
        setIsReviewing(false);
    };

    const fetchUserId = async () => {
        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            if (authToken) {
                const response = await axios.get('https://jobjar.ai:3001/api/user/details', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setCurrentUser(response.data.userId);
            }
        } catch (error) {
            console.error('Error fetching user ID:', error);
        }
    };

    const handleApply = async (jobId) => {
        console.log('Apply button clicked, jobId:', jobId); // Log to check if this function is called
        setIsApplying(true);

        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            console.log('Got auth token:', authToken); // Check if authToken is retrieved

            const response = await axios.post(`https://jobjar.ai:3001/api/apply`, { jobId }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            console.log('Application response:', response.data); // Log the response from the server

            // Check for specific messages or response codes from your API
            if (response.data && response.data.message) {
                alert('Application Status: ' + response.data.message);
            } else {
                alert('Applied successfully!');
            }
        } catch (error) {
            console.error('Error applying to job:', error);

            // Handle different types of errors
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
                alert(error.response.data.message);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                alert('Failed to apply. No response from server.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                alert('Failed to apply. Error: ' + error.message);
            }
        } finally {
            setIsApplying(false);
        }
    };

    const handleCommentChange = (repostId, text) => {
        setComments({ ...comments, [repostId]: text });
    };

    // Function to submit a comment
    const submitComment = async (repostId) => {
        const commentText = comments[repostId];
        if (!commentText) return; // Prevent empty comments
        setIsCommenting(true);

        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            const role = await AsyncStorage.getItem('user_role'); // Retrieve user role from AsyncStorage

            await axios.post(`https://jobjar.ai:3001/api/reposts/${repostId}/comment`, {
                comment: commentText,
                role,
            }, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setComments({ ...comments, [repostId]: '' }); // Clear the comment input
            await refreshRepost(repostId);
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
        setIsCommenting(false);
    };

    const handleLike = async (postId) => {
        setReposts(prevReposts => prevReposts.map(repost =>
            repost._id === postId
                ? { ...repost, likes: [...repost.likes, { userId: currentUser }] }
                : repost
        ));

        try {
            const token = await AsyncStorage.getItem('auth_token');
            await axios.post(`https://jobjar.ai:3001/api/reposts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error liking repost:', error);
            setReposts(prevReposts => prevReposts.map(repost =>
                repost._id === postId
                    ? { ...repost, likes: repost.likes.filter(like => like.userId !== currentUser) }
                    : repost
            ));
        }
    };

    const handleUnlike = async (postId) => {
        setReposts(prevReposts => prevReposts.map(repost =>
            repost._id === postId
                ? { ...repost, likes: repost.likes.filter(like => like.userId !== currentUser) }
                : repost
        ));

        try {
            const token = await AsyncStorage.getItem('auth_token');
            await axios.delete(`https://jobjar.ai:3001/api/reposts/${postId}/unlike`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error unliking repost:', error);
            setReposts(prevReposts => prevReposts.map(repost =>
                repost._id === postId
                    ? { ...repost, likes: [...repost.likes, { userId: currentUser }] }
                    : repost
            ));
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            {/* Profile and Time Section */}
            <View style={styles.profileSection}>
                {/* Profile Picture and Name */}
                {item.profilePic ? (
                    <Image
                        style={styles.profilePic}
                        source={{ uri: item.profilePic }}
                    />
                ) : (
                    // Placeholder for Avatar
                    <View style={styles.avatarPlaceholder}>
                        <Text>{item.name.charAt(0)}</Text>
                    </View>
                )}
                <Text style={styles.name} onPress={() => goToUserProfile(item.userId)}>
                    {item.name}
                </Text>
                <View style={styles.moderationIconContainer}>
                    {
                        item.moderationInfo.determination === 'Good' ? (
                            <FontAwesomeIcon size={24} color='#01BF02' icon={faSquareCheck} />
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleModerateRepost(item._id)}
                                disabled={isReviewing}
                                style={isReviewing ? styles.disabledModerationButton : styles.moderationButton}
                            >
                                {isReviewing ? (
                                    <ActivityIndicator size="small" color="#EF476F" />
                                ) : (
                                    <FontAwesomeIcon icon={faFlag} size={24} color="#EF476F" />
                                )}
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>

            {/* Content based on Type */}
            {item.contentType === 'job' ? (
                <>
                    <View style={styles.jobContentContainer}>
                        <Text style={styles.content}>{item.comment}</Text>
                        {item.image && (
                            <Image
                                style={styles.postImage}
                                source={{ uri: item.image }}
                            />
                        )}
                    </View>

                    {/* Apply Button */}
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Apply Button Pressed');
                            handleApply(item.jobId);
                        }}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            backgroundColor: '#01BF02',
                            borderRadius: 20,
                            width: 80,
                            elevation: 2,
                            marginTop: 10,
                        }}
                    >
                        {isApplying ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply</Text>
                        )}
                    </TouchableOpacity>

                </>
            ) : (
                // Original Content
                <View style={styles.originalContentContainer}>
                    <Text style={styles.content}>{item.originalContent}</Text>
                    {item.originalContentImage && (
                        <Image
                            style={styles.postImage}
                            source={{ uri: item.originalContentImage }}
                        />
                    )}
                    {/* Comments Section */}
                    {item.comments && item.comments.length > 0 && (
                        <>
                            <Text style={styles.commentsHeading}>Comments</Text>
                            <View style={styles.commentsContainer}>
                                {item.comments.map((comment, index) => (
                                    <View style={styles.commentItem} key={index}>
                                        {/* Display Comment */}
                                        <Text style={styles.commentAuthor}>{comment.name}</Text>
                                        <Text style={styles.commentText}>{comment.comment}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                    {/* Comment Input */}
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            mode="outlined" // Set mode to outlined which applies a border
                            style={styles.commentInput}
                            value={comments[item._id] || ''}
                            onChangeText={(text) => handleCommentChange(item._id, text)}
                            placeholder="Add a comment"
                            theme={theme} // Apply the custom theme
                        // ... other props
                        />
                        <TouchableOpacity
                            style={styles.postCommentButton}
                            onPress={() => submitComment(item._id)}
                        >
                            {isCommenting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.postCommentButtonText}>Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Interactions Bar */}
            <View style={styles.interactionsBar}>
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => {
                        const alreadyLiked = item.likes.some(like => like.userId === currentUser);
                        alreadyLiked ? handleUnlike(item._id) : handleLike(item._id);
                    }}
                >
                    <FontAwesomeIcon
                        icon={faHeart}
                        size={20}
                        color={item.likes.some(like => like.userId === currentUser) ? "#01BF02" : "gray"}
                    />
                    <Text style={styles.likes}>{item.likes.length}</Text>
                </TouchableOpacity>
                {/* ... other interaction elements */}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Button color={"#01BF02"} title="Refresh Feed" onPress={refreshFeed} />

            <FlatList
                data={reposts}
                renderItem={renderItem}
                keyExtractor={(item, index) => item._id + '_' + index}
                onEndReached={loadMoreReposts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    isLoading ? (
                        <ActivityIndicator size="large" style={styles.listFooter} />
                    ) : null
                }
                refreshing={isLoading}
                onRefresh={handleRefresh}
            />
            <OriginalPostForm />
        </View>
    );
};

export default LiveFeed;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "black",
    },
    itemContainer: {
        borderWidth: 1,
        backgroundColor: "white",
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 14,
        color: 'gray',
    },
    likes: {
        fontSize: 14,
        color: 'black',
        margin: 5,
    },
    content: {
        fontSize: 18,
        color: 'black',
        marginBottom: 5,
    },
    jobContentContainer: {
        // ... styles for job content container
    },
    originalContentContainer: {
        // ... styles for original content container
    },
    postImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
        borderRadius: 10,
    },
    interactionsBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginRight: 5,
    },
    listFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 25,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#01BF02',
        borderRadius: 20,
        elevation: 2,
        shadowOpacity: 0.2,
        shadowRadius: 1,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 0 },
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    refreshButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#01BF02',
        borderRadius: 20,
        elevation: 2,
        shadowOpacity: 0.2,
        shadowRadius: 1,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 0 },
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    moderationIconContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 8,
    },
    commentsHeading: {
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 16,
        marginTop: 10,
    },
    commentsContainer: {
        maxHeight: 200,
        overflow: 'scroll',
    },
    commentItem: {
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 8,
        marginBottom: 5,
    },
    commentAuthor: {
        fontWeight: 'bold',
    },
    commentText: {
        color: '#333',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        marginRight: 5,
        paddingHorizontal: 10, // Inner spacing for the text
        paddingVertical: 5, // Adjust this for your preferred height
        height: 40, // Aligns height with the 'Post' button
    },
    postCommentButton: {
        backgroundColor: '#118AB2',
        paddingVertical: 10, // Adjust vertical padding to match the input field height
        paddingHorizontal: 20, // Horizontal padding for the button text
        borderRadius: 20, // Match the borderRadius of the input field
        justifyContent: 'center', // Center the text or activity indicator vertically
        height: 40, // Set a fixed height to match the input field
    },
    postCommentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold",
    },
    // ... other styles as needed
});