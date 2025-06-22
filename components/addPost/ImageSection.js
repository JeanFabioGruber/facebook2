import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ImageSection = ({ image, onChangeImage, onRemoveImage }) => {
    if (image) {
        return (
            <View style={styles.imageSection}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                    <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={onChangeImage}
                    >
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={onRemoveImage}
                    >
                        <Ionicons name="close-circle" size={30} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.imageSection}>
            <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={onChangeImage}
            >
                <Ionicons name="camera" size={32} color="#1abc9c" />
                <Text style={styles.addPhotoText}>Adicionar Foto</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default ImageSection;