import React from 'react';
import { 
    Modal, 
    View, 
    Image, 
    TouchableWithoutFeedback, 
    ScrollView,
    StyleSheet 
} from 'react-native';

const ProfileImageModal = ({ visible, imageUri, onClose }) => {
    if (!imageUri) return null;
    
    return (
        <Modal 
            visible={visible} 
            transparent 
            animationType="fade" 
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollViewContent}
                        minimumZoomScale={1}
                        maximumZoomScale={4}
                        centerContent={true}
                    >
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                        />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        width: '100%',
        height: '100%',
    },
    scrollViewContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 400,
        resizeMode: 'contain',
    },
});

export default ProfileImageModal;