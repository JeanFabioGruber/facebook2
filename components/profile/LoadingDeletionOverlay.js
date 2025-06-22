import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingDeletionOverlay = ({ visible, message = 'Excluindo publicação...' }) => {
    if (!visible) return null;
    
    return (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingOverlayText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    loadingOverlayText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500',
    },
});

export default LoadingDeletionOverlay;