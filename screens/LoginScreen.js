import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import {
    auth,
    signInWithEmailAndPassword
} from '../firebase';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmailInput, PasswordInput } from '../components/CustomInputs';

export default function LoginScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const [ errorMessage, setErrorMessage ] = useState('');

    const login = async () => {
        if (!email || !password) {
            setErrorMessage('Informe o e-mail e senha.');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail inválido');
            return;
        }

        if (!regexPassword.test(password)) {
            setErrorMessage('A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo');
            return;
        }

        setErrorMessage('');

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            const user = userCredentials.user;            
        })
        .catch((error) => {
            setErrorMessage(error.message);
        })
    }

    useEffect(() => {
        setErrorMessage('');
    }, [email, password])

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
            <EmailInput value={email} setValue={setEmail} />
            <PasswordInput value={password} setValue={setPassword} />
            <TouchableOpacity
                onPress={() => navigation.push('ForgotPassword')}
                style={styles.forgotPassword}
            >
                <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
            </TouchableOpacity>
            {errorMessage &&
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            }
            <PrimaryButton text={'Entrar'} action={login} />
            <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
                <SecondaryButton text={'Registrar-se'} action={() => navigation.push('Register')} />
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: '#1abc9c',
        fontWeight: 'bold'
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#e74c3c',
        marginBottom: 10,
    },
    registerContainer: {
        marginTop: 30,
        alignItems: 'center'
    },
    registerText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#636e72'
    }
})