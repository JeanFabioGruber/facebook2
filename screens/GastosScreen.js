import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, SectionList, ActivityIndicator } from "react-native";
import { db } from '../firebase';
import { SecondaryButton, DangerButton, PrimaryButton } from "../components/Buttons";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { useNavigation } from '@react-navigation/native';

export default function GastosScreen() {
    const [user, setUser] = useState(auth.currentUser);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const navigation = useNavigation();

    const loadexpenses = async () => {
        if (!user) return;
        setLoading(true);
        const snapshot = await getDocs(
            query(
                collection(db, 'expenses'),
                where('user_id', '==', user.uid)
            )
        );
        const expenses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        const totalValue = expenses.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
        setTotal(totalValue);

        const grouped = {};
        expenses.forEach(item => {
            const date = item.data;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);
        });
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        const sectionsData = sortedDates.map(date => ({
            title: date,
            data: grouped[date].sort((a, b) => b.valor - a.valor)
        }));
        setSections(sectionsData);
        setLoading(false);
    };

    useEffect(() => {
        loadexpenses();
    }, []);

    const remove = async (id) => {
        await deleteDoc(doc(db, 'expenses', id));
        loadexpenses();
    };
    const edit = (item) => {
        navigation.navigate('Home', { editItem: item });
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
                <Text style={styles.itemValor}>R$ {item.valor}</Text>
            </View>
            <View style={styles.itemButtons}>
                <PrimaryButton text="Editar" action={() => edit(item)} style={styles.smallButton} />
                <DangerButton text="Excluir" action={() => remove(item.id)} style={styles.smallButton} />
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Meus Gastos</Text>
                <Text style={styles.totalText}>Total: R$ {total.toFixed(2)}</Text>
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum gasto cadastrado.</Text>}
                />
                <SecondaryButton text="Voltar" action={() => navigation.goBack()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1abc9c',
        textAlign: 'center',
        marginBottom: 10,
    },
    totalText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0984e3',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#dff9fb',
        color: '#636e72',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#b2bec3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemDescricao: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1abc9c',
        marginBottom: 4,
    },
    itemValor: {
        fontSize: 20,
        color: '#636e72',
        fontWeight: '600',
    },
    itemButtons: {
        marginLeft: 12,
        justifyContent: 'center',
        gap: 8,
    },
    smallButton: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        minWidth: 70,
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        marginTop: 30
    }
});