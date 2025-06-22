import React from 'react';
import { 
    Modal,
    View, 
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ImagePickerModal = ({ 
    visible, 
    onClose, 
    onPickFromGallery, 
    onTakePhoto, 
    onContinueWithoutPhoto,
    hasExistingImage = false,
    onRemoveImage
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Adicionar Foto</Text>
                            <Text style={styles.modalSubtitle}>Como você gostaria de adicionar uma foto?</Text>
                            
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={onPickFromGallery}
                            >
                                <Ionicons name="images" size={24} color="#1abc9c" />
                                <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={onTakePhoto}
                            >
                                <Ionicons name="camera" size={24} color="#1abc9c" />
                                <Text style={styles.modalOptionText}>Tirar Foto</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalOption, styles.modalOptionSecondary]}
                                onPress={onContinueWithoutPhoto}
                            >
                                <Ionicons name="text" size={24} color="#636e72" />
                                <Text style={[styles.modalOptionText, styles.modalOptionTextSecondary]}>
                                    Continuar sem foto
                                </Text>
                            </TouchableOpacity>
                            
                            {hasExistingImage && (
                                <TouchableOpacity
                                    style={[styles.modalOption, styles.modalOptionDanger]}
                                    onPress={onRemoveImage}
                                >
                                    <Ionicons name="trash" size={24} color="#e74c3c" />
                                    <Text style={[styles.modalOptionText, styles.modalOptionTextDanger]}>
                                        Remover foto
                                    </Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    modalOptionDanger: {
        backgroundColor: '#fff',
        borderColor: '#e74c3c',
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
    modalOptionTextDanger: {
        color: '#e74c3c',
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
});

export default ImagePickerModal;