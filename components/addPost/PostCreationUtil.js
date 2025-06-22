import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Limite do Firestore para string: 1MB (1048487 bytes)
export const FIRESTORE_IMAGE_LIMIT = 1048487;

export const requestCameraPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
        Alert.alert(
            'Permissão necessária',
            'Precisamos de permissão para acessar a câmera para que você possa tirar fotos.'
        );
        return false;
    }
    return true;
};

export const requestGalleryPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
        Alert.alert(
            'Permissão necessária',
            'Precisamos de permissão para acessar a galeria para que você possa escolher fotos.'
        );
        return false;
    }
    return true;
};

export const requestLocationPermissions = async () => {
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
        Alert.alert(
            'Permissão de localização',
            'A permissão de localização foi negada. Você ainda pode adicionar a localização manualmente.'
        );
        return false;
    }
    return true;
};

export const compressImageUntilLimit = async (pickFn) => {
    let quality = 0.7;
    let result;
    let base64Image = '';
    do {
        result = await pickFn(quality);
        if (result.canceled) return { canceled: true };
        base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        if (base64Image.length <= FIRESTORE_IMAGE_LIMIT) break;
        quality -= 0.1;
    } while (quality >= 0.1);
    return { base64Image, canceled: false };
};

export const pickImageFromGallery = async () => {
    const hasPermission = await requestGalleryPermissions();
    if (!hasPermission) return { canceled: true };

    try {
        const pickFn = async (quality) => await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality,
            base64: true,
        });
        return await compressImageUntilLimit(pickFn);
    } catch (error) {
        console.error('Erro ao escolher imagem:', error);
        Alert.alert('Erro', 'Não foi possível escolher a imagem. Tente novamente.');
        return { canceled: true };
    }
};

export const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return { canceled: true };

    try {
        const pickFn = async (quality) => await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality,
            base64: true,
        });
        return await compressImageUntilLimit(pickFn);
    } catch (error) {
        console.error('Erro ao tirar foto:', error);
        Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
        return { canceled: true };
    }
};

export const getCurrentLocationAddress = async () => {
    try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            return { success: false, message: 'Permissão negada' };
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
            
            return { success: true, location: locationString };
        } else {
            return { success: true, location: 'Localização encontrada' };
        }
    } catch (error) {
        console.error('Erro ao obter localização:', error);
        return { success: false, message: error.message || 'Não foi possível obter sua localização' };
    }
};