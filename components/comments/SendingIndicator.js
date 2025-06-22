import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SendingIndicator = ({ visible }) => {
    if (!visible) return null;
    
    return (
        <View style={styles.sendingIndicator}>
            <Text style={styles.sendingText}>Enviando comentário...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sendingIndicator: {
        alignItems: 'center',
        paddingVertical: 5,
    },
    sendingText: {
        color: '#1abc9c',
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default SendingIndicator;