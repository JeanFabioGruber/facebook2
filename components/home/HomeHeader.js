import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeader = ({onAddPost, onProfile }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Feed</Text>
            <View style={styles.headerButtons}>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={onAddPost}
                >
                    <Ionicons name="add-circle-outline" size={28} color="#1abc9c" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={onProfile}
                >
                    <Ionicons name="person-circle-outline" size={28} color="#1abc9c" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1abc9c',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 15,
        padding: 5,
    },
});

export default HomeHeader;