import { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { auth, signOut, db } from '../firebase';
import { DangerButton, SecondaryButton, PrimaryButton } from '../components/Buttons';
import { CustomTextInput } from '../components/CustomInputs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function MinhaContaScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({ 
        nome: '', 
        telefone: '', 
        bio: '',
        profileImage: null 
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState({ 
        nome: '', 
        telefone: '', 
        bio: '',
        profileImage: null 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        setUser(currentUser);

        const fetchUserData = async () => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setTempData(data);
                }
            }
        };
        fetchUserData();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Erro', 'Permissão para acessar galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3, // Qualidade menor para reduzir o tamanho
            base64: true, // Incluir base64
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            
            // Verificar tamanho da imagem (Firestore tem limite de 1MB por documento)
            if (base64Image.length > 900000) { // ~900KB para dar margem
                Alert.alert(
                    'Imagem muito grande', 
                    'Por favor, escolha uma imagem menor ou tire uma nova foto.'
                );
                return;
            }
            
            setTempData(prev => ({ ...prev, profileImage: base64Image }));
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Erro', 'Permissão para usar a câmera é necessária!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            
            if (base64Image.length > 900000) {
                Alert.alert(
                    'Imagem muito grande', 
                    'Por favor, tire a foto novamente ou escolha uma imagem da galeria.'
                );
                return;
            }
            
            setTempData(prev => ({ ...prev, profileImage: base64Image }));
        }
    };

    const selectImageSource = () => {
        Alert.alert(
            'Selecionar Foto',
            'Escolha uma opção:',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Galeria', onPress: pickImage },
                { text: 'Câmera', onPress: takePhoto },
            ]
        );
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
        // Filtrar valores undefined e null
        const updatedData = {};
        
        if (tempData.nome !== undefined && tempData.nome !== null) {
            updatedData.nome = tempData.nome;
        }
        
        if (tempData.telefone !== undefined && tempData.telefone !== null) {
            updatedData.telefone = tempData.telefone;
        }
        
        if (tempData.bio !== undefined && tempData.bio !== null) {
            updatedData.bio = tempData.bio;
        }
        
        if (tempData.profileImage !== undefined && tempData.profileImage !== null) {
            updatedData.profileImage = tempData.profileImage;
        }

        // Atualizar no Firestore
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, updatedData);

        setUserData(prev => ({ ...prev, ...updatedData }));
        setIsEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        if (error.code === 'resource-exhausted') {
            Alert.alert('Erro', 'Imagem muito grande. Tente uma imagem menor.');
        } else {
            Alert.alert('Erro', 'Não foi possível salvar as alterações');
        }
    } finally {
        setLoading(false);
    }
};

    const cancelEdit = () => {
        setTempData(userData);
        setIsEditing(false);
    };

    const removePhoto = () => {
        Alert.alert(
            'Remover Foto',
            'Deseja remover a foto de perfil?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', onPress: () => setTempData(prev => ({ ...prev, profileImage: null })) },
            ]
        );
    };

    const logout = async () => {
        Alert.alert(
            'Confirmar',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: () => signOut(auth) }
            ]
        );
    };

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meu Perfil</Text>
                    <TouchableOpacity 
                        onPress={() => setIsEditing(!isEditing)}
                        style={styles.editButton}
                    >
                        <Ionicons 
                            name={isEditing ? "close" : "pencil"} 
                            size={24} 
                            color="#1abc9c" 
                        />
                    </TouchableOpacity>
                </View>

                {/* Profile Picture */}
                <View style={styles.profileSection}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity 
                            style={styles.imageWrapper}
                            onPress={isEditing ? selectImageSource : null}
                            disabled={!isEditing}
                        >
                            {tempData.profileImage ? (
                                <Image 
                                    source={{ uri: tempData.profileImage }} 
                                    style={styles.profileImage} 
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.placeholderText}>
                                        {userData.nome?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                            {isEditing && (
                                <View style={styles.cameraIcon}>
                                    <Ionicons name="camera" size={20} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                        {isEditing && tempData.profileImage && (
                            <TouchableOpacity 
                                style={styles.removeIcon}
                                onPress={removePhoto}
                            >
                                <Ionicons name="trash" size={16} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.userName}>{userData.nome || 'Usuário'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                {/* User Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Nome</Text>
                        {isEditing ? (
                            <CustomTextInput
                                placeholder="Digite seu nome"
                                value={tempData.nome}
                                setValue={(value) => setTempData(prev => ({ ...prev, nome: value }))}
                            />
                        ) : (
                            <Text style={styles.value}>{userData.nome || '-'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Telefone</Text>
                        {isEditing ? (
                            <CustomTextInput
                                placeholder="Digite seu telefone"
                                value={tempData.telefone}
                                setValue={(value) => setTempData(prev => ({ ...prev, telefone: value }))}
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.value}>{userData.telefone || '-'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Bio</Text>
                        {isEditing ? (
                            <CustomTextInput
                                placeholder="Conte um pouco sobre você..."
                                value={tempData.bio}
                                setValue={(value) => setTempData(prev => ({ ...prev, bio: value }))}
                                multiline={true}
                            />
                        ) : (
                            <Text style={styles.value}>
                                {userData.bio || 'Nenhuma bio adicionada'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>E-mail</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>
                </View>

                {/* Statistics */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>150</Text>
                        <Text style={styles.statLabel}>Curtidas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>30</Text>
                        <Text style={styles.statLabel}>Dias Ativos</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonSection}>
                    {isEditing ? (
                        <View style={styles.editButtons}>
                            <PrimaryButton 
                                text={loading ? "Salvando..." : "Salvar Alterações"} 
                                action={saveChanges}
                                disabled={loading}
                            />
                            <SecondaryButton 
                                text="Cancelar" 
                                action={cancelEdit}
                                disabled={loading}
                            />
                        </View>
                    ) : (
                        <>
                            <SecondaryButton 
                                text="Ver Meus Gastos" 
                                action={() => navigation.navigate('Gastos')} 
                            />
                            <DangerButton text="Sair" action={logout} />
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    editButton: {
        padding: 5,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#1abc9c',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#16a085',
    },
    placeholderText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#1abc9c',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIcon: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#636e72',
    },
    infoSection: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoItem: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#636e72',
        marginBottom: 8,
        fontWeight: '600',
    },
    value: {
        fontSize: 18,
        color: '#2d3436',
        fontWeight: '500',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1abc9c',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#636e72',
    },
    buttonSection: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    editButtons: {
        gap: 10,
    },
});