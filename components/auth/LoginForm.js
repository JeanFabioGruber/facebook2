import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmailInput, PasswordInput } from '../CustomInputs';
import { PrimaryButton } from '../Buttons';

const LoginForm = ({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    onSubmit,
    isLoading = false
}) => {
    return (
        <View style={styles.formContainer}>
            <EmailInput value={email} setValue={setEmail} />
            <PasswordInput value={password} setValue={setPassword} />
            <PrimaryButton text="Entrar" action={onSubmit} disabled={isLoading}  />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%'
    }
});

export default LoginForm;