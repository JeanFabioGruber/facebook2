import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, signOut, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AccountHeader from '../components/account/AccountHeader';
import ProfileImageSection from '../components/account/ProfileImageSection';
import UserInfoSection from '../components/account/UserInfoSection';
import ProfileImageModal from '../components/account/ProfileImageModal1';
import ActionButtons from '../components/account/ActionButtons';
import { pickImageFromGallery, takePhotoWithCamera } from '../components/account/AccountUtils';

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
                try {
                    const docSnap = await getDoc(doc(db, "users", user.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(data);
                        setTempData(data);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                    Alert.alert("Erro", "Não foi possível carregar seus dados");
                }
            }
        };
        
        fetchUserData();
    }, []);

    const saveImageToDatabase = async (imageData) => {
        try {
            await updateDoc(doc(db, "users", user.uid), { profileImage: imageData });
            setUserData(prev => ({ ...prev, profileImage: imageData }));
            return true;
        } catch (error) {
            console.error('Erro ao salvar imagem:', error);
            Alert.alert('Erro', 'Não foi possível salvar a imagem');
            return false;
        }
    };

    const handleGallerySelect = async () => {
        const imageBase64 = await pickImageFromGallery();
        if (imageBase64) {
            setTempData(prev => ({ ...prev, profileImage: imageBase64 }));
            
            if (!isEditing) {
                await saveImageToDatabase(imageBase64);
            }
        }
    };
    
    const handleTakePhoto = async () => {
        const imageBase64 = await takePhotoWithCamera();
        if (imageBase64) {
            setTempData(prev => ({ ...prev, profileImage: imageBase64 }));
            
            if (!isEditing) {
                await saveImageToDatabase(imageBase64);
            }
        }
    };

    const handleRemovePhoto = async () => {
        Alert.alert('Remover Foto', 'Deseja remover a foto de perfil?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Remover', 
                onPress: async () => {
                    setTempData(prev => ({ ...prev, profileImage: null }));
                    
                    if (!isEditing) {
                        try {
                            await updateDoc(doc(db, "users", user.uid), { profileImage: null });
                            setUserData(prev => ({ ...prev, profileImage: null }));
                        } catch (error) {
                            console.error('Erro ao remover foto:', error);
                            Alert.alert('Erro', 'Não foi possível remover a foto');
                        }
                    }
                }
            },
        ]);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setTempData(userData);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = async () => {
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
            Alert.alert(
                'Erro', 
                error.code === 'resource-exhausted' 
                    ? 'Imagem muito grande.' 
                    : 'Não foi possível salvar'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Confirmar', 'Deseja realmente sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', onPress: () => signOut(auth) }
        ]);
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Modal para seleção de imagem */}
            <ProfileImageModal
                visible={showImageModal}
                onClose={() => setShowImageModal(false)}
                onGalleryPress={() => {
                    setShowImageModal(false);
                    handleGallerySelect();
                }}
                onCameraPress={() => {
                    setShowImageModal(false);
                    handleTakePhoto();
                }}
                onRemovePress={() => {
                    setShowImageModal(false);
                    handleRemovePhoto();
                }}
                hasProfileImage={!!tempData.profileImage}
            />
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Header com botões de navegação */}
                <AccountHeader
                    onBackPress={() => navigation.goBack()}
                    isEditing={isEditing}
                    onEditToggle={handleEditToggle}
                />

                {/* Seção de imagem de perfil */}
                <ProfileImageSection
                    profileImage={tempData.profileImage}
                    userName={tempData.nome}
                    onImagePress={() => setShowImageModal(true)}
                />

                {/* Seção de informações do usuário */}
                <UserInfoSection
                    userData={tempData}
                    onChangeNome={(value) => setTempData(prev => ({ ...prev, nome: value }))}
                    onChangeTelefone={(value) => setTempData(prev => ({ ...prev, telefone: value }))}
                    onChangeBio={(value) => setTempData(prev => ({ ...prev, bio: value }))}
                    email={user.email}
                    isEditing={isEditing}
                />

                {/* Seção de botões de ação */}
                <ActionButtons
                    isEditing={isEditing}
                    onSave={handleSaveChanges}
                    onCancel={() => {
                        setTempData(userData);
                        setIsEditing(false);
                    }}
                    onLogout={handleLogout}
                    loading={loading}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f6fa',
    },
    scrollContainer: {
        flex: 1,
    }
});