import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileStats from './ProfileStats';

const ProfileHeader = ({ profileData, postsCount, onImagePress }) => {
    const profileImage = profileData?.profileImage;
    const firstLetter = profileData?.nome?.charAt(0)?.toUpperCase() || 'U';
    
    return (
        <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
                {profileImage ? (
                    <TouchableOpacity activeOpacity={0.9} onPress={onImagePress}>
                        <Image 
                            source={{ uri: profileImage }} 
                            style={styles.profileImage} 
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>{firstLetter}</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.userName}>{profileData?.nome || 'Usuário'}</Text>
            
            {profileData?.bio && (
                <Text style={styles.userBio}>{profileData.bio}</Text>
            )}
            
            <ProfileStats postsCount={postsCount} />
            
            {postsCount > 0 && (
                <View style={styles.postsHeaderContainer}>
                    <Text style={styles.postsHeader}>Publicações</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    profileHeader: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#1abc9c',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#16a085',
    },
    placeholderText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
        textAlign: 'center',
    },
    userBio: {
        fontSize: 16,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    postsHeaderContainer: {
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    postsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        textAlign: 'center',
    },
});

export default ProfileHeader;