import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PostHeader from './PostHeader';
import PostImage from './PostImage';
import PostContent from './PostContent';
import PostFooter from './PostFooter';
import ImageZoomModal from './ImageZoomModal';

const PostItem = ({ 
    item, 
    currentUser, 
    navigation, 
    onLike, 
    onShowOptions,
    formatDate 
}) => {
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    
    const isLiked = item.likedBy?.includes(currentUser?.uid) || false;
    
    const handleImagePress = (imageUri) => {
        setZoomImage(imageUri);
        setZoomVisible(true);
    };
    
    const handleProfilePress = () => {
        navigation.navigate('ProfileScreen', { userId: item.userId });
    };
    
    const handleCommentPress = () => {
        navigation.navigate('CommentsScreen', { postId: item.id });
    };

    return (
        <View style={styles.container}>
            <PostHeader 
                user={{
                    name: item.userName,
                    profileImage: item.userProfileImage
                }}
                date={formatDate(item.createdAt)}
                isOwnPost={item.isOwnPost}
                onProfilePress={handleProfilePress}
                onOptionsPress={() => onShowOptions(item.id)}
            />
            
            <PostImage 
                images={item.imageUrl || item.imageUrls} 
                onImagePress={handleImagePress}
            />
            
            <PostContent 
                description={item.description}
                location={item.location}
                tags={item.tags}
            />
            
            <PostFooter 
                likes={item.likes}
                comments={item.comments}
                isLiked={isLiked}
                onLikePress={() => onLike(item.id)}
                onCommentPress={handleCommentPress}
            />
            
            <ImageZoomModal 
                isVisible={zoomVisible}
                imageUri={zoomImage}
                onClose={() => setZoomVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    }
});

export default PostItem;