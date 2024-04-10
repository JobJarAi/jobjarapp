import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Button,
    ActivityIndicator,
    StyleSheet,
    ScrollView
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart, faSquareCheck, faFlag, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, TextInput } from 'react-native-paper';
import OriginalPostForm from './components/OriginalPostForm';
import ConnectUserButton from './components/ConnectUserButton';

const ResponsiveImage = ({ source, borderRadius, ...props }) => {
    const [size, setSize] = useState({ width: undefined, height: undefined });

    const onContainerLayout = (event) => {
        // Ensure source.uri is not empty before proceeding
        if (!source || !source.uri || source.uri.trim() === '') {
            console.warn('source.uri is empty or not provided for ResponsiveImage');
            return; // Exit the function if source.uri is empty or not provided
        }

        const { width: containerWidth } = event.nativeEvent.layout;
        Image.getSize(source.uri, (width, height) => {
            // Calculate the width and height ratios
            const widthRatio = containerWidth / width;
            const scaledHeight = height * widthRatio;
            // Set new width and height
            setSize({ width: containerWidth, height: scaledHeight });
        }, (error) => {
            console.error('Error fetching image size for uri:', source.uri, error);
        });
    };

    return (
        <View onLayout={onContainerLayout} {...props}>
            {size.width && size.height && source.uri && source.uri.trim() !== '' ? (
                <Image
                    source={source}
                    style={{ width: size.width, height: size.height, borderRadius }}
                    resizeMode="cover"
                />
            ) : null}
        </View>
    );
};

