import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, signInWithEmailAndPassword } from '../firebase';
import LoginHeader from '../components/auth/LoginHeader';
import LoginForm from '../components/auth/LoginForm';
import ForgotPasswordLink from '../components/auth/ForgotPasswordLink';
import RegisterLink from '../components/auth/RegisterLink';
import AuthErrorMessage from '../components/auth/AuthErrorMessage';
import { getFieldValidationError, translateFirebaseError } from '../components/auth/AuthValidation';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setErrorMessage('');
    }, [email, password]);

    const handleLogin = async () => {
        const validationError = getFieldValidationError(email, password);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Erro no login:', error);
            setErrorMessage(translateFirebaseError(error.code) || error.message);
        }
    };

    const handleForgotPassword = () => {
        navigation.push('ForgotPassword');
    };

    const handleRegister = () => {
        navigation.push('Register');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Cabeçalho */}
                <LoginHeader 
                    title="Bem-vindo!" 
                    subtitle="Faça login para continuar" 
                />
                
                {/* Link para recuperação de senha */}
                <ForgotPasswordLink onPress={handleForgotPassword} />
                
                {/* Formulário de login */}
                <LoginForm 
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onSubmit={handleLogin}
                />
                
                {/* Mensagem de erro */}
                <AuthErrorMessage message={errorMessage} />
                
                {/* Link para registro */}
                <RegisterLink onPress={handleRegister} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
        backgroundColor: '#f5f6fa'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    }
});