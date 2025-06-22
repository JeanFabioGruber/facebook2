import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const UserAvatar = ({ imageUri, userName, size = 40 }) => {
    const firstLetter = userName?.charAt(0)?.toUpperCase() || 'U';
    
    if (imageUri) {
        return (
            <Image 
                source={{ uri: imageUri }} 
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} 
            />
        );
    }
    
    return (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={styles.placeholderText}>
                {firstLetter}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        borderWidth: 2,
        borderColor: '#1abc9c',
    },
    placeholder: {
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#16a085',
    },
    placeholderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UserAvatar;