import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmailInput, PasswordInput } from '../CustomInputs';
import { PrimaryButton } from '../Buttons';

const RegisterForm = ({ 
    nome, 
    setNome, 
    telefone, 
    setTelefone, 
    email, 
    setEmail, 
    password, 
    setPassword,
    onRegister 
}) => {
    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Nome</Text>
            <EmailInput
                placeholder="Digite seu nome"
                value={nome}
                setValue={setNome}
            />
            
            <Text style={styles.label}>Telefone</Text>
            <EmailInput
                placeholder="Digite seu telefone"
                value={telefone}
                setValue={setTelefone}
                keyboardType="phone-pad"
            />
            
            <EmailInput 
                value={email} 
                setValue={setEmail} 
                placeholder="E-mail"
            />
            
            <PasswordInput 
                value={password} 
                setValue={setPassword} 
                placeholder="Senha"
            />
            
            <PrimaryButton 
                text="Registrar-se" 
                action={onRegister} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%'
    },
    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 2,
        marginLeft: 2,
        color: '#2d3436',
        fontWeight: '500'
    }
});

export default RegisterForm;