import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ForgotPasswordLink = ({ onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.forgotPassword}
        >
            <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: '#1abc9c',
        fontWeight: 'bold'
    },
});

export default ForgotPasswordLink;