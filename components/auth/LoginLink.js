import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SecondaryButton } from '../Buttons';

const LoginLink = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Já tem uma conta?</Text>
            <SecondaryButton 
                text="Voltar para Login" 
                action={onPress} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 20,
    },
    text: {
        fontSize: 16,
        color: '#636e72',
        marginBottom: 10,
    }
});

export default LoginLink;