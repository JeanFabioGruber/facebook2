import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfilePostsList = ({ loading, isOwnProfile }) => {
    if (loading) {
        return (
            <View style={styles.postsLoadingContainer}>
                <ActivityIndicator size="small" color="#1abc9c" />
                <Text style={styles.loadingText}>Carregando posts...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color="#b2bec3" />
            <Text style={styles.emptyText}>
                {isOwnProfile ? 
                    'Você ainda não fez nenhuma publicação' : 
                    'Nenhuma publicação encontrada'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    postsLoadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#636e72',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
});

export default ProfilePostsList;