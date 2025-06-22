import { 
    Modal, 
    TouchableWithoutFeedback, 
    View, 
    Image, 
    StyleSheet 
} from 'react-native';

const ImageZoomModal = ({ isVisible, imageUri, onClose }) => {
    if (!imageUri) return null;
    
    return (
        <Modal 
            visible={isVisible} 
            transparent 
            animationType="fade" 
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.zoomImage}
                        resizeMode="contain"
                    />
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    zoomImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
});

export default ImageZoomModal;