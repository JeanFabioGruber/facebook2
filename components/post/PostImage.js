import { 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Dimensions
} from 'react-native';

const windowWidth = Dimensions.get('window').width;

const PostImage = ({ images, onImagePress }) => {
    const validImages = Array.isArray(images) ? images : (typeof images === 'string' ? [images] : []);
    
    if (validImages.length === 0) return null;
    
    if (validImages.length === 1) {
        return (
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => onImagePress(validImages[0])}
            >
                <Image
                    source={{ uri: validImages[0] }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    }
    
    return (
        <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            style={styles.scrollContainer}
        >
            {validImages.map((img, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    activeOpacity={0.9} 
                    onPress={() => onImagePress(img)}
                >
                    <Image
                        source={{ uri: img }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: '#000',
    },
    image: {
        width: windowWidth,
        height: windowWidth > 400 ? 300 : 250,
    },
});

export default PostImage;