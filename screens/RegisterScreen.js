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
    createUserWithEmailAndPassword,
    db
} from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmailInput, PasswordInput } from '../components/CustomInputs';

export default function RegisterScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ nome, setNome ] = useState('');
    const [ telefone, setTelefone ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');

    const register = async () => {
        if (!nome || !telefone || !email || !password) {
            setErrorMessage('Preencha todos os campos.');
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

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                nome: nome,
                telefone: telefone,
                email: user.email
            });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    useEffect(() => {
        setErrorMessage('');
    }, [email, password, nome, telefone])

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={styles.title}>Registrar-se</Text>
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
                <EmailInput value={email} setValue={setEmail} />
                <PasswordInput value={password} setValue={setPassword} />
                {errorMessage &&
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                }
                <PrimaryButton text={"Registrar-se"} action={register} />

                <Text>Já tem uma conta?</Text>
                <SecondaryButton text={'Voltar para Login'} action={() => {
                    navigation.goBack();
                }} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 25
    },
    title: {
        fontSize: 45,
        textAlign: 'center',
        marginVertical: 40
    },
    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 2,
        marginLeft: 2
    },
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red'
    }
});