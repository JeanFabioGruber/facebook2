import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../shared/UserAvatar';

const PostHeader = ({ user, date, isOwnPost, onProfilePress, onOptionsPress }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.userInfo}
                onPress={onProfilePress}
            >
                <UserAvatar 
                    imageUri={user.profileImage}
                    userName={user.name}
                    size={40}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.postDate}>{date}</Text>
                </View>
            </TouchableOpacity>
            
            {isOwnPost && (
                <TouchableOpacity 
                    style={styles.optionsButton}
                    onPress={onOptionsPress}
                >
                    <Ionicons name="ellipsis-horizontal" size={24} color="#636e72" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userDetails: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 2,
    },
    postDate: {
        fontSize: 12,
        color: '#636e72',
    },
    optionsButton: {
        padding: 8,
    },
});

export default PostHeader;