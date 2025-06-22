import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import {
    auth,
    createUserWithEmailAndPassword,
    db
} from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import RegisterHeader from '../components/auth/RegisterHeader';
import RegisterForm from '../components/auth/RegisterForm';
import LoginLink from '../components/auth/LoginLink';
import AuthErrorMessage from '../components/auth/AuthErrorMessage';
import { validateEmail, validatePassword } from '../components/auth/AuthValidation';

export default function RegisterScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const handleRegister = async () => {
        if (!nome || !telefone || !email || !password) {
            setErrorMessage('Preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('E-mail inválido');
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage('A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo');
            return;
        }

        setErrorMessage('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                nome: nome,
                telefone: telefone,
                email: user.email
            });
            
            navigation.reset({ 
                index: 0, 
                routes: [{ name: 'Home' }] 
            });
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Este e-mail já está em uso.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('E-mail inválido.');
            } else {
                setErrorMessage(error.message);
            }
        }
    };
    useEffect(() => {
        setErrorMessage('');
    }, [email, password, nome, telefone]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollViewContent} 
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {/* Cabeçalho */}
                        <RegisterHeader />
                        
                        {/* Formulário de registro */}
                        <RegisterForm 
                            nome={nome}
                            setNome={setNome}
                            telefone={telefone}
                            setTelefone={setTelefone}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            onRegister={handleRegister}
                        />
                        
                        {/* Mensagem de erro */}
                        <AuthErrorMessage message={errorMessage} />
                        
                        {/* Link para login */}
                        <LoginLink onPress={() => navigation.goBack()} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
        backgroundColor: '#f5f6fa'
    },
    keyboardAvoidingView: {
        flex: 1
    },
    scrollViewContent: {
        flexGrow: 1, 
        justifyContent: 'center'
    },
    container: {
        margin: 25
    }
});