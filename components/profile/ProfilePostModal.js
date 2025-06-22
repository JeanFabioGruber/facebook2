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

const ProfilePostModal = ({ isVisible, onClose, onDelete }) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Opções da publicação</Text>
                        
                        <TouchableOpacity
                            style={[styles.modalOption, styles.modalOptionDanger]}
                            onPress={onDelete}
                        >
                            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                            <Text style={styles.modalOptionTextDanger}>Excluir publicação</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalOptionDanger: {
        backgroundColor: '#fff',
        borderColor: '#e74c3c',
    },
    modalOptionTextDanger: {
        fontSize: 16,
        color: '#e74c3c',
        marginLeft: 12,
        fontWeight: '500',
    },
    modalCancelButton: {
        marginTop: 5,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#636e72',
        fontWeight: '500',
    },
});

export default ProfilePostModal;