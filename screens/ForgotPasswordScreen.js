import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import {
    auth,
    sendPasswordResetEmail
} from '../firebase';
import { EmailInput } from '../components/CustomInputs';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';

export default function ForgotPasswordScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [ email, setEmail ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ successMessage, setSuccessMessage ] = useState('');

    const resetPassword = async () => {
        if (!email) {
            setErrorMessage('Informe o e-mail.');
            setSuccessMessage('');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail inválido');
            setSuccessMessage('');
            return;
        }

        setErrorMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('E-mail de redefinição enviado!');
        } catch (error) {
            setErrorMessage(error.message);
            setSuccessMessage('');
        }
    }

    useEffect(() => {
        setErrorMessage('');
        setSuccessMessage('');
    }, [email])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Esqueci a senha</Text>
                <Text style={styles.subtitle}>Informe seu e-mail para redefinir a senha</Text>
                <EmailInput value={email} setValue={setEmail} />
                {errorMessage ?
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                    : null
                }
                {successMessage ?
                    <Text style={styles.successMessage}>{successMessage}</Text>
                    : null
                }
                <PrimaryButton text="Redefinir Senha" action={resetPassword} />
                <View style={styles.backContainer}>
                    <SecondaryButton text="Voltar" action={() => navigation.goBack()} />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 38,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: '#636e72'
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#e74c3c',
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#1abc9c',
        marginBottom: 10,
    },
    backContainer: {
        marginTop: 10,
        alignItems: 'center'
    }
})