import React from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    StyleSheet 
} from 'react-native';

const ProfileImageModal = ({ 
    visible, 
    onClose, 
    onGalleryPress, 
    onCameraPress, 
    onRemovePress,
    hasProfileImage = false
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
                            <Text style={styles.modalTitle}>Selecionar Foto</Text>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={onGalleryPress}
                            >
                                <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={onCameraPress}
                            >
                                <Text style={styles.modalOptionText}>Tirar Foto</Text>
                            </TouchableOpacity>
                            
                            {hasProfileImage && (
                                <TouchableOpacity
                                    style={styles.modalOptionDanger}
                                    onPress={onRemovePress}
                                >
                                    <Text style={styles.modalOptionTextDanger}>Remover Foto</Text>
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
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
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
    },
    modalTitle: { 
        fontSize: 17, 
        fontWeight: '600', 
        marginBottom: 10, 
        color: '#222', 
        textAlign: 'center' 
    },
    modalOption: { 
        paddingVertical: 14, 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderColor: '#f0f0f0' 
    },
    modalOptionDanger: { 
        paddingVertical: 14, 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderColor: '#f0f0f0' 
    },
    modalOptionText: { 
        fontSize: 16, 
        color: '#1abc9c', 
        fontWeight: '500' 
    },
    modalOptionTextDanger: { 
        fontSize: 16, 
        color: '#e74c3c', 
        fontWeight: '500' 
    },
    modalCancelButton: { 
        paddingVertical: 14, 
        alignItems: 'center' 
    },
    modalCancelText: { 
        fontSize: 16, 
        color: '#636e72', 
        fontWeight: '500' 
    },
});

export default ProfileImageModal;