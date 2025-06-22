import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const ProfilePost = ({ 
    post, 
    isOwnProfile, 
    isLiked, 
    onToggleLike, 
    onShowOptions, 
    onImagePress,
    onCommentPress,
    formatDate 
}) => {
    return (
        <View style={styles.postContainer}>
            {/* Header do post com opções para próprios posts */}
            {isOwnProfile && (
                <View style={styles.postHeader}>
                    <View style={styles.postHeaderDate}>
                        <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                    </View>
                    
                    {/* Botão de três pontos para opções */}
                    <TouchableOpacity 
                        style={styles.postOptionsButton}
                        onPress={() => onShowOptions(post.id)}
                    >
                        <Ionicons name="ellipsis-horizontal" size={24} color="#636e72" />
                    </TouchableOpacity>
                </View>
            )}
            
            {post.imageUrl && (
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    onPress={() => onImagePress(post.imageUrl)}
                >
                    <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}
            
            <View style={styles.postContent}>
                <Text style={styles.postDescription}>{post.description || ''}</Text>
                
                {post.location && (
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color="#636e72" />
                        <Text style={styles.locationText}>{post.location}</Text>
                    </View>
                )}
            </View>
            
            {/* Post Footer with Like and Comment buttons */}
            <View style={styles.postFooter}>
                <TouchableOpacity 
                    style={styles.likeButton}
                    onPress={() => onToggleLike(post.id)}
                >
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isLiked ? "#e74c3c" : "#636e72"} 
                    />
                    <Text style={[
                        styles.likeCount,
                        isLiked && styles.likedText
                    ]}>
                        {post.likes || 0}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.commentButton}
                    onPress={() => onCommentPress(post.id)}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#636e72" />
                    <Text style={styles.commentCount}>{post.comments || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    postContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    postHeaderDate: {
        flex: 1,
    },
    postOptionsButton: {
        padding: 8,
    },
    postDate: {
        fontSize: 14,
        color: '#636e72',
    },
    postImage: {
        width: '100%',
        height: windowWidth > 400 ? 250 : 200,
    },
    postContent: {
        padding: 16,
    },
    postDescription: {
        fontSize: 16,
        color: '#2d3436',
        lineHeight: 22,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
    },
    postFooter: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 20,
    },
    likeCount: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
        fontWeight: '600',
    },
    likedText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    commentCount: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
        fontWeight: '600',
    },
});

export default ProfilePost;