import React from 'react';
import { Text, StyleSheet } from 'react-native';

const AuthErrorMessage = ({ message }) => {
    if (!message) return null;
    
    return (
        <Text style={styles.errorMessage}>{message}</Text>
    );
};

const styles = StyleSheet.create({
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#e74c3c',
        marginBottom: 10,
    },
});

export default AuthErrorMessage;