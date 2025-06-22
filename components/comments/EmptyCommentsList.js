import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const EmptyCommentsList = ({ loading }) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1abc9c" />
                <Text style={styles.loadingText}>Carregando comentários...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Seja o primeiro a comentar!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    loadingText: {
        color: '#636e72',
        fontSize: 16,
        marginTop: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        fontSize: 16,
    },
});

export default EmptyCommentsList;