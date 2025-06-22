import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Dimensions } from 'react-native';

export default function LoadingOverlay({ visible = false, text = 'Carregando...' }) {
    if (!visible) return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#1abc9c" />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    text: {
        marginTop: 12,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
