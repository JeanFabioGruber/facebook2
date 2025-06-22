import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para usar a câmera é necessária!');
        return false;
    }
    return true;
};

export const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para acessar galeria é necessária!');
        return false;
    }
    return true;
};

export const pickImageFromGallery = async () => {
    if (!(await requestGalleryPermission())) return null;
    
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });
        
        if (!result.canceled && result.assets && result.assets[0]) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            
            if (base64Image.length > 900000) {
                Alert.alert('Imagem muito grande', 'Por favor, escolha uma imagem menor.');
                return null;
            }
            
            return base64Image;
        }
        
        return null;
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        return null;
    }
};

export const takePhotoWithCamera = async () => {
    if (!(await requestCameraPermission())) return null;
    
    try {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });
        
        if (!result.canceled && result.assets && result.assets[0]) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            
            if (base64Image.length > 900000) {
                Alert.alert('Imagem muito grande', 'Por favor, tire uma foto de menor resolução.');
                return null;
            }
            
            return base64Image;
        }
        
        return null;
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível tirar a foto');
        return null;
    }
};