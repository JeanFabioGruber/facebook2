import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileImageSection = ({ profileImage, userName, onImagePress }) => {
    const firstLetter = userName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
                <TouchableOpacity 
                    style={styles.imageWrapper}
                    onPress={onImagePress}
                >
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>{firstLetter}</Text>
                        </View>
                    )}                            
                </TouchableOpacity>                       
            </View>
            <Text style={styles.userName}>{userName || 'Usuário'}</Text>                    
        </View>
    );
};

const styles = StyleSheet.create({
    profileSection: { 
        alignItems: 'center', 
        paddingVertical: 30, 
        backgroundColor: '#fff', 
        marginBottom: 20 
    },
    imageContainer: { 
        position: 'relative', 
        marginBottom: 15 
    },
    imageWrapper: { 
        position: 'relative' 
    },
    profileImage: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        borderWidth: 4, 
        borderColor: '#1abc9c' 
    },
    placeholderImage: {
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        backgroundColor: '#1abc9c',
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 4, 
        borderColor: '#16a085'
    },
    placeholderText: { 
        fontSize: 40, 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    userName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#2d3436', 
        marginBottom: 5 
    },
});

export default ProfileImageSection;