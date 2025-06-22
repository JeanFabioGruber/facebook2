import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AddPostHeader from '../components/addPost/AddPostHeader';
import ImageSection from '../components/addPost/ImageSection';
import ImagePickerModal from '../components/addPost/ImagePickerModal';
import DescriptionInput from '../components/addPost/DescriptionInput';
import LocationInput from '../components/addPost/LocationInput';
import TagInput from '../components/addPost/TagInput';
import LoadingOverlay from '../components/LoadingOverlay';

import { 
    pickImageFromGallery,
    takePhotoWithCamera,
    getCurrentLocationAddress
} from '../components/addPost/PostCreationUtil';

export default function AddPostScreen({ navigation }) {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(true);
    const [imageSelected, setImageSelected] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    
    const currentUser = auth.currentUser;

    const handlePickImage = async () => {
        setShowImageModal(false);
        const { base64Image, canceled } = await pickImageFromGallery();
        
        if (!canceled) {
            setImage(base64Image);
            setImageSelected(true);
        } else {
            navigation.goBack();
        }
    };

    const handleTakePhoto = async () => {
        setShowImageModal(false);
        const { base64Image, canceled } = await takePhotoWithCamera();
        
        if (!canceled) {
            setImage(base64Image);
            setImageSelected(true);
        } else {
            navigation.goBack();
        }
    };

    const handleContinueWithoutPhoto = () => {
        setShowImageModal(false);
        setImageSelected(true);
    };

    const showImageOptions = () => {
        setShowImageModal(true);
    };

    const handleGetCurrentLocation = async () => {
        setLocationLoading(true);
        const result = await getCurrentLocationAddress();
        
        if (result.success) {
            setLocation(result.location);
        } else {
            Alert.alert('Erro', result.message || 'Não foi possível obter sua localização');
        }
        setLocationLoading(false);
    };

    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleRemoveImage = () => {
        Alert.alert(
            'Remover Imagem',
            'Deseja remover a imagem selecionada?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', onPress: () => setImage(null) },
            ]
        );
    };

    const handleCreatePost = async () => {
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
                tags: tags,
            };

            await addDoc(collection(db, 'posts'), postData);            
            
            navigateWithLoading('Home', { 
                refresh: true,
                newPost: true
            });
            
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', 'Não foi possível criar a publicação. Tente novamente.');
            setLoading(false);
        }
    };
    const navigateWithLoading = (screen, params = {}) => {
        setGlobalLoading(true);
        setTimeout(() => {
            setGlobalLoading(false);
            navigation.navigate(screen, params);
        }, 400);
    };

    return (
    <SafeAreaView style={styles.container}>
        <LoadingOverlay 
            visible={globalLoading || loading} 
            text={loading ? 'Criando publicação...' : 'Carregando...'} 
        />
        
        <ImagePickerModal
            visible={showImageModal}
            onClose={() => navigation.goBack()}
            onPickFromGallery={handlePickImage}
            onTakePhoto={handleTakePhoto}
            onContinueWithoutPhoto={handleContinueWithoutPhoto}
            hasExistingImage={!!image}
            onRemoveImage={handleRemoveImage}
        />

        {imageSelected && (
            <View style={styles.mainContent}>
                <View style={styles.headerContainer}>
                    <AddPostHeader
                        onBack={() => navigateWithLoading('Home')}
                        onPublish={handleCreatePost}
                        loading={loading}
                    />
                </View>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView 
                        style={styles.content} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <ImageSection
                            image={image}
                            onChangeImage={showImageOptions}
                            onRemoveImage={handleRemoveImage}
                        />
                        
                        <DescriptionInput
                            value={description}
                            onChangeText={setDescription}
                            maxLength={500}
                        />
                        
                        <LocationInput
                            value={location}
                            onChangeText={setLocation}
                            onGetCurrentLocation={handleGetCurrentLocation}
                            isLoading={locationLoading}
                        />
                        
                        <TagInput
                            tags={tags}
                            tagInput={tagInput}
                            onTagInputChange={setTagInput}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        )}
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    mainContent: {
        flex: 1,
    },
    headerContainer: {        
        paddingTop: 25,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40, 
    }
});