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
    Platform
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
    const currentUser = auth.currentUser;

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        // Solicitar permissões da câmera
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar a câmera para que você possa tirar fotos.'
            );
        }

        // Solicitar permissões da galeria
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar a galeria para que você possa escolher fotos.'
            );
        }

        // Solicitar permissões de localização
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
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                
                // Verificar tamanho da imagem
                if (base64Image.length > 1000000) { // 1MB
                    Alert.alert(
                        'Imagem muito grande',
                        'Por favor, tire uma foto com qualidade menor ou escolha uma imagem menor.'
                    );
                    return;
                }
                
                setImage(base64Image);
            }
        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                
                // Verificar tamanho da imagem
                if (base64Image.length > 1000000) { // 1MB
                    Alert.alert(
                        'Imagem muito grande',
                        'Por favor, escolha uma imagem menor.'
                    );
                    return;
                }
                
                setImage(base64Image);
            }
        } catch (error) {
            console.error('Erro ao escolher imagem:', error);
            Alert.alert('Erro', 'Não foi possível escolher a imagem. Tente novamente.');
        }
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

            // Fazer geocoding reverso para obter o endereço
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

    const showImagePicker = () => {
        Alert.alert(
            'Selecionar Imagem',
            'Escolha uma opção:',
            [
                { text: 'Tirar Foto', onPress: takePhoto },
                { text: 'Escolher da Galeria', onPress: pickImage },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
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
            
            Alert.alert(
                'Sucesso!',
                'Sua publicação foi criada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Limpar campos
                            setImage(null);
                            setDescription('');
                            setLocation('');
                            // Voltar para a tela anterior
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', 'Não foi possível criar a publicação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    <View style={styles.imageSection}>
                        {image ? (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: image }} style={styles.selectedImage} />
                                <TouchableOpacity 
                                    style={styles.removeImageButton}
                                    onPress={removeImage}
                                >
                                    <Ionicons name="close-circle" size={30} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.imagePlaceholder}
                                onPress={showImagePicker}
                            >
                                <Ionicons name="camera" size={48} color="#b2bec3" />
                                <Text style={styles.imagePlaceholderText}>Toque para adicionar uma foto</Text>
                            </TouchableOpacity>
                        )}
                    </View>

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

                    {/* Botões de ação */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={showImagePicker}
                        >
                            <Ionicons name="image" size={24} color="#1abc9c" />
                            <Text style={styles.actionButtonText}>
                                {image ? 'Alterar Foto' : 'Adicionar Foto'}
                            </Text>
                        </TouchableOpacity>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
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
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    imagePlaceholder: {
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#b2bec3',
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
    actionButtons: {
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    actionButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#2d3436',
        fontWeight: '500',
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