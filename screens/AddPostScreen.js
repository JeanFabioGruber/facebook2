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
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';

export default function AddPostScreen({ navigation }) {
    const [images, setImages] = useState([]); // Troca image por images (array)
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(true);
    const [imageSelected, setImageSelected] = useState(false); 
    const [tags, setTags] = useState([]); // Novo estado para tags
    const [tagInput, setTagInput] = useState(''); // Estado para input de tag
    const [imageLoading, setImageLoading] = useState(false); // Novo estado para loading de imagem
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

    // Detecta dinamicamente o tipo de media para máxima compatibilidade
    const getImagePickerMediaType = () => {
        if (ImagePicker.MediaType && ImagePicker.MediaType.IMAGE) {
            return [ImagePicker.MediaType.IMAGE];
        }
        if (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) {
            return ImagePicker.MediaTypeOptions.Images;
        }
        // Fallback para string
        return 'Images';
    };

    const takePhoto = async () => {
        try {
            setImageLoading(true);
            setShowImageModal(false);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: getImagePickerMediaType(),
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });
            setImageLoading(false);
            if (!result.canceled) {
                const asset = result.assets[0];
                let base64Image = asset.base64;
                if (!base64Image.startsWith('data:image')) {
                    base64Image = `data:image/jpeg;base64,${base64Image}`;
                }
                setImages(prev => [...prev, base64Image]);
                setImageSelected(true);
            } else {
                navigation.goBack();
            }
        } catch (error) {
            setImageLoading(false);
            console.error('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
            navigation.goBack();
        }
    };

    const pickImage = async () => {
        try {
            setImageLoading(true);
            setShowImageModal(false);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: getImagePickerMediaType(),
                allowsMultipleSelection: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
                selectionLimit: 0 // 0 = sem limite
            });
            setImageLoading(false);
            if (!result.canceled) {
                const newImages = result.assets.map(asset => {
                    let base64Image = asset.base64;
                    if (!base64Image.startsWith('data:image')) {
                        base64Image = `data:image/jpeg;base64,${base64Image}`;
                    }
                    return base64Image;
                });
                setImages(prev => [...prev, ...newImages]);
                setImageSelected(true);
            } else {
                navigation.goBack();
            }
        } catch (error) {
            setImageLoading(false);
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

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (images.length === 1) setImageSelected(false);
    };

    const addTag = () => {
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const uploadImagesAndGetUrls = async (images, userId) => {
        const storage = getStorage();
        const urls = [];
        for (let i = 0; i < images.length; i++) {
            let image = images[i];
            // Garante formato data_url
            if (!image.startsWith('data:image')) {
                image = `data:image/jpeg;base64,${image}`;
            }
            const imageRef = ref(storage, `posts/${userId}_${Date.now()}_${i}.jpg`);
            try {
                await uploadString(imageRef, image, 'data_url');
            } catch (err) {
                // Fallback: tenta converter para blob e usar uploadBytes
                try {
                    const base64 = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let j = 0; j < byteCharacters.length; j++) {
                        byteNumbers[j] = byteCharacters.charCodeAt(j);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    await uploadBytes(imageRef, byteArray, { contentType: 'image/jpeg' });
                } catch (err2) {
                    throw new Error('Falha ao fazer upload da imagem.');
                }
            }
            const url = await getDownloadURL(imageRef);
            urls.push(url);
        }
        return urls;
    };

    const createPost = async () => {
        if (images.length === 0 && !description.trim()) {
            Alert.alert('Erro', 'Adicione uma imagem ou descrição para criar a publicação.');
            return;
        }
        if (!currentUser) {
            Alert.alert('Erro', 'Você precisa estar logado para criar uma publicação.');
            return;
        }
        setLoading(true);
        try {
            let imageUrls = [];
            if (images.length > 0) {
                imageUrls = await uploadImagesAndGetUrls(images, currentUser.uid);
            }
            const postData = {
                userId: currentUser.uid,
                description: description.trim(),
                imageUrls: imageUrls,
                location: location.trim() || null,
                tags: tags,
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
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 30 : 0 }]}>
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
                        {images.length > 0 && (
                            <View style={styles.imageSection}>
                                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                                    {images.map((img, idx) => (
                                        <View key={idx} style={styles.imageContainer}>
                                            <Image source={{ uri: img }} style={styles.selectedImage} />
                                            <TouchableOpacity 
                                                style={styles.changeImageButton}
                                                onPress={changeImage}
                                            >
                                                <Ionicons name="pencil" size={20} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(idx)}
                                            >
                                                <Ionicons name="close-circle" size={30} color="#e74c3c" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Botão para adicionar foto se não tiver */}
                        {images.length === 0 && (
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

                        {/* Campo de tags */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Tags (ex: esporte, futebol, corrida)</Text>
                            <View style={styles.tagsInputRow}>
                                <TextInput
                                    style={styles.tagInput}
                                    placeholder="Adicionar tag"
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                    onSubmitEditing={addTag}
                                    maxLength={20}
                                />
                                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tagsContainer}>
                                {tags.map(tag => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                        <TouchableOpacity onPress={() => removeTag(tag)}>
                                            <Ionicons name="close-circle" size={18} color="#e74c3c" style={{ marginLeft: 2 }} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Loading overlay */}
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#1abc9c" />
                            <Text style={styles.loadingText}>Criando publicação...</Text>
                        </View>
                    )}

                    {/* Adiciona overlay de loading de imagem */}
                    {imageLoading && (
                        <View style={styles.imageLoadingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.imageLoadingText}>Carregando imagens...</Text>
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
        marginRight: 12,
    },
    selectedImage: {
        width: 180,
        height: 180,
        borderRadius: 12,
        marginRight: 12,
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
    tagsInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tagInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 8,
    },
    addTagButton: {
        backgroundColor: '#1abc9c',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 6,
    },
    tagText: {
        color: '#16a085',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 2,
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
    imageLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
    },
    imageLoadingText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 16,
        fontWeight: 'bold',
    },
});