import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SecondaryButton } from '../Buttons';

const RegisterLink = ({ onPress }) => {
    return (
        <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
            <SecondaryButton text="Registrar-se" action={onPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    registerContainer: {
        marginTop: 30,
        alignItems: 'center'
    },
    registerText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#636e72'
    }
});

export default RegisterLink;