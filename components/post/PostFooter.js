import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PostFooter = ({ likes, comments, isLiked, onLikePress, onCommentPress }) => {
    return (
        <View style={styles.footer}>
            <TouchableOpacity 
                style={styles.likeButton}
                onPress={onLikePress}
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
                    {likes || 0}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.commentButton} 
                onPress={onCommentPress}
            >
                <Ionicons name="chatbubble-outline" size={24} color="#636e72" />
                <Text style={styles.commentCount}>{comments || 0}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
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

export default PostFooter;