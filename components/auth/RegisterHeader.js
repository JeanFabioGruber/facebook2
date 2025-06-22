import React from 'react';
import { Text, StyleSheet } from 'react-native';

const RegisterHeader = () => {
    return (
        <Text style={styles.title}>Registrar-se</Text>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 45,
        textAlign: 'center',
        marginVertical: 40,
        color: '#1abc9c',
        fontWeight: 'bold'
    },
});

export default RegisterHeader;