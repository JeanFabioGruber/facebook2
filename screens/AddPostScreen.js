import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddPostScreen({ navigation }) {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(true);
    const [imageSelected, setImageSelected] = useState(false); 
    const currentUser = auth.currentUser;

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar a câmera para que você possa tirar fotos.'
            );
        }
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar a galeria para que você possa escolher fotos.'
            );
        }
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
            Alert.alert(
                'Permissão de localização',
                'A permissão de localização foi negada. Você ainda pode adicionar a localização manualmente.'
            );
        }
    };

    const takePhoto = async () => {
        try {
            setShowImageModal(false);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                if (base64Image.length > 1000000) {
                    Alert.alert(
                        'Imagem muito grande',
                        'Por favor, tire uma foto com qualidade menor ou escolha uma imagem menor.'
                    );
                    setShowImageModal(true);
                    return;
                }
                
                setImage(base64Image);
                setImageSelected(true);
            } else {
                navigation.goBack();
            }
        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
            navigation.goBack();
        }
    };

    const pickImage = async () => {
        try {
            setShowImageModal(false);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;               
                if (base64Image.length > 1000000) { 
                    Alert.alert(
                        'Imagem muito grande',
                        'Por favor, escolha uma imagem menor.'
                    );
                    setShowImageModal(true);
                    return;
                }
                
                setImage(base64Image);
                setImageSelected(true);
            } else {               
                navigation.goBack();
            }
        } catch (error) {
            console.error('Erro ao escolher imagem:', error);
            Alert.alert('Erro', 'Não foi possível escolher a imagem. Tente novamente.');
            navigation.goBack();
        }
    };

    const continueWithoutPhoto = () => {
        setShowImageModal(false);
        setImageSelected(true);
    };

    const closeModal = () => {
        setShowImageModal(false);
        navigation.goBack();
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permissão negada',
                    'Não foi possível obter sua localização. Você pode digitar manualmente.'
                );
                setLocationLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const geocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (geocode.length > 0) {
                const address = geocode[0];
                let locationString = '';
                
                if (address.city && address.region) {
                    locationString = `${address.city}, ${address.region}`;
                } else if (address.city) {
                    locationString = address.city;
                } else if (address.region) {
                    locationString = address.region;
                } else {
                    locationString = 'Localização encontrada';
                }
                
                setLocation(locationString);
            } else {
                setLocation('Localização encontrada');
            }
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
        } finally {
            setLocationLoading(false);
        }
    };

    const changeImage = () => {
        setShowImageModal(true);
    };

    const removeImage = () => {
        Alert.alert(
            'Remover Imagem',
            'Deseja remover a imagem selecionada?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', onPress: () => setImage(null) },
            ]
        );
    };

    const createPost = async () => {
        if (!image && !description.trim()) {
            Alert.alert('Erro', 'Adicione uma imagem ou descrição para criar a publicação.');
            return;
        }

        if (!currentUser) {
            Alert.alert('Erro', 'Você precisa estar logado para criar uma publicação.');
            return;
        }

        setLoading(true);
        try {
            const postData = {
                userId: currentUser.uid,
                description: description.trim(),
                imageUrl: image,
                location: location.trim() || null,
                createdAt: serverTimestamp(),
                likes: 0,
                comments: 0,
            };

            await addDoc(collection(db, 'posts'), postData);            
          
            navigation.navigate('Home', { 
                refresh: true,
                newPost: true
            });
            
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', 'Não foi possível criar a publicação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Modal de seleção de imagem */}
            <Modal
                visible={showImageModal}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Adicionar Foto</Text>
                                <Text style={styles.modalSubtitle}>Como você gostaria de adicionar uma foto?</Text>
                                
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="images" size={24} color="#1abc9c" />
                                    <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={takePhoto}
                                >
                                    <Ionicons name="camera" size={24} color="#1abc9c" />
                                    <Text style={styles.modalOptionText}>Tirar Foto</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.modalOption, styles.modalOptionSecondary]}
                                    onPress={continueWithoutPhoto}
                                >
                                    <Ionicons name="text" size={24} color="#636e72" />
                                    <Text style={[styles.modalOptionText, styles.modalOptionTextSecondary]}>
                                        Continuar sem foto
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.modalCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {imageSelected && (
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.headerButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Nova Publicação</Text>
                        <TouchableOpacity 
                            onPress={createPost}
                            style={[styles.headerButton, styles.publishButton]}
                            disabled={loading}
                        >
                            <Text style={styles.publishButtonText}>
                                {loading ? 'Publicando...' : 'Publicar'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Área da imagem */}
                        {image && (
                            <View style={styles.imageSection}>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: image }} style={styles.selectedImage} />
                                    <TouchableOpacity 
                                        style={styles.changeImageButton}
                                        onPress={changeImage}
                                    >
                                        <Ionicons name="pencil" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.removeImageButton}
                                        onPress={removeImage}
                                    >
                                        <Ionicons name="close-circle" size={30} color="#e74c3c" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Botão para adicionar foto se não tiver */}
                        {!image && (
                            <View style={styles.imageSection}>
                                <TouchableOpacity 
                                    style={styles.addPhotoButton}
                                    onPress={changeImage}
                                >
                                    <Ionicons name="camera" size={32} color="#1abc9c" />
                                    <Text style={styles.addPhotoText}>Adicionar Foto</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Campo de descrição */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Descrição</Text>
                            <TextInput
                                style={styles.descriptionInput}
                                placeholder="No que você está pensando?"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.characterCount}>
                                {description.length}/500
                            </Text>
                        </View>

                        {/* Campo de localização */}
                        <View style={styles.inputSection}>
                            <View style={styles.locationHeader}>
                                <Text style={styles.inputLabel}>Localização</Text>
                                <TouchableOpacity 
                                    onPress={getCurrentLocation}
                                    style={styles.locationButton}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? (
                                        <ActivityIndicator size="small" color="#1abc9c" />
                                    ) : (
                                        <Ionicons name="location" size={20} color="#1abc9c" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.locationInput}
                                placeholder="Adicione uma localização"
                                value={location}
                                onChangeText={setLocation}
                                maxLength={100}
                            />
                        </View>
                    </ScrollView>

                    {/* Loading overlay */}
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#1abc9c" />
                            <Text style={styles.loadingText}>Criando publicação...</Text>
                        </View>
                    )}
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#636e72',
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalOptionSecondary: {
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#2d3436',
        marginLeft: 12,
        fontWeight: '500',
    },
    modalOptionTextSecondary: {
        color: '#636e72',
    },
    modalCancelButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#e74c3c',
        fontWeight: '500',
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
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    publishButton: {
        backgroundColor: '#1abc9c',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    imageSection: {
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    addPhotoButton: {
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1abc9c',
        borderStyle: 'dashed',
    },
    addPhotoText: {
        marginTop: 8,
        fontSize: 16,
        color: '#1abc9c',
        fontWeight: '500',
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    descriptionInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        minHeight: 100,
        textAlignVertical: 'top',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    characterCount: {
        textAlign: 'right',
        marginTop: 5,
        fontSize: 12,
        color: '#636e72',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationButton: {
        padding: 5,
    },
    locationInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
});