import { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { auth, signOut, db } from '../firebase';
import { DangerButton, SecondaryButton } from '../components/Buttons';
import { doc, getDoc } from 'firebase/firestore';

export default function MinhaContaScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({ nome: '', telefone: '' });

    useEffect(() => {
        const currentUser = auth.currentUser;
        setUser(currentUser);

        const fetchUserData = async () => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
        };
        fetchUserData();
    }, []);

    const logout = async () => {
        await signOut(auth);      
    };

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Minha Conta</Text>
                <Text style={styles.label}>Nome:</Text>
                <Text style={styles.value}>{userData.nome || '-'}</Text>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{userData.telefone || '-'}</Text>
                <Text style={styles.label}>E-mail:</Text>
                <Text style={styles.value}>{user.email}</Text>
                <DangerButton text="Desconectar" action={logout} />
                <SecondaryButton text="Voltar" action={() => navigation.goBack()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    label: {
        fontSize: 18,
        color: '#636e72',
        marginBottom: 5,
    },
    value: {
        fontSize: 20,
        color: '#222',
        marginBottom: 20,
    }
});