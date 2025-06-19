import { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { auth, signOut, db } from '../firebase';
import { DangerButton, SecondaryButton, PrimaryButton } from '../components/Buttons';
import { CustomTextInput } from '../components/CustomInputs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Modal, TouchableWithoutFeedback } from 'react-native';

const InfoField = ({ label, value, onChangeText, keyboardType, multiline, isEditing, styles }) => (
    <View style={styles.infoItem}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && label !== 'E-mail' ? (
            <CustomTextInput
                placeholder={`Digite seu ${label.toLowerCase()}`}
                value={value}
                setValue={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        ) : (
            <Text style={styles.value}>{value || (label === 'Bio' ? 'Nenhuma bio adicionada' : '-')}</Text>
        )}
    </View>
);

export default function MinhaContaScreen({ navigation }) {    
    const [user] = useState(auth.currentUser);
    const [userData, setUserData] = useState({ nome: '', telefone: '', bio: '', profileImage: null });
    const [tempData, setTempData] = useState({ nome: '', telefone: '', bio: '', profileImage: null });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setTempData(data);
                }
            }
        };
        fetchUserData();
    }, []);

    const processImage = async (result) => {
        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            
            if (base64Image.length > 900000) {
                Alert.alert('Imagem muito grande', 'Por favor, escolha uma imagem menor.');
                return;
            }
            
            setTempData(prev => ({ ...prev, profileImage: base64Image }));            
            await saveImageToDatabase(base64Image);
        }
    };

    const saveImageToDatabase = async (imageData) => {
        try {
            await updateDoc(doc(db, "users", user.uid), { profileImage: imageData });
            setUserData(prev => ({ ...prev, profileImage: imageData }));
        } catch (error) {
            console.error('Erro ao salvar imagem:', error);
            Alert.alert('Erro', 'Não foi possível salvar a imagem');
        }
    };

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
            quality: 0.3,
            base64: true,
        });

        await processImage(result);
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

        await processImage(result);
    };

    const selectImageSource = () => {
        setShowImageModal(true);
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            const updatedData = Object.fromEntries(
                Object.entries(tempData).filter(([_, value]) => value !== undefined && value !== null)
            );

            await updateDoc(doc(db, "users", user.uid), updatedData);
            setUserData(prev => ({ ...prev, ...updatedData }));
            setIsEditing(false);
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            Alert.alert('Erro', error.code === 'resource-exhausted' ? 'Imagem muito grande.' : 'Não foi possível salvar');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setTempData(userData);
        setIsEditing(false);
    };

    const removePhotoAndSave = async () => {
        Alert.alert('Remover Foto', 'Deseja remover a foto de perfil?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Remover', 
                onPress: async () => {
                    setTempData(prev => ({ ...prev, profileImage: null }));
                    setUserData(prev => ({ ...prev, profileImage: null }));
                    try {
                        await updateDoc(doc(db, "users", user.uid), { profileImage: null });
                    } catch (error) {
                        console.error('Erro ao remover foto:', error);
                        Alert.alert('Erro', 'Não foi possível remover a foto');
                    }
                }
            },
        ]);
    };

    const removePhoto = () => {
        Alert.alert('Remover Foto', 'Deseja remover a foto de perfil?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', onPress: () => setTempData(prev => ({ ...prev, profileImage: null })) },
        ]);
    };

    const logout = async () => {
        Alert.alert('Confirmar', 'Deseja realmente sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', onPress: () => signOut(auth) }
        ]);
    };

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa', }}>
            {/* Modal customizado para seleção de imagem */}
            <Modal
                visible={showImageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowImageModal(false)}>
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.18)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <TouchableWithoutFeedback>
                            <View style={{
                                backgroundColor: '#fff',
                                borderRadius: 18,
                                paddingVertical: 18,
                                paddingHorizontal: 0,
                                width: 270,
                                alignItems: 'stretch',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 6,
                            }}>
                                <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 10, color: '#222', textAlign: 'center' }}>Selecionar Foto</Text>
                                <TouchableOpacity
                                    style={{ paddingVertical: 14, alignItems: 'center', borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                                    onPress={() => { setShowImageModal(false); pickImage(); }}
                                >
                                    <Text style={{ fontSize: 16, color: '#1abc9c', fontWeight: '500' }}>Escolher da Galeria</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ paddingVertical: 14, alignItems: 'center', borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                                    onPress={() => { setShowImageModal(false); takePhoto(); }}
                                >
                                    <Text style={{ fontSize: 16, color: '#1abc9c', fontWeight: '500' }}>Tirar Foto</Text>
                                </TouchableOpacity>
                                {/* Adicionar opção de remover foto se existir uma */}
                                {tempData.profileImage && (
                                    <TouchableOpacity
                                        style={{ paddingVertical: 14, alignItems: 'center', borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                                        onPress={() => { setShowImageModal(false); removePhotoAndSave(); }}
                                    >
                                        <Text style={{ fontSize: 16, color: '#e74c3c', fontWeight: '500' }}>Remover Foto</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={{ paddingVertical: 14, alignItems: 'center' }}
                                    onPress={() => setShowImageModal(false)}
                                >
                                    <Text style={{ fontSize: 16, color: '#636e72', fontWeight: '500' }}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meu Perfil</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.headerButton}>
                        <Ionicons name={isEditing ? "close" : "pencil"} size={24} color="#1abc9c" />
                    </TouchableOpacity>
                </View>

                {/* Profile Picture */}
                <View style={styles.profileSection}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity 
                            style={styles.imageWrapper}
                            onPress={selectImageSource}
                        >
                            {tempData.profileImage ? (
                                <Image source={{ uri: tempData.profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.placeholderText}>
                                        {userData.nome?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}                            
                        </TouchableOpacity>                       
                    </View>
                    <Text style={styles.userName}>{userData.nome || 'Usuário'}</Text>                    
                </View>

                {/* User Info */}
                <View style={styles.infoSection}>
                    <InfoField 
                        label="Nome" 
                        value={tempData.nome} 
                        onChangeText={(value) => setTempData(prev => ({ ...prev, nome: value }))} 
                        isEditing={isEditing}
                        styles={styles}
                    />
                    <InfoField 
                        label="Telefone" 
                        value={tempData.telefone} 
                        onChangeText={(value) => setTempData(prev => ({ ...prev, telefone: value }))}
                        keyboardType="phone-pad"
                        isEditing={isEditing}
                        styles={styles}
                    />
                    <InfoField 
                        label="Bio" 
                        value={tempData.bio} 
                        onChangeText={(value) => setTempData(prev => ({ ...prev, bio: value }))}
                        multiline={true}
                        isEditing={isEditing}
                        styles={styles}
                    />
                    <InfoField 
                        label="E-mail" 
                        value={user.email} 
                        isEditing={isEditing}
                        styles={styles}
                    />
                </View>

                {/* Buttons */}
                <View style={styles.buttonSection}>
                    {isEditing ? (
                        <>
                            <PrimaryButton 
                                text={loading ? "Salvando..." : "Salvar Alterações"} 
                                action={saveChanges}
                            />
                            <SecondaryButton text="Cancelar" action={cancelEdit} />
                        </>
                    ) : (
                        <DangerButton text="Sair da Conta" action={logout} />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        paddingTop: 40,
    },
    headerButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
    profileSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', marginBottom: 20 },
    imageContainer: { position: 'relative', marginBottom: 15 },
    imageWrapper: { position: 'relative' },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#1abc9c' },
    placeholderImage: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#1abc9c',
        justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#16a085'
    },
    placeholderText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    cameraIcon: {
        position: 'absolute', bottom: 5, right: 5, backgroundColor: '#1abc9c',
        borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center'
    },
    removeIcon: {
        position: 'absolute', top: -5, right: -5, backgroundColor: '#e74c3c',
        borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center'
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#2d3436', marginBottom: 5 },
    userEmail: { fontSize: 16, color: '#636e72' },
    infoSection: {
        backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12,
        padding: 20, marginBottom: 20, elevation: 2
    },
    infoItem: { marginBottom: 20 },
    label: { fontSize: 16, color: '#636e72', marginBottom: 8, fontWeight: '600' },
    value: { fontSize: 18, color: '#2d3436', fontWeight: '500' },
    buttonSection: { paddingHorizontal: 20, paddingBottom: 30, gap: 10 },
});