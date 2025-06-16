import { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, View, FlatList, Alert, TouchableOpacity } from "react-native";
import { db } from '../firebase';
import { DangerButton, PrimaryButton, SecondaryButton } from "../components/Buttons";
import { CustomTextInput } from "../components/CustomInputs";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function formatMoney(value) {
    let v = value.replace(/\D/g, '');
    if (!v) return '';
    v = (parseInt(v, 10) / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return v;
}
function formatDateInput(text) {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 8);
    if (cleaned.length >= 5) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1-$2-$3');
    } else if (cleaned.length >= 3) {
        return cleaned.replace(/(\d{2})(\d{0,2})/, '$1-$2');
    } else {
        return cleaned;
    }
}

export default function HomeScreen () {
    const [user, setUser] = useState(null);
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [list, setList] = useState([]);
    const [editId, setEditId] = useState(null);

    const navigation = useNavigation();
    const route = useRoute();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);
    useEffect(() => {
        if (route.params && route.params.editItem) {
            const { valor, descricao, data, id } = route.params.editItem;
            setValor(formatMoney(String(valor)));
            setDescricao(descricao);
            setData(data);
            setEditId(id);            
            navigation.setParams({ editItem: undefined });
        }
    }, [route.params]);

    const loadexpenses = async () => {
        if (!user) return;
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
        setList(expenses);
    }

    useEffect(() => {
        if (!user) return;
        loadexpenses();
    }, [user]);

    const clearFields = () => {
        setValor('');
        setDescricao('');
        setData('');
        setEditId(null);
    }

    const addOrUpdate = async () => {
        if (!user) {
            Alert.alert('Usuário não autenticado.');
            return;
        }
        if (!valor || !descricao || !data) {
            Alert.alert('Preencha todos os campos.');
            return;
        }
        try {           
            const valorNumber = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
            if (editId) {
                await updateDoc(doc(db, 'expenses', editId), {
                    valor: valorNumber,
                    descricao,
                    data
                });
            } else {
                await addDoc(collection(db, 'expenses'), {
                    valor: valorNumber,
                    descricao,
                    data,
                    user_id: user.uid
                });
            }
            loadexpenses();
            clearFields();
        } catch (e) {
            console.log('Erro ao salvar:', e);
            Alert.alert('Erro ao salvar gasto', e.message);
        }
    }

    const startEdit = (item) => {
        setValor(formatMoney(String(item.valor)));
        setDescricao(item.descricao);
        setData(item.data);
        setEditId(item.id);
    }

    const remove = async (id) => {
        Alert.alert(
            "Remover gasto",
            "Tem certeza que deseja remover este gasto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        await deleteDoc(doc(db, 'expenses', id));
                        loadexpenses();
                    }
                }
            ]
        );
    }
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
                <Text style={styles.itemValor}>R$ {formatMoney(String(item.valor))}</Text>
                <Text style={styles.itemData}>{item.data}</Text>
            </View>
            <View style={styles.itemButtons}>
                <SecondaryButton text="Editar" action={() => startEdit(item)} />
                <DangerButton text="Excluir" action={() => remove(item.id)} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.headerWrapper}>
                <View style={styles.header}>
                    <Text style={styles.title}>Controle de Gastos</Text>
                    <TouchableOpacity
                        style={styles.profileIcon}
                        onPress={() => navigation.navigate('MinhaConta')}
                        accessibilityLabel="Minha Conta"
                    >
                        <Ionicons name="person-circle-outline" size={36} color="#1abc9c" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.container}>
                <Text style={styles.label}>Valor</Text>
                <CustomTextInput
                    placeholder="Valor"
                    value={valor}
                    setValue={text => setValor(formatMoney(text))}
                    keyboardType="numeric"
                />
                <Text style={styles.label}>Descrição</Text>
                <CustomTextInput
                    placeholder="Descrição"
                    value={descricao}
                    setValue={setDescricao}
                />
                <Text style={styles.label}>Data</Text>
                <CustomTextInput
                    placeholder="Apenas números (DDMMAAAA)"
                    value={data}
                    setValue={text => setData(formatDateInput(text))}
                    keyboardType="numeric"
                />
                <View style={styles.formButtons}>
                    <View style={{ flex: 1 }}>
                        <PrimaryButton
                            text={editId ? "Salvar Alterações" : "Adicionar Gasto"}
                            action={addOrUpdate}
                        />
                    </View>
                    {editId && (
                        <View style={{ flex: 1 }}>
                            <SecondaryButton text="Cancelar Edição" action={clearFields} />
                        </View>
                    )}
                </View>
                <SecondaryButton
                    text="Meus Gastos"
                    action={() => navigation.navigate('Gastos')}
                />
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: '#f5f6fa',
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    profileIcon: {
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButton: {
        minWidth: 120,
        alignItems: 'flex-end',
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    subtitle: {
        fontSize: 20,
        marginTop: 30,
        marginBottom: 10,
        color: '#636e72',
        fontWeight: 'bold'
    },
    label: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 10,
        marginBottom: 2,
        marginLeft: 2
    },
    formButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2
    },
    itemDescricao: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    itemValor: {
        fontSize: 16,
        color: '#636e72'
    },
    itemData: {
        fontSize: 14,
        color: '#b2bec3'
    },
    itemButtons: {
        marginLeft: 10,
        justifyContent: 'space-between',
        gap: 8
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        marginTop: 30
    }
});1221