const LiveFeed = () => {
    // State declarations
    const [reposts, setReposts] = useState([]);
    const [commentLikes, setCommentLikes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [visibleMenuId, setVisibleMenuId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [comments, setComments] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [showConnectionsFeed, setShowConnectionsFeed] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const fetchUserId = async () => {
        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            const response = await axios.get('https://jobjar.ai:3001/api/user/details', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setCurrentUser(response.data.userId); // This will trigger a re-render
        } catch (error) {
            console.error('Error fetching user ID:', error);
        }
    };

    const fetchReposts = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        const token = await AsyncStorage.getItem('auth_token');

        try {
            const response = await axios.get(`https://jobjar.ai:3001/api/posts?page=${page}&perPage=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (page === 1) {
                setReposts(response.data);
            } else {
                setReposts(prevReposts => [...prevReposts, ...response.data]);
            }

            setHasMore(response.data.length === itemsPerPage);

            // After currentUser is surely set, map through comments to set likes
            const newCommentLikes = response.data.reduce((acc, post) => {
                post.comments.forEach(comment => {
                    const likedByCurrentUser = comment.upMarks.includes(currentUser); // No need to convert to string if IDs are stored correctly
                    acc[comment._id] = likedByCurrentUser;
                });
                return acc;
            }, {});

            setCommentLikes(newCommentLikes); // Now this will correctly reflect the liked state
        } catch (error) {
            console.error("Error fetching reposts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function initFetch() {
            await fetchUserId();
            await fetchReposts();
        }

        initFetch();
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
            primary: '#02bf01',
            underlineColor: 'transparent', // This should remove the underline or line at the bottom
            background: '#000',
        },
    };

    const refreshRepost = async (repostId) => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const response = await axios.get(`https://jobjar.ai:3001/api/posts/${repostId}`, {
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

    const handleModerateRepost = async (postId) => {
        setIsReviewing(true);
        try {
            const authToken = await AsyncStorage.getItem('auth_token');
            const response = await axios.post(`https://jobjar.ai:3001/api/check-post/${postId}`, {}, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            console.log(response.data.message); // log the message or use it in UI
            if (response.status === 201) {
                await refreshFeed(); // Call refreshFeed if a repost is deleted
            } else {
                await refreshRepost(postId); // Otherwise, refresh the repost
            }
        } catch (error) {
            console.error('Error moderating repost:', error);
            // Handle errors
        }
        setIsReviewing(false);
    };

    const handleShowMenu = (itemId) => {
        setVisibleMenuId(visibleMenuId === itemId ? null : itemId);
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

            await axios.post(`https://jobjar.ai:3001/api/posts/${repostId}/comment`, {
                comment: commentText,
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

    const handleCommentLikeToggle = async (postId, commentId) => {
        setIsLoading(true);
        try {
            const isLiked = commentLikes[commentId] || false;
            const token = await AsyncStorage.getItem('auth_token');
            if (isLiked) {
                await axios.put(`https://jobjar.ai:3001/api/posts/${postId}/comments/${commentId}/unlike`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`https://jobjar.ai:3001/api/posts/${postId}/comments/${commentId}/like`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            // Optimistically update the local state to reflect like/unlike action
            setCommentLikes(prevLikes => ({ ...prevLikes, [commentId]: !isLiked }));
        } catch (error) {
            console.error('Error toggling comment like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (postId) => {
        setReposts(prevReposts => prevReposts.map(repost =>
            repost._id === postId
                ? { ...repost, likes: [...repost.likes, { userId: currentUser }] }
                : repost
        ));

        try {
            const token = await AsyncStorage.getItem('auth_token');
            await axios.post(`https://jobjar.ai:3001/api/posts/${postId}/like`, {}, {
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
            await axios.delete(`https://jobjar.ai:3001/api/posts/${postId}/unlike`, {
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
                    <View style={styles.avatarPlaceholder}>
                        <Text>{item.firstName.charAt(0)}</Text>
                    </View>
                )}

                <Text style={styles.name} onPress={() => goToUserProfile(item.userId)}>
                    {item.firstName} {item.lastName}
                </Text>
                <View style={styles.moderationIconContainer}>
                    <TouchableOpacity onPress={() => handleShowMenu(item._id)}>
                        <FontAwesomeIcon icon={faEllipsisV} size={14} color="#FFF" />
                    </TouchableOpacity>
                </View>
                {visibleMenuId === item._id && (
                    <View style={styles.menu}>
                        {/* Check if the post is already determined as 'Good'. If not, show the Moderate option. */}
                        {item.moderationInfo && item.moderationInfo.determination !== 'Good' && (
                            <TouchableOpacity
                                style={[styles.menuItem, isReviewing && styles.disabledModerationButton]}
                                onPress={() => {
                                    handleModerateRepost(item._id);
                                    setVisibleMenuId(null);
                                }}
                                disabled={isReviewing}
                            >
                                {isReviewing ? (
                                    <ActivityIndicator size="small" color="#EF476F" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faFlag} size={14} color="#FFFF00" />
                                        <Text style={styles.menuItemText}>Flag Post</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                        <ConnectUserButton targetUserId={item.userId} />
                    </View>
                )}

                {/* <View style={styles.moderationIconContainer}>
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
                                    <Text style={styles.menuItemText}>Moderate Repost</Text>
                                    <FontAwesomeIcon icon={faFlag} size={14} color="#FFFF00" />
                                )}
                            </TouchableOpacity>
                        )
                    }
                </View> */}
            </View>

            {/* Content based on Type */}
            {item.contentType === 'job' ? (
                <>
                    <View style={styles.jobContentContainer}>
                        <Text style={styles.content}>{item.comment}</Text>
                        {item.originalContentImage && item.originalContentImage.trim() !== '' && (
                            <Image
                                style={styles.postImage}
                                source={{ uri: item.originalContentImage }}
                                resizeMode="cover"
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
                    {item.originalContentImage && item.originalContentImage.trim() !== '' && (
                        <View style={styles.postImageContainer}>
                            <ResponsiveImage
                                style={styles.postImage}
                                source={{ uri: item.originalContentImage }}
                                borderRadius={10}
                            />
                        </View>
                    )}
                    {/* Comments Section */}
                    {item.comments && item.comments.length > 0 && (
                        <>
                            <Text style={styles.commentsHeading}>Comments</Text>
                            <ScrollView style={styles.commentsContainer}>
                                {item.comments.map((comment, index) => (
                                    <View style={styles.commentItem} key={comment._id}>
                                        {/* Profile Picture next to Comment */}
                                        {comment.profilePic ? (
                                            <Image
                                                style={styles.commentProfilePic}
                                                source={{ uri: comment.profilePic }}
                                            />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text>{comment.firstName.charAt(0)}</Text>
                                            </View>
                                        )}
                                        {/* Display Comment */}
                                        <View style={styles.commentContent}>
                                            <Text style={styles.commentAuthor}>{comment.firstName} {item.lastName}</Text>
                                            <Text style={styles.commentText}>{comment.comment}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleCommentLikeToggle(item._id, comment._id)
                                            }
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                size={20}
                                                color={commentLikes[comment._id] ? '#01BF02' : 'gray'}
                                            />
                                            {/* Assuming you have a mechanism to keep track of like count */}
                                            <Text style={styles.likeCount}>{commentLikes[comment._id] || 0}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Comment Input */}
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            mode="outlined"
                            style={styles.commentInput}
                            value={comments[item._id] || ''}
                            onChangeText={(text) => handleCommentChange(item._id, text)}
                            placeholder="Add a comment"
                            placeholderTextColor="#999"
                            theme={theme}
                            textColor="#fff"
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
        backgroundColor: "black",
        padding: 5,
        marginBottom: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginRight: 10,
    },
    name: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 14,
        color: 'white',
    },
    likes: {
        fontSize: 14,
        color: 'white',
        margin: 5,
    },
    content: {
        fontSize: 18,
        color: 'white',
        marginBottom: 5,
    },
    jobContentContainer: {
        // ... styles for job content container
    },
    originalContentContainer: {
        marginTop: 10,
    },
    postImageContainer: {
        padding: 10,
        marginBottom: 10,
        alignItems: 'center', // Center the items horizontally
        justifyContent: 'center', // Center the items vertically
        backgroundColor: 'black',
    },
    postImage: {
        width: '100%',
        //  height: '100%', // Take up all space available
        //  resizeMode: 'cover', // Cover the area of the view
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
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
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
        color: 'white',
        marginBottom: 5,
        fontSize: 16,
        marginTop: 10,
    },
    commentsContainer: {
        maxHeight: 250,
        overflow: 'scroll',
    },
    commentProfilePic: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        flexDirection: 'column', // Stack author name and comment text vertically
    },
    commentItem: {
        flexDirection: 'row',
        backgroundColor: '#000',
        borderRadius: 5,
        padding: 10, // Increased padding for more space inside the comment block
        marginBottom: 10, // Increased space between comments
        alignItems: 'flex-start', // Align the start of the items to cater for different text lengths
    },
    commentAuthor: {
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4, // Space between author name and comment text
    },
    commentText: {
        color: '#f0f0f0',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#000',
        marginRight: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        height: 40,
    },
    postCommentButton: {
        backgroundColor: '#02bf10',
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
    likeCommentButton: {
        // Add styling for the like button, e.g. padding, margin
    },
    menu: {
        position: 'relative',
        top: 25, // Adjust if you want some space from the top
        right: 10, // Adjust to move closer to the ellipsis icon
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 10,
        elevation: 10,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 0 },
        zIndex: 10, // Ensure this is greater than the post content
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 20, // Add some horizontal padding for better touch targets
        flexDirection: 'row', // Align icon and text in a row
        alignItems: 'center', // Center items vertically in the row
        justifyContent: 'flex-start', // Align items to the start of the row
        backgroundColor: 'white', // Or any other color you prefer
        marginBottom: 5, // Add some margin between menu items
        borderRadius: 5, // Optional: if you want rounded corners for menu items
    },
    menuItemText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 10, // Add space between the icon and text
    },
